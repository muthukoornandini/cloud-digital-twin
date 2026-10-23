// Set VITE_API_URL (e.g. https://your-app.onrender.com) when deploying the React build separately.
const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const getSummary = () => request("/api/summary");
export const getEquipment = () => request("/api/equipment");
export const getTwin = (id) => request(`/api/equipment/${id}`);
export const getAlerts = () => request("/api/alerts");
export const sendCommand = (id, action) =>
  request(`/api/equipment/${id}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
