const path = require("path");
const express = require("express");
const cors = require("cors");
const { Simulator, LIMITS } = require("./simulator");

const app = express();
const PORT = process.env.PORT || 5000;
const sim = new Simulator();

app.use(cors());
app.use(express.json());

// ---------- REST API ----------
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.get("/api/limits", (req, res) => res.json(LIMITS));

app.get("/api/summary", (req, res) => res.json(sim.summary()));

app.get("/api/equipment", (req, res) => res.json(sim.list()));

app.get("/api/equipment/:id", (req, res) => {
  const m = sim.get(req.params.id);
  if (!m) return res.status(404).json({ error: "Equipment not found" });
  const { base, peak, rising, ...twin } = m; // includes history for charts
  res.json(twin);
});

app.post("/api/equipment/:id/command", (req, res) => {
  const result = sim.command(req.params.id, req.body && req.body.action);
  if (!result) return res.status(404).json({ error: "Equipment not found" });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.get("/api/alerts", (req, res) => res.json(sim.alerts.slice(0, 20)));

// ---------- Serve the plain HTML/CSS/JS dashboard ----------
app.use(express.static(path.join(__dirname, "..", "frontend-vanilla")));

// Update the digital twins every 2 seconds.
setInterval(() => sim.tick(), 2000);

app.listen(PORT, () => {
  console.log(`Digital Twin server running on http://localhost:${PORT}`);
});
