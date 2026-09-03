import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Layers, MapPin } from 'lucide-react';
import { CITY_NODES } from '../services/trafficDataGenerator';
import { fetchOSRMRealStreetPolyline } from '../services/routingEngine';

// Custom Leaflet Pins for Nodes
const createNodeIcon = (isStart, isTarget) => {
  let bgColor = '#0284c7';
  let label = 'N';

  if (isStart) {
    bgColor = '#059669';
    label = 'A';
  } else if (isTarget) {
    bgColor = '#dc2626';
    label = 'B';
  }

  return L.divIcon({
    className: 'custom-node-pin',
    html: `<div style="background-color: ${bgColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.3); color: #fff; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center;">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

function MapViewRecenter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [45, 45] });
    }
  }, [bounds, map]);
  return null;
}

export default function TrafficMap({ 
  segments, 
  selectedSegment, 
  setSelectedSegment,
  startNodeId,
  setStartNodeId,
  targetNodeId,
  setTargetNodeId,
  activeRouteResult,
  activeRouteType,
  isDarkMode
}) {
  const [osrmRealStreetCoords, setOsrmRealStreetCoords] = useState([]);

  // Fetch 100% Real Street Navigation Geometry from OSRM OpenStreetMap Engine
  useEffect(() => {
    let isMounted = true;
    const startNode = CITY_NODES.find(n => n.id === startNodeId);
    const targetNode = CITY_NODES.find(n => n.id === targetNodeId);

    if (startNode && targetNode && startNodeId !== targetNodeId) {
      fetchOSRMRealStreetPolyline(startNode, targetNode).then(res => {
        if (isMounted && res && res.realStreetCoords) {
          setOsrmRealStreetCoords(res.realStreetCoords);
        }
      });
    }

    return () => { isMounted = false; };
  }, [startNodeId, targetNodeId]);

  const getNodePos = (id) => {
    const node = CITY_NODES.find(n => n.id === id);
    return node ? [node.lat, node.lng] : [28.4590, 77.0320];
  };

  const mapCenter = [28.4590, 77.0320];
  const allPositions = CITY_NODES.map(n => [n.lat, n.lng]);

  // Extract segment polyline points fallback
  const getActiveRoutePolyline = () => {
    if (!activeRouteResult) return [];
    
    let routeData = activeRouteResult.smartRoute;
    if (activeRouteType === 'distance') routeData = activeRouteResult.distanceRoute;
    if (activeRouteType === 'historical') routeData = activeRouteResult.historicalRoute;

    if (!routeData || !routeData.pathSegments) return [];

    const polylines = [];
    routeData.pathSegments.forEach(seg => {
      const coords = seg.waypoints || [getNodePos(seg.from), getNodePos(seg.to)];
      polylines.push(coords);
    });
    return polylines;
  };

  const fallbackRouteCoords = getActiveRoutePolyline();

  return (
    <div className="traffic-map-wrapper">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="leaflet-container-custom"
      >
        <MapViewRecenter bounds={allPositions} />
        
        {/* OpenStreetMap High-Resolution Detailed Base Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          maxZoom={19}
        />

        {/* Base Traffic Road Segments (Color-coded by K-Means Cluster) */}
        {segments.map(seg => {
          const polylineCoords = seg.waypoints || [getNodePos(seg.from), getNodePos(seg.to)];
          const isSelected = selectedSegment?.id === seg.id;
          const strokeWidth = isSelected ? 9 : (seg.lanes * 1.8 + 2);

          return (
            <React.Fragment key={seg.id}>
              {/* Glow background for anomalies */}
              {seg.isAnomaly && (
                <Polyline
                  positions={polylineCoords}
                  pathOptions={{
                    color: '#9333ea',
                    weight: strokeWidth + 6,
                    opacity: 0.6,
                    dashArray: '8, 8'
                  }}
                />
              )}

              {/* Core Segment Line */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: seg.clusterColor || '#059669',
                  weight: strokeWidth,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                eventHandlers={{
                  click: () => setSelectedSegment(seg)
                }}
              >
                <Popup className="segment-popup">
                  <div className="popup-card">
                    <div className="popup-header" style={{ borderLeftColor: seg.clusterColor }}>
                      <h4>{seg.name}</h4>
                      <span className="popup-badge" style={{ backgroundColor: seg.clusterColor }}>
                        {seg.clusterName}
                      </span>
                    </div>

                    <div className="popup-metrics-grid">
                      <div className="metric-box">
                        <span className="metric-lbl">Flow Rate (Volume)</span>
                        <span className="metric-val">{seg.volume} <small>veh/hr</small></span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-lbl">Actual Speed</span>
                        <span className="metric-val">{seg.speed} <small>km/h</small> (Limit {seg.speedLimit})</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-lbl">Queue Length</span>
                        <span className="metric-val">{seg.queueMeters || 120} <small>meters</small></span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-lbl">Signal Delay</span>
                        <span className="metric-val">{seg.signalDelaySec || 45} <small>sec</small></span>
                      </div>
                    </div>

                    <div className="popup-details">
                      <p><strong>Source File:</strong> Traffic_Flow_Dataset.csv (Sensor Log)</p>
                      <p><strong>Length:</strong> {seg.distanceKm} km | <strong>Lanes:</strong> {seg.lanes}</p>
                      <p><strong>Precipitation:</strong> {['Clear', 'Light Rain', 'Heavy Rain', 'Snow'][seg.precipitation]}</p>
                      <p><strong>Control Device:</strong> {['Highway', 'Roundabout', 'Traffic Signal', 'Toll/Stop'][seg.controlDevices]}</p>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* 100% REAL STREET OSRM DRIVING ROUTE OVERLAY */}
        {osrmRealStreetCoords.length > 0 ? (
          <Polyline
            positions={osrmRealStreetCoords}
            pathOptions={{
              color: activeRouteType === 'kmeans_smart' ? '#0284c7' : activeRouteType === 'distance' ? '#dc2626' : '#d97706',
              weight: 9,
              opacity: 0.95,
              dashArray: activeRouteType === 'kmeans_smart' ? '10, 6' : 'none'
            }}
          />
        ) : (
          fallbackRouteCoords.map((coords, idx) => (
            <Polyline
              key={`fallback-route-${idx}`}
              positions={coords}
              pathOptions={{
                color: activeRouteType === 'kmeans_smart' ? '#0284c7' : activeRouteType === 'distance' ? '#dc2626' : '#d97706',
                weight: 8,
                opacity: 0.95,
                dashArray: activeRouteType === 'kmeans_smart' ? '10, 6' : 'none'
              }}
            />
          ))
        )}

        {/* Interchange Nodes */}
        {CITY_NODES.map(node => {
          const isStart = startNodeId === node.id;
          const isTarget = targetNodeId === node.id;

          return (
            <Marker
              key={node.id}
              position={[node.lat, node.lng]}
              icon={createNodeIcon(isStart, isTarget)}
            >
              <Popup className="node-popup">
                <div className="node-popup-card">
                  <h4>{node.name}</h4>
                  <p className="node-id">Junction ID: {node.id}</p>
                  <div className="node-actions">
                    <button 
                      className={`btn-pin ${isStart ? 'active-pin' : ''}`}
                      onClick={() => setStartNodeId(node.id)}
                    >
                      <MapPin size={14} /> Set Start (A)
                    </button>
                    <button 
                      className={`btn-pin ${isTarget ? 'active-pin' : ''}`}
                      onClick={() => setTargetNodeId(node.id)}
                    >
                      <Navigation size={14} /> Set Target (B)
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="map-legend-card glass-panel">
        <h5><Layers size={15} /> K-Means Traffic Clusters</h5>
        <div className="legend-items">
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#059669' }}></span>
            <span>Free Flow</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#d97706' }}></span>
            <span>Moderate Traffic</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#ea580c' }}></span>
            <span>Heavy Bottleneck</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#dc2626' }}></span>
            <span>Critical Gridlock</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#9333ea' }}></span>
            <span>Irregular Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
}
