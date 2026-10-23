// Plain JavaScript dashboard. Polls the Node.js API every 2 seconds.
const API = ""; // same origin when served by the backend. Use "http://localhost:5000" if opened separately.
const POLL_MS = 2000;

const LIMITS = {
  temperature: { label: "Temperature", unit: "°C", warn: 85, crit: 100 },
  vibration: { label: "Vibration", unit: "mm/s", warn: 4.5, crit: 7 },
  pressure: { label: "Pressure", unit: "bar", warn: 9, crit: 11 },
  health: { label: "Health score", unit: "%", warn: null, crit: null },
};

let selectedId = null;
let selectedMetric = "temperature";
let lastDetail = null;

const $ = (id) => document.getElementById(id);

async function api(path, options) {
  const res = await fetch(API + path, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function levelOf(metric, value) {
  const l = LIMITS[metric];
  if (!l || l.crit === null) return "";
  if (value >= l.crit) return "crit";
  if (value >= l.warn) return "warn";
  return "";
}

// ---------- Rendering ----------
function renderSummary(s) {
  $("summary").innerHTML = `
    <div class="stat"><div class="value">${s.total}</div><div class="label">Machines</div></div>
    <div class="stat"><div class="value">${s.running}</div><div class="label">Running normally</div></div>
    <div class="stat warn"><div class="value">${s.warning}</div><div class="label">Warnings</div></div>
    <div class="stat crit"><div class="value">${s.critical}</div><div class="label">Critical</div></div>
    <div class="stat"><div class="value">${s.stopped}</div><div class="label">Stopped</div></div>
    <div class="stat"><div class="value">${s.avgHealth}%</div><div class="label">Average health</div></div>
    <div class="stat"><div class="value">${s.totalPowerKw}</div><div class="label">Power draw (kW)</div></div>`;
}

function renderList(items) {
  $("equipmentList").innerHTML = items
    .map(
      (m) => `
    <li>
      <button class="eq-btn ${m.id === selectedId ? "selected" : ""}" data-id="${m.id}">
        <span class="stripe ${m.status}"></span>
        <span>
          <span class="eq-name">${m.name}</span><br />
          <span class="eq-meta">${m.id} · ${m.zone} · ${m.status}</span>
        </span>
        <span class="eq-health">${m.health}%</span>
      </button>
    </li>`
    )
    .join("");
  document.querySelectorAll(".eq-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      selectedId = btn.dataset.id;
      refresh();
    })
  );
}

function renderDetail(m) {
  lastDetail = m;
  const metricBox = (key, value, unit, label) =>
    `<div class="metric ${levelOf(key, value)}"><div class="m-value">${value} <span class="m-unit">${unit}</span></div><div class="m-label">${label}</div></div>`;

  const running = m.status !== "stopped";
  $("detail").innerHTML = `
    <div class="detail-head">
      <div>
        <h2>${m.name}</h2>
        <div class="eq-meta">${m.id} · ${m.zone} · ${m.runtimeHours} h runtime</div>
      </div>
      <span class="badge ${m.status}">${m.status}</span>
    </div>

    <div class="metrics">
      ${metricBox("temperature", m.metrics.temperature, "°C", "Temperature")}
      ${metricBox("vibration", m.metrics.vibration, "mm/s", "Vibration")}
      ${metricBox("pressure", m.metrics.pressure, "bar", "Pressure")}
      ${metricBox("rpm", m.metrics.rpm, "rpm", "Speed")}
      ${metricBox("power", m.metrics.power, "kW", "Power")}
      ${metricBox("health", m.health, "%", "Health score")}
    </div>

    <div class="tabs" role="group" aria-label="Chart metric">
      ${Object.keys(LIMITS)
        .map((k) => `<button class="tab" data-metric="${k}" aria-pressed="${k === selectedMetric}">${LIMITS[k].label}</button>`)
        .join("")}
    </div>
    <canvas id="chart" width="800" height="240" aria-label="History chart"></canvas>

    <div class="actions">
      ${running ? `<button class="btn" data-action="stop">Stop machine</button>` : `<button class="btn primary" data-action="start">Start machine</button>`}
      <button class="btn primary" data-action="maintenance">Run maintenance</button>
    </div>`;

  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => {
      selectedMetric = t.dataset.metric;
      renderDetail(lastDetail);
    })
  );
  document.querySelectorAll("[data-action]").forEach((b) =>
    b.addEventListener("click", () => sendCommand(m.id, b.dataset.action))
  );
  drawChart(m.history);
}

function drawChart(history) {
  const canvas = $("chart");
  if (!canvas) return;
  const ratio = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, w, h);

  const data = history.map((p) => p[selectedMetric]);
  if (data.length < 2) return;
  const lim = LIMITS[selectedMetric];
  const pad = { l: 44, r: 12, t: 12, b: 22 };

  let min = Math.min(...data);
  let max = Math.max(...data);
  if (lim.warn !== null) { max = Math.max(max, lim.warn * 1.05); }
  if (selectedMetric === "health") { min = 0; max = 100; }
  else { min = Math.min(min, 0); }
  const range = max - min || 1;

  const x = (i) => pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
  const y = (v) => h - pad.b - ((v - min) / range) * (h - pad.t - pad.b);

  // grid + y labels
  ctx.font = "12px IBM Plex Sans, sans-serif";
  ctx.fillStyle = "#66707a";
  ctx.strokeStyle = "#e3e0d8";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = min + (range * i) / 4;
    const yy = y(v);
    ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke();
    ctx.fillText(v.toFixed(selectedMetric === "vibration" ? 1 : 0), 6, yy + 4);
  }

  // limit lines
  const line = (value, color) => {
    if (value === null || value > max) return;
    ctx.strokeStyle = color; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, y(value)); ctx.lineTo(w - pad.r, y(value)); ctx.stroke();
    ctx.setLineDash([]);
  };
  line(lim.warn, "#c9791a");
  line(lim.crit, "#c23b2b");

  // data line
  ctx.strokeStyle = "#263038";
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  ctx.stroke();

  ctx.fillStyle = "#263038";
  ctx.fillText(`last 2 min (${lim.unit})`, pad.l, h - 6);
}

function renderAlerts(list) {
  if (!list.length) {
    $("alerts").innerHTML = `<li><span></span><span class="empty">No alerts yet. Alerts appear when a machine drifts out of range.</span></li>`;
    return;
  }
  $("alerts").innerHTML = list
    .map((a) => {
      const t = new Date(a.time).toLocaleTimeString();
      return `<li><time>${t}</time><span class="${a.level}">${a.message}</span></li>`;
    })
    .join("");
}

// ---------- Data flow ----------
async function sendCommand(id, action) {
  try {
    await api(`/api/equipment/${id}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    refresh();
  } catch (e) {
    console.error(e);
  }
}

async function refresh() {
  try {
    const [summary, items, alerts] = await Promise.all([
      api("/api/summary"),
      api("/api/equipment"),
      api("/api/alerts"),
    ]);
    if (!selectedId && items.length) selectedId = items[0].id;

    renderSummary(summary);
    renderList(items);
    renderAlerts(alerts);
    if (selectedId) renderDetail(await api(`/api/equipment/${selectedId}`));

    $("conn").textContent = "Connected · updated " + new Date().toLocaleTimeString();
    $("conn").className = "conn ok";
  } catch (e) {
    $("conn").textContent = "Server unreachable. Is the backend running?";
    $("conn").className = "conn bad";
  }
}

refresh();
setInterval(refresh, POLL_MS);
window.addEventListener("resize", () => lastDetail && drawChart(lastDetail.history));
