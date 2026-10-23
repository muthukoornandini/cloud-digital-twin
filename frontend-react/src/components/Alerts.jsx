export default function Alerts({ items }) {
  return (
    <section className="panel alerts-panel" aria-label="Recent alerts">
      <h2>Recent alerts</h2>
      <ul className="alerts">
        {items.length === 0 && (
          <li>
            <span />
            <span className="empty">No alerts yet. Alerts appear when a machine drifts out of range.</span>
          </li>
        )}
        {items.map((a) => (
          <li key={a.id}>
            <time>{new Date(a.time).toLocaleTimeString()}</time>
            <span className={a.level}>{a.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
