import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TrafficMap from './components/TrafficMap';
import HotspotDetail from './components/HotspotDetail';
import ClusterAnalytics from './components/ClusterAnalytics';
import RoutePlanner from './components/RoutePlanner';
import DataSimulator from './components/DataSimulator';
import AnomalyDiscussion from './components/AnomalyDiscussion';

import { INITIAL_SEGMENTS, generateSegmentTelemetry } from './services/trafficDataGenerator';
import { runKMeansClustering, calculateElbowCurve } from './services/kmeansEngine';
import { calculateAllRoutes } from './services/routingEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);

  // Environmental Factor State (Multi-Factor Inputs)
  const [envConfig, setEnvConfig] = useState({
    timeOfDay: 17, // 5 PM Evening Peak
    dayOfWeek: 2,  // Tuesday
    seasonality: 1, // Spring
    precipitation: 0, // Clear
    rushHourMultiplier: 1.0,
    vehicleMixHeavy: 15
  });

  // Segments raw telemetry state
  const [segments, setSegments] = useState([]);
  
  // K-Means Engine State
  const [kValue, setKValue] = useState(4);
  const [kmeansResult, setKmeansResult] = useState({ clusteredData: [], clustersInfo: [], inertia: 0 });
  const [elbowData, setElbowData] = useState([]);
  
  // Routing State (Default: Sirhaul Border N1 to Sohna Road Tech Park N11)
  const [startNodeId, setStartNodeId] = useState('N1');
  const [targetNodeId, setTargetNodeId] = useState('N11');
  const [activeRouteResult, setActiveRouteResult] = useState(null);
  const [activeRouteType, setActiveRouteType] = useState('kmeans_smart');
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Anomalies list state
  const [anomalies, setAnomalies] = useState([]);

  // Generate initial segment telemetry based on envConfig
  const generateTelemetry = useCallback((currentAnomalies = anomalies) => {
    const freshSegments = INITIAL_SEGMENTS.map(seg => {
      const telemetry = generateSegmentTelemetry(seg, envConfig);
      
      // Check if segment has an active anomaly
      const anom = currentAnomalies.find(a => a.id === seg.id);
      if (anom) {
        return {
          ...telemetry,
          isAnomaly: true,
          speed: Math.max(5, Math.round(telemetry.speed * 0.25)), // severe slowdown
          density: telemetry.density * 2.2,
          volume: Math.round(telemetry.volume * 0.4),
          incidentDetails: anom.incidentDetails
        };
      }

      return telemetry;
    });

    setSegments(freshSegments);
  }, [envConfig, anomalies]);

  // Run K-Means Clustering on telemetry segments
  const runClustering = useCallback(() => {
    if (!segments || segments.length === 0) return;

    const res = runKMeansClustering(segments, kValue);
    setKmeansResult(res);

    // Calculate elbow data on initial load
    if (elbowData.length === 0) {
      const eData = calculateElbowCurve(segments, 6);
      setElbowData(eData);
    }
  }, [segments, kValue, elbowData.length]);

  // Re-calculate routes whenever segments/clusters update
  const handleCalculateRoute = useCallback(() => {
    const dataToUse = kmeansResult.clusteredData.length > 0 ? kmeansResult.clusteredData : segments;
    const result = calculateAllRoutes(startNodeId, targetNodeId, dataToUse);
    setActiveRouteResult(result);
  }, [startNodeId, targetNodeId, kmeansResult.clusteredData, segments]);

  // Initialize data on mount
  useEffect(() => {
    generateTelemetry();
  }, [generateTelemetry]);

  // Run clustering whenever segments or K changes
  useEffect(() => {
    runClustering();
  }, [segments, kValue, runClustering]);

  // Re-calculate route when clustering finishes or nodes change
  useEffect(() => {
    handleCalculateRoute();
  }, [kmeansResult.clusteredData, startNodeId, targetNodeId, handleCalculateRoute]);

  // Live Stream Simulation Timer (Tick every 3.5 seconds)
  useEffect(() => {
    let interval = null;
    if (isLiveStreaming) {
      interval = setInterval(() => {
        setSegments(prev => prev.map(s => {
          if (s.isAnomaly) return s; // Keep anomaly lock
          
          // Random slight fluctuation in volume & speed
          const volDelta = Math.floor(Math.random() * 80 - 40);
          const newVol = Math.max(150, s.volume + volDelta);
          const speedDelta = Math.floor(Math.random() * 6 - 3);
          const newSpeed = Math.max(8, Math.min(s.speedLimit, s.speed + speedDelta));
          const newDensity = Math.round(newVol / Math.max(newSpeed, 5));

          return {
            ...s,
            volume: newVol,
            speed: newSpeed,
            density: newDensity,
            vcRatio: parseFloat((newVol / s.capacity).toFixed(2))
          };
        }));
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveStreaming]);

  // Handle logging new anomaly incident
  const logAnomalyIncident = (segmentId, incidentDetails) => {
    const updatedAnomalies = [...anomalies, { id: segmentId, name: segmentId, incidentDetails }];
    setAnomalies(updatedAnomalies);

    // Force segment update
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId) {
        return {
          ...s,
          isAnomaly: true,
          speed: Math.max(5, Math.round(s.speed * 0.2)),
          density: s.density * 2.5,
          incidentDetails
        };
      }
      return s;
    }));
  };

  // Handle resolving anomaly incident
  const resolveAnomalyIncident = (segmentId) => {
    const updatedAnomalies = anomalies.filter(a => a.id !== segmentId);
    setAnomalies(updatedAnomalies);
    generateTelemetry(updatedAnomalies);
  };

  const currentClusteredSegments = kmeansResult.clusteredData.length > 0 ? kmeansResult.clusteredData : segments;

  return (
    <div className={`app-root ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isLiveStreaming={isLiveStreaming}
        setIsLiveStreaming={setIsLiveStreaming}
      />

      <main className="main-content-layout">
        {activeTab === 'map' && (
          <div className="map-view-split">
            {/* Left/Top Interactive Map */}
            <div className="map-column">
              <TrafficMap 
                segments={currentClusteredSegments}
                selectedSegment={selectedSegment}
                setSelectedSegment={setSelectedSegment}
                startNodeId={startNodeId}
                setStartNodeId={setStartNodeId}
                targetNodeId={targetNodeId}
                setTargetNodeId={setTargetNodeId}
                activeRouteResult={activeRouteResult}
                activeRouteType={activeRouteType}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Right/Bottom Route & Details Column */}
            <div className="sidebar-column">
              <RoutePlanner 
                startNodeId={startNodeId}
                setStartNodeId={setStartNodeId}
                targetNodeId={targetNodeId}
                setTargetNodeId={setTargetNodeId}
                routeResult={activeRouteResult}
                activeRouteType={activeRouteType}
                setActiveRouteType={setActiveRouteType}
                calculateRoute={handleCalculateRoute}
              />
            </div>
          </div>
        )}

        {activeTab === 'hotspot' && (
          <HotspotDetail 
            segments={currentClusteredSegments}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'analytics' && (
          <ClusterAnalytics 
            clustersInfo={kmeansResult.clustersInfo}
            inertia={kmeansResult.inertia}
            elbowData={elbowData}
            kValue={kValue}
            setKValue={setKValue}
            triggerKMeansRetrain={runClustering}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'simulator' && (
          <DataSimulator 
            envConfig={envConfig}
            setEnvConfig={setEnvConfig}
            isLiveStreaming={isLiveStreaming}
            setIsLiveStreaming={setIsLiveStreaming}
            regenerateData={() => generateTelemetry(anomalies)}
          />
        )}

        {activeTab === 'anomaly' && (
          <AnomalyDiscussion 
            anomalies={currentClusteredSegments.filter(s => s.isAnomaly)}
            logAnomalyIncident={logAnomalyIncident}
            resolveAnomalyIncident={resolveAnomalyIncident}
          />
        )}
      </main>
    </div>
  );
}
