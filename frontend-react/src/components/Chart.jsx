// Small SVG line chart, no chart library needed.
const W = 800;
const H = 240;
const PAD = { l: 44, r: 12, t: 12, b: 22 };

export default function Chart({ history, metric, limit }) {
  const data = history.map((p) => p[metric]);
  if (data.length < 2) return <svg className="chart" />;

  let min = Math.min(...data, 0);
  let max = Math.max(...data);
  if (limit.warn !== null) max = Math.max(max, limit.warn * 1.05);
  if (metric === "health") { min = 0; max = 100; }
  const range = max - min || 1;

  const x = (i) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v) => H - PAD.b - ((v - min) / range) * (H - PAD.t - PAD.b);
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const ticks = [0, 1, 2, 3, 4].map((i) => min + (range * i) / 4);
  const limitLine = (value, color) =>
    value !== null && value <= max ? (
      <line x1={PAD.l} x2={W - PAD.r} y1={y(value)} y2={y(value)} stroke={color} strokeDasharray="6 4" />
    ) : null;

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${metric} history`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#e3e0d8" />
          <text x="6" y={y(t) + 4} fontSize="12" fill="#66707a">{t.toFixed(metric === "vibration" ? 1 : 0)}</text>
        </g>
      ))}
      {limitLine(limit.warn, "#c9791a")}
      {limitLine(limit.crit, "#c23b2b")}
      <path d={path} fill="none" stroke="#263038" strokeWidth="2" />
      <text x={PAD.l} y={H - 6} fontSize="12" fill="#263038">last 2 min ({limit.unit})</text>
    </svg>
  );
}
