// Digital twin simulator: every machine has a virtual "twin" whose state
// is updated on each tick, as if sensor data were arriving from the plant.

const HISTORY_LIMIT = 60;

// Alert limits for each metric.
const LIMITS = {
  temperature: { unit: "°C", warn: 85, crit: 100 },
  vibration: { unit: "mm/s", warn: 4.5, crit: 7 },
  pressure: { unit: "bar", warn: 9, crit: 11 },
};

const SEED = [
  { id: "HP-101", name: "Hydraulic Press", zone: "Press Shop", base: { temperature: 62, vibration: 2.1, pressure: 7.2, rpm: 1200, power: 38 } },
  { id: "CNC-204", name: "CNC Milling Centre", zone: "Machining Bay", base: { temperature: 55, vibration: 1.6, pressure: 5.0, rpm: 8000, power: 22 } },
  { id: "CV-310", name: "Belt Conveyor", zone: "Assembly Line", base: { temperature: 41, vibration: 1.2, pressure: 0.0, rpm: 450, power: 9 } },
  { id: "AC-405", name: "Air Compressor", zone: "Utility Room", base: { temperature: 70, vibration: 2.8, pressure: 8.0, rpm: 3000, power: 45 } },
  { id: "PM-512", name: "Coolant Pump", zone: "Machining Bay", base: { temperature: 48, vibration: 1.9, pressure: 4.2, rpm: 1750, power: 15 } },
];

const rand = (min, max) => Math.random() * (max - min) + min;
const round = (n, d = 1) => Number(n.toFixed(d));
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

class Simulator {
  constructor() {
    this.alerts = [];
    this.alertSeq = 1;
    this.machines = SEED.map((s) => this.createTwin(s));
    // Pre-fill history so charts are not empty on first load.
    for (let i = 0; i < 30; i++) this.machines.forEach((m) => this.step(m, false));
  }

  createTwin(seed) {
    return {
      id: seed.id,
      name: seed.name,
      zone: seed.zone,
      base: seed.base,
      status: "running", // running | warning | critical | stopped
      commandedOn: true,
      health: round(rand(88, 98)),
      runtimeHours: Math.floor(rand(1200, 9000)),
      stress: 0, // simulated fault drift (0 = healthy)
      peak: 0,
      rising: false,
      metrics: { ...seed.base },
      history: [],
    };
  }

  addAlert(machine, level, message) {
    this.alerts.unshift({
      id: this.alertSeq++,
      machineId: machine.id,
      machineName: machine.name,
      level, // info | warning | critical
      message,
      time: new Date().toISOString(),
    });
    this.alerts = this.alerts.slice(0, 50);
  }

  step(m, raiseAlerts = true) {
    const b = m.base;

    if (!m.commandedOn) {
      // Machine is stopped: cool down, no vibration.
      m.metrics.temperature = round(Math.max(25, m.metrics.temperature - 2));
      m.metrics.vibration = 0;
      m.metrics.pressure = round(Math.max(0, m.metrics.pressure - 0.5));
      m.metrics.rpm = 0;
      m.metrics.power = 0;
      m.status = "stopped";
    } else {
      // Random faults build up to a peak, then slowly ease off (or stop
      // immediately when an operator runs maintenance).
      if (m.stress === 0 && Math.random() < 0.012) {
        m.stress = 0.2;
        m.peak = rand(0.7, 1.4);
        m.rising = true;
      }
      if (m.stress > 0) {
        m.stress += m.rising ? rand(0.02, 0.06) : -rand(0.015, 0.04);
        if (m.rising && m.stress >= m.peak) m.rising = false;
        if (m.stress <= 0.05 && !m.rising) m.stress = 0;
        m.stress = clamp(m.stress, 0, 1.6);
      }

      const s = m.stress;
      m.metrics.temperature = round(b.temperature + s * 28 + rand(-2.5, 2.5));
      m.metrics.vibration = round(Math.max(0, b.vibration + s * 4.2 + rand(-0.3, 0.3)), 2);
      m.metrics.pressure = round(Math.max(0, b.pressure * (1 + s * 0.28) + rand(-0.2, 0.2)), 2);
      m.metrics.rpm = Math.round(b.rpm * (1 - s * 0.05) + rand(-b.rpm * 0.01, b.rpm * 0.01));
      m.metrics.power = round(b.power * (1 + s * 0.2) + rand(-1, 1));

      m.runtimeHours = round(m.runtimeHours + 2 / 3600, 2);
      m.health = round(clamp(m.health - s * 0.2 + (s === 0 ? 0.3 : 0), 5, 100));

      const prev = m.status;
      m.status = this.evaluate(m);
      if (raiseAlerts && prev !== m.status) {
        if (m.status === "warning") this.addAlert(m, "warning", `${m.id} is drifting above normal limits.`);
        if (m.status === "critical") this.addAlert(m, "critical", `${m.id} reached a critical level. Stop and inspect.`);
        if (m.status === "running" && prev !== "stopped") this.addAlert(m, "info", `${m.id} is back to normal.`);
      }
    }

    m.history.push({
      t: Date.now(),
      temperature: m.metrics.temperature,
      vibration: m.metrics.vibration,
      pressure: m.metrics.pressure,
      health: m.health,
    });
    if (m.history.length > HISTORY_LIMIT) m.history.shift();
  }

  evaluate(m) {
    const { temperature, vibration, pressure } = m.metrics;
    const v = { temperature, vibration, pressure };
    let level = "running";
    for (const key of Object.keys(LIMITS)) {
      if (v[key] >= LIMITS[key].crit) return "critical";
      if (v[key] >= LIMITS[key].warn) level = "warning";
    }
    if (m.health < 40) return "critical";
    if (m.health < 60) level = "warning";
    return level;
  }

  tick() {
    this.machines.forEach((m) => this.step(m));
  }

  // ---- Public API used by the routes ----
  list() {
    return this.machines.map(({ history, base, peak, rising, ...rest }) => rest);
  }

  get(id) {
    return this.machines.find((m) => m.id === id);
  }

  summary() {
    const count = (s) => this.machines.filter((m) => m.status === s).length;
    const avgHealth = this.machines.reduce((a, m) => a + m.health, 0) / this.machines.length;
    return {
      total: this.machines.length,
      running: count("running"),
      warning: count("warning"),
      critical: count("critical"),
      stopped: count("stopped"),
      avgHealth: round(avgHealth),
      totalPowerKw: round(this.machines.reduce((a, m) => a + m.metrics.power, 0)),
    };
  }

  command(id, action) {
    const m = this.get(id);
    if (!m) return null;
    if (action === "stop") {
      m.commandedOn = false;
      this.addAlert(m, "info", `${m.id} was stopped by operator.`);
    } else if (action === "start") {
      m.commandedOn = true;
      this.addAlert(m, "info", `${m.id} was started by operator.`);
    } else if (action === "maintenance") {
      m.stress = 0;
      m.rising = false;
      m.health = round(rand(94, 99));
      m.commandedOn = true;
      this.addAlert(m, "info", `Maintenance completed on ${m.id}. Health restored.`);
    } else {
      return { error: "Unknown action. Use start, stop or maintenance." };
    }
    this.step(m, false); // reflect the command right away
    return { ok: true };
  }
}

module.exports = { Simulator, LIMITS };
