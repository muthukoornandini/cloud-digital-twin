export default function Summary({ data }) {
  if (!data) return <section className="summary" />;
  const stats = [
    ["total", "Machines", data.total, ""],
    ["running", "Running normally", data.running, ""],
    ["warning", "Warnings", data.warning, "warn"],
    ["critical", "Critical", data.critical, "crit"],
    ["stopped", "Stopped", data.stopped, ""],
    ["health", "Average health", `${data.avgHealth}%`, ""],
    ["power", "Power draw (kW)", data.totalPowerKw, ""],
  ];
  return (
    <section className="summary" aria-label="Plant summary">
      {stats.map(([key, label, value, cls]) => (
        <div className={`stat ${cls}`} key={key}>
          <div className="value">{value}</div>
          <div className="label">{label}</div>
        </div>
      ))}
    </section>
  );
}
