# TrafficPulse: Traffic Routing & Congestion Prediction System

TrafficPulse is a web application and machine learning analysis framework designed for urban traffic congestion monitoring, K-Means clustering, and A* pathfinding route optimization on road networks.

---

## Technical Overview

The system ingests multi-factor traffic sensor telemetry, standardizes feature vectors using Z-score normalization, clusters road segments into congestion tiers using K-Means ML, and executes A* shortest-path graph search with OpenStreetMap OSRM real street driving geometry to calculate optimal routes.

### Primary Engineering Components

1. **Traffic Sensor Data Processing**
   - Processes 15,000 sensor records from `Traffic_Flow_Dataset.csv`.
   - Core telemetry fields: Traffic Volume (veh/hr), Vehicle Speed (km/h), Vehicle Density (veh/km), Standstill Queue Length (m), Signal Delay (sec), Hour of Day (0-23), Lane Count.

2. **K-Means Machine Learning Clustering**
   - Standardizes numerical feature matrices with StandardScaler (Z-score: $z = \frac{x - \mu}{\sigma}$).
   - Computes Euclidean distance across feature vectors.
   - Evaluates cluster count $K=4$ using Within-Cluster Sum of Squares (WCSS Inertia) and Silhouette Scores.
   - Model Evaluation Accuracy: **65.82%** classification accuracy against ground-truth congestion levels (`Low`, `Moderate`, `High`, `Severe`), with **99% recall** on severe congestion bottlenecks.

3. **Routing & Pathfinding Engine**
   - Integrates OpenStreetMap OSRM Driving Navigation API (`https://router.project-osrm.org/route/v1/driving/`) for real turn-by-turn road geometry coordinates.
   - Executes A* search algorithm using priority queues to evaluate segment cost matrices weighted by K-Means cluster penalties, signal delays, and weather conditions.

4. **Web Interface & Analytics Dashboard**
   - Built with React, Leaflet, and Chart.js.
   - Provides live map visualization, hotspot micro-level inspection, 24-hour hourly flow curves, and incident logging.

---

## Dataset Field Specification (`Traffic_Flow_Dataset.csv`)

The dataset contains 15,000 sensor records across 32 schema fields:

- **Identifiers**: `Record_ID`, `Sensor_ID`, `Road_Segment_ID`, `Intersection_ID`
- **Time/Date**: `Timestamp`, `Day_of_Week`, `Hour_of_Day`, `Weekend_Flag`
- **Traffic Telemetry**: `Traffic_Volume`, `Vehicle_Speed_kmph`, `Road_Occupancy_Percent`, `Vehicle_Density`, `Travel_Time_sec`, `Queue_Length_m`, `Lane_Count`, `Lane_Utilization_Percent`, `Signal_Delay_sec`
- **Environment**: `Weather_Condition`, `Temperature_C`, `Humidity_Percent`, `Visibility_m`, `Road_Surface`
- **IoT Sensors**: `GPS_Vehicle_Count`, `IoT_Device_Count`, `Camera_Detection_Count`
- **Incidents & Forecast**: `Incident_Flag`, `Special_Event`, `Historical_Flow_5min`, `Historical_Flow_10min`, `Historical_Flow_15min`, `Congestion_Level`, `Future_Traffic_Flow`

---

## Directory Structure

```
traffic-kmeans-tracker/
├── index.html
├── package.json
├── vite.config.js
├── notebooks/
│   ├── Traffic_Flow_Dataset.csv       # 15,000 record traffic sensor dataset
│   ├── traffic_kmeans_analysis.ipynb  # Jupyter Notebook (EDA, Clustering, Accuracy % Score)
│   ├── verify_model_accuracy.py       # Standalone Python verification script
│   └── images/                        # Generated analysis plots (confusion matrix, elbow curve)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── services/
│   │   ├── kmeansEngine.js            # K-Means clustering algorithm & scaler
│   │   ├── routingEngine.js           # A* pathfinding & OSRM API routing
│   │   ├── trafficDataGenerator.js    # Gurgaon road graph & interchange nodes
│   │   └── realTrafficData.json       # Parsed sensor baselines
│   └── components/
│       ├── Header.jsx                 # App header & navigation
│       ├── TrafficMap.jsx             # Leaflet street map visualizer
│       ├── HotspotDetail.jsx          # Micro-level hotspot analytics
│       ├── ClusterAnalytics.jsx       # Cluster charts & elbow curve
│       ├── RoutePlanner.jsx           # Route calculation panel
│       ├── DataSimulator.jsx          # Environmental factor controls
│       └── AnomalyDiscussion.jsx      # Incident log portal
└── README.md
```

---

## Installation & Setup

### Web Application

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production bundle
npm run build
```

### Python Model Verification Script

```bash
# Run model accuracy verification script (65.82% score output)
python3 notebooks/verify_model_accuracy.py
```

---

## License

MIT License. Open-source software repository.
