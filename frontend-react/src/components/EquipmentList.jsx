export default function EquipmentList({ items, selectedId, onSelect }) {
  return (
    <section className="panel list-panel" aria-label="Equipment list">
      <h2>Equipment</h2>
      <ul className="equipment-list">
        {items.map((m) => (
          <li key={m.id}>
            <button className={`eq-btn ${m.id === selectedId ? "selected" : ""}`} onClick={() => onSelect(m.id)}>
              <span className={`stripe ${m.status}`} />
              <span>
                <span className="eq-name">{m.name}</span>
                <br />
                <span className="eq-meta">
                  {m.id} · {m.zone} · {m.status}
                </span>
              </span>
              <span className="eq-health">{m.health}%</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
