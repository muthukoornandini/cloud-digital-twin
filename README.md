# Cloud-Based Digital Twin System for Industrial Equipment

A cloud-deployed web application that simulates industrial equipment, monitors machine health, visualizes sensor readings, and generates alerts through a real-time digital twin dashboard.

## 🌐 Live Demo

**[Launch the Digital Twin Dashboard](https://cloud-digital-twin-uyrz.onrender.com)**

## 📂 GitHub Repository

**[View Source Code on GitHub](https://github.com/muthukoornandini/cloud-digital-twin)**

## 📌 Project Overview

The Cloud-Based Digital Twin System creates virtual representations of industrial machines using simulated sensor data. It helps users monitor equipment conditions, observe performance metrics, identify potential faults, and manage machine operations through a web-based dashboard.

The application is deployed on Render, making the dashboard accessible online.

## ✨ Key Features

- **Digital Twin Simulation:** Simulates five industrial machines.
- **Live Sensor Monitoring:** Displays temperature, vibration, pressure, RPM, power consumption, and machine health.
- **Machine Status Tracking:** Shows machine operating conditions, including running, warning, critical, and stopped states.
- **Fault and Alert Monitoring:** Generates simulated alerts when machine conditions change.
- **Interactive Controls:** Allows users to stop machines and initiate maintenance actions.
- **Performance Visualization:** Displays machine readings and historical data through dashboard charts.
- **Cloud Deployment:** Provides online access through Render.

## 🏭 Machines Simulated

1. Hydraulic Press
2. CNC Milling Centre
3. Belt Conveyor
4. Air Compressor
5. Coolant Pump

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | HTML, CSS, JavaScript |
| Data Visualization | Dashboard charts |
| Simulation | JavaScript-based sensor simulator |
| Containerization | Docker |
| Cloud Deployment | Render |
| Version Control | Git and GitHub |

## ⚙️ How It Works

1. The simulator generates sensor readings for five industrial machines.
2. The backend processes and provides machine data through the web application.
3. The dashboard displays sensor readings, machine health, and operating status.
4. The system generates simulated alerts when machine conditions change.
5. Users can interact with machine controls and observe status updates.

## 📊 Dashboard Output

The dashboard provides:

- Total number of monitored machines
- Running, warning, critical, and stopped machine counts
- Average machine health
- Total power consumption
- Individual machine sensor readings
- Historical charts and recent alerts

*Sensor values and machine status can change because the project uses simulated data.*

## 🚀 Run Locally

### Prerequisites

- Node.js and npm
- Git

### Installation

```bash
git clone https://github.com/muthukoornandini/cloud-digital-twin.git
cd cloud-digital-twin
cd backend
npm install
npm start
```

Open the application in your browser:

```text
http://localhost:5000
```

## ☁️ Cloud Deployment

The project uses Docker for packaging and is deployed on Render.

**Live application:** https://cloud-digital-twin-uyrz.onrender.com

Note: The free hosting service may take some time to start after a period of inactivity.

## 🔮 Future Enhancements

- Integration with real IoT sensors
- Predictive maintenance using machine learning
- Historical data storage and analytics
- User authentication and role-based access
- Advanced fault detection and notifications

## 🎯 Project Objective

To demonstrate how digital twin simulation, sensor monitoring, interactive dashboards, and cloud deployment can be combined to support industrial equipment monitoring and maintenance.

---

**Developed by:** Muthukoornandini

**GitHub:** [@muthukoornandini](https://github.com/muthukoornandini)

**Live Demo:** [Cloud-Based Digital Twin System](https://cloud-digital-twin-uyrz.onrender.com)
