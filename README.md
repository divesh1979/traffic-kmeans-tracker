# 🚦 TrafficPulse: Gurgaon K-Means Live Traffic Congestion Tracker & Route Optimizer

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)](https://leafletjs.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs)](https://www.chartjs.org/)
[![Machine Learning](https://img.shields.io/badge/Algorithm-K--Means%20Clustering-blueviolet)]()

**TrafficPulse** is a modern, mobile-responsive web application designed to track real-time traffic congestion, cluster urban road segments using multi-factor machine learning (K-Means Clustering), recommend optimal congestion-avoidance driving routes, and analyze micro-level hotspot metrics for **Gurgaon (Gurugram), India**.

---

## 🌟 Key Features

### 1. 📊 Multi-Factor Traffic Engine (10 Factors)
Models real-time & historical traffic flow across 10 essential factors:
- **Volume (Flow Rate - veh/hr)**
- **Speed (Actual average actual speed km/h)**
- **Density (Vehicles per km)**
- **Time of Day (00:00 - 23:00 with morning/evening rush hour detection)**
- **Day of Week (Weekday commute vs. Weekend leisure)**
- **Seasonality & Holiday Demand Multiplier**
- **Precipitation (Clear, Light Rain, Heavy Rain, Snow)**
- **Road Design Capacity (Lanes & structural limits)**
- **Control Devices (Highway, Roundabouts, Traffic Lights, Toll Gates)**
- **Vehicle Mix (% Heavy Freight Trucks & Buses)**

### 2. 🧠 In-Browser K-Means Machine Learning Engine
- Standardizes feature vectors using **Z-Score Normalization** (`StandardScaler`).
- Computes Euclidean distance in 10-dimensional feature space.
- Calculates Within-Cluster Sum of Squares (Inertia) & Elbow Method curve ($K = 3 \text{ to } 5$).
- Assigns road segments into distinct traffic condition tiers:
  - 🟢 **Cluster 0**: Free Flow (Smooth Traffic)
  - 🟡 **Cluster 1**: Moderate Traffic Flow
  - 🟠 **Cluster 2**: Heavy Bottleneck
  - 🔴 **Cluster 3**: Critical Congestion / Gridlock
  - 🟣 **Cluster 4**: Irregular Anomaly Event

### 3. 🗺️ Interactive Map & A* Smart Route Optimizer
- Interactive Leaflet map powered by CartoDB Voyager light tiles.
- Segment polylines dynamically color-coded by assigned K-Means cluster tier.
- **A* Smart Pathfinding Engine** comparing 3 route choices:
  1. **K-Means ML Smart Route** (Avoids bottleneck clusters & monsoon delays)
  2. **Shortest Physical Distance Path**
  3. **Historical Pattern Route**
- Turn-by-turn guidance and delay savings metrics.

### 4. 📍 Gurgaon Hotspot Micro-Level Deep Dive
Inspect location-specific, detailed micro-level traffic analytics for major Gurgaon hubs:
- **Cyber City & Shankar Chowk Hub** (`N2`)
- **IFFCO Chowk Interchange & Flyover** (`N3`)
- **Rajiv Chowk (NH-48 Central Crossing)** (`N4`)
- **Hero Honda Chowk & Service Road** (`N5`)
- **Golf Course Road 16-Lane Expressway** (`N8`)
- **Subhash Chowk / Sohna Road Commercial Hub** (`N10`)
- **Kherki Daula Toll Plaza Corridor** (`N6`)

**Micro Metrics Available**:
- Standstill Queue Length (km) & Speed Drop Ratio.
- Monsoon Waterlogging & Hydroplaning Vulnerability.
- Vehicle Class Distribution (% Cars, Cabs/Autos, Buses/Shuttles, Freight Trucks).
- 24-Hour Hourly Congestion Index vs. 7-Day Historical Pattern Chart.
- Localized Micro-Detour Recommendation Cards.

### 5. ⚠️ Irregular Condition & Anomaly Discussion Board
- Community incident reporting tool for accidents, signal failures, and waterlogging.
- Real-time re-clustering preview & operator discussion feed.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite
- **Styling**: Vanilla CSS3 (Glassmorphic Light Mode Design System)
- **Mapping**: Leaflet, React-Leaflet
- **Data Visualization**: Chart.js, React-ChartJS-2
- **Icons**: Lucide-React
- **Pathfinding & ML**: Custom in-browser A* Algorithm & K-Means Clustering Engine

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` or `yarn`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<YOUR_USERNAME>/traffic-kmeans-tracker.git

# 2. Navigate to project directory
cd traffic-kmeans-tracker

# 3. Install dependencies
npm install

# 4. Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
traffic-kmeans-tracker/
├── index.html
├── package.json
├── vite.config.js
├── notebooks/
│   ├── traffic_kmeans_analysis.ipynb  # Jupyter Notebook (Python ML Implementation, EDA, Elbow Method)
│   └── traffic_dataset_gurgaon.csv     # 10-Factor Gurgaon Traffic Flow Dataset
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── services/
│   │   ├── kmeansEngine.js         # Z-score scaler, K-Means clustering, Elbow method
│   │   ├── routingEngine.js        # A* pathfinding with K-Means cluster penalty cost
│   │   └── trafficDataGenerator.js # Gurgaon road network topology & multi-factor telemetry
│   └── components/
│       ├── Header.jsx              # App header with mobile navigation tab bar
│       ├── TrafficMap.jsx          # Leaflet map with colored cluster polylines
│       ├── HotspotDetail.jsx       # Micro-level detailed location analytics
│       ├── ClusterAnalytics.jsx    # Chart.js Radar fingerprints & Elbow curve
│       ├── RoutePlanner.jsx        # Navigation & route comparison panel
│       ├── DataSimulator.jsx       # Environmental simulator & live telemetry feed
│       └── AnomalyDiscussion.jsx   # Incident reporting & community feed
└── README.md
```

---

## 📐 Mathematical Formulations

### 1. Z-Score Standardization
For feature $f$ with raw value $x$:
$$z_f = \frac{x - \mu_f}{\sigma_f} \times w_f$$
Where $\mu_f$ is mean, $\sigma_f$ is standard deviation, and $w_f$ is feature importance weight.

### 2. A* Pathfinding Segment Cost
$$\text{Cost} = \left(\frac{\text{Distance}}{\text{Speed}} \times 60\right) \times \left(1 + \text{ClusterID} \times 0.35\right) \times \text{AnomalyMultiplier} + \text{ControlDelay}$$

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
