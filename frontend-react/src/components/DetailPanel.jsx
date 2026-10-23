import { useState } from "react";
import Chart from "./Chart.jsx";

const LIMITS = {
  temperature: { label: "Temperature", unit: "°C", warn: 85, crit: 100 },
  vibration: { label: "Vibration", unit: "mm/s", warn: 4.5, crit: 7 },
  pressure: { label: "Pressure", unit: "bar", warn: 9, crit: 11 },
  health: { label: "Health score", unit: "%", warn: null, crit: null },
};

function levelOf(metric, value) {
  const l = LIMITS[metric];
  if (!l || l.crit === null) return "";
  if (value >= l.crit) return "crit";
  if (value >= l.warn) return "warn";
  return "";
}

function Metric({ id, value, unit, label }) {
  return (
    <div className={`metric ${levelOf(id, value)}`}>
      <div className="m-value">
        {value} <span className="m-unit">{unit}</span>
      </div>
      <div className="m-label">{label}</div>
    </div>
  );
}

export default function DetailPanel({ twin, onCommand }) {
  const [metric, setMetric] = useState("temperature");

  if (!twin) {
    return (
      <section className="panel detail-panel">
        <p className="empty">Select a machine to see its digital twin.</p>
      </section>
    );
  }

  const m = twin.metrics;
  const running = twin.status !== "stopped";

  return (
    <section className="panel detail-panel" aria-live="polite">
      <div className="detail-head">
        <div>
          <h2>{twin.name}</h2>
          <div className="eq-meta">
            {twin.id} · {twin.zone} · {twin.runtimeHours} h runtime
          </div>
        </div>
        <span className={`badge ${twin.status}`}>{twin.status}</span>
      </div>

      <div className="metrics">
        <Metric id="temperature" value={m.temperature} unit="°C" label="Temperature" />
        <Metric id="vibration" value={m.vibration} unit="mm/s" label="Vibration" />
        <Metric id="pressure" value={m.pressure} unit="bar" label="Pressure" />
        <Metric id="rpm" value={m.rpm} unit="rpm" label="Speed" />
        <Metric id="power" value={m.power} unit="kW" label="Power" />
        <Metric id="health" value={twin.health} unit="%" label="Health score" />
      </div>

      <div className="tabs" role="group" aria-label="Chart metric">
        {Object.entries(LIMITS).map(([key, l]) => (
          <button key={key} className="tab" aria-pressed={key === metric} onClick={() => setMetric(key)}>
            {l.label}
          </button>
        ))}
      </div>
      <Chart history={twin.history} metric={metric} limit={LIMITS[metric]} />

      <div className="actions">
        {running ? (
          <button className="btn" onClick={() => onCommand("stop")}>Stop machine</button>
        ) : (
          <button className="btn primary" onClick={() => onCommand("start")}>Start machine</button>
        )}
        <button className="btn primary" onClick={() => onCommand("maintenance")}>Run maintenance</button>
      </div>
    </section>
  );
}
