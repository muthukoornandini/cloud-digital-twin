import { useState } from "react";
import usePolling from "./usePolling.js";
import { getSummary, getEquipment, getTwin, getAlerts, sendCommand } from "./api.js";
import Summary from "./components/Summary.jsx";
import EquipmentList from "./components/EquipmentList.jsx";
import DetailPanel from "./components/DetailPanel.jsx";
import Alerts from "./components/Alerts.jsx";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);

  const summary = usePolling(getSummary);
  const equipment = usePolling(getEquipment);
  const alerts = usePolling(getAlerts);

  const activeId = selectedId || (equipment.data && equipment.data[0]?.id) || null;
  const twin = usePolling(() => (activeId ? getTwin(activeId) : Promise.resolve(null)), 2000, [activeId]);

  const offline = summary.error || equipment.error;

  async function handleCommand(action) {
    await sendCommand(activeId, action);
    twin.reload();
    equipment.reload();
    summary.reload();
    alerts.reload();
  }

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Plant Floor Digital Twin</h1>
          <p className="sub">Live view of simulated equipment, served from the cloud API</p>
        </div>
        <div className={`conn ${offline ? "bad" : summary.data ? "ok" : ""}`} role="status">
          {offline ? "Server unreachable. Is the backend running?" : summary.data ? "Connected" : "Connecting…"}
        </div>
      </header>

      <main>
        <Summary data={summary.data} />
        <div className="layout">
          <EquipmentList items={equipment.data || []} selectedId={activeId} onSelect={setSelectedId} />
          <DetailPanel twin={twin.data} onCommand={handleCommand} />
        </div>
        <Alerts items={alerts.data || []} />
      </main>
    </>
  );
}
