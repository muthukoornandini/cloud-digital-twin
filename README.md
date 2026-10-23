# Cloud-Based Digital Twin System for Industrial Equipment

A cloud computing mini project. It keeps a virtual copy (digital twin) of industrial machines and shows their simulated status and monitoring data on a web dashboard.

## Architecture

```
Simulated sensors  ->  Node.js + Express API (cloud)  ->  Web dashboard
(simulator.js)         REST endpoints, JSON               Plain HTML/CSS/JS  or  React
```

- The backend creates 5 digital twins (press, CNC, conveyor, compressor, pump).
- Every 2 seconds it generates new temperature, vibration, pressure, rpm, power and health values.
- Faults build up randomly, so machines move between running, warning and critical, and raise alerts.
- The dashboard polls the API every 2 seconds and draws live charts.
- Operators can start, stop, or run maintenance on a machine.

## Folder structure

```
digital-twin/
├── backend/            Node.js + Express API and simulator
├── frontend-vanilla/   HTML, CSS, JavaScript dashboard (served by the backend)
├── frontend-react/     Same dashboard built with React + Vite
├── Dockerfile          For cloud deployment
└── README.md
```

## Run it (option 1: HTML/CSS/JS)

```bash
cd backend
npm install
npm start
```

Open http://localhost:5000

## Run it (option 2: React)

Terminal 1:
```bash
cd backend
npm install
npm start
```

Terminal 2:
```bash
cd frontend-react
npm install
npm run dev
```

Open http://localhost:5173 (Vite forwards /api calls to port 5000).

## API endpoints

| Method | Endpoint                         | Description                              |
|--------|----------------------------------|------------------------------------------|
| GET    | /api/health                      | Server check                             |
| GET    | /api/summary                     | Counts, average health, total power      |
| GET    | /api/equipment                   | All machines with current status         |
| GET    | /api/equipment/:id               | One twin with metrics and history        |
| POST   | /api/equipment/:id/command       | Body: `{ "action": "start" \| "stop" \| "maintenance" }` |
| GET    | /api/alerts                      | Latest alerts                            |
| GET    | /api/limits                      | Warning and critical thresholds          |

## Deploy to the cloud

**Render / Railway (easiest):** push this folder to GitHub, create a new Web Service, set the root to this folder, build command `cd backend && npm install`, start command `node backend/server.js`. The HTML/JS dashboard is served from the same URL.

**Docker (AWS, Azure, GCP):**
```bash
docker build -t digital-twin .
docker run -p 5000:5000 digital-twin
```

**React build on separate hosting (Netlify, Vercel, S3):**
```bash
cd frontend-react
VITE_API_URL=https://your-backend-url npm run build
```
Upload the `dist` folder.

## Cloud computing concepts shown

- Client-server model with a REST API over HTTP
- Stateless API that any number of dashboards can read
- Digital twin concept: virtual state mirroring physical equipment
- Real-time monitoring by polling (could be upgraded to WebSockets or MQTT)
- Containerised deployment (Docker) and PaaS or IaaS hosting

## Possible extensions

- Store history in MongoDB or PostgreSQL instead of memory
- Replace the simulator with real sensor data over MQTT (AWS IoT Core, Azure IoT Hub)
- Add login and roles, WebSocket live updates, email alerts
