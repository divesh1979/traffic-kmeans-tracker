import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertCircle, Navigation, Gauge, Layers, Info, MapPin } from 'lucide-react';
import { CITY_NODES } from '../services/trafficDataGenerator';

// Custom Leaflet Icons for Nodes
const createNodeIcon = (isStart, isTarget) => {
  let bgColor = '#3b82f6';
  let label = 'N';

  if (isStart) {
    bgColor = '#10b981';
    label = 'A';
  } else if (isTarget) {
    bgColor = '#ef4444';
    label = 'B';
  }

  return L.divIcon({
    className: 'custom-node-pin',
    html: `<div style="background-color: ${bgColor}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5); color: #fff; font-weight: bold; font-size: 12px; display: flex; align-items: center; justify-content: center;">${label}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

function MapViewRecenter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
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

  // Node position map helper
  const getNodePos = (id) => {
    const node = CITY_NODES.find(n => n.id === id);
    return node ? [node.lat, node.lng] : [28.4595, 77.0325];
  };

  // Compute map bounds around nodes (Gurgaon Center)
  const mapCenter = [28.4595, 77.0325];
  const allPositions = CITY_NODES.map(n => [n.lat, n.lng]);

  // Extract polyline points for active route calculation
  const getActiveRoutePolyline = () => {
    if (!activeRouteResult) return [];
    
    let routeData = activeRouteResult.smartRoute;
    if (activeRouteType === 'distance') routeData = activeRouteResult.distanceRoute;
    if (activeRouteType === 'historical') routeData = activeRouteResult.historicalRoute;

    if (!routeData || !routeData.pathSegments) return [];

    const polylines = [];
    routeData.pathSegments.forEach(seg => {
      const fromPos = getNodePos(seg.from);
      const toPos = getNodePos(seg.to);
      polylines.push([fromPos, toPos]);
    });
    return polylines;
  };

  const activeRouteCoords = getActiveRoutePolyline();

  return (
    <div className="traffic-map-wrapper">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="leaflet-container-custom"
      >
        <MapViewRecenter bounds={allPositions} />
        
        {/* CartoDB Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={
            isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />

        {/* Base Traffic Road Segments (Color-coded by K-Means Cluster) */}
        {segments.map(seg => {
          const fromPos = getNodePos(seg.from);
          const toPos = getNodePos(seg.to);
          const isSelected = selectedSegment?.id === seg.id;
          const strokeWidth = isSelected ? 8 : (seg.lanes * 1.8 + 2);

          return (
            <React.Fragment key={seg.id}>
              {/* Glow background for anomalies */}
              {seg.isAnomaly && (
                <Polyline
                  positions={[fromPos, toPos]}
                  pathOptions={{
                    color: '#a855f7',
                    weight: strokeWidth + 6,
                    opacity: 0.5,
                    dashArray: '8, 8'
                  }}
                />
              )}

              {/* Core Segment Line */}
              <Polyline
                positions={[fromPos, toPos]}
                pathOptions={{
                  color: seg.clusterColor || '#10b981',
                  weight: strokeWidth,
                  opacity: 0.88,
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

        {/* Highlighted Selected Route Overlay */}
        {activeRouteCoords.map((coords, idx) => (
          <Polyline
            key={`route-${idx}`}
            positions={coords}
            pathOptions={{
              color: activeRouteType === 'kmeans_smart' ? '#0284c7' : activeRouteType === 'distance' ? '#e11d48' : '#d97706',
              weight: 8,
              opacity: 0.95,
              dashArray: activeRouteType === 'kmeans_smart' ? '12, 8' : 'none'
            }}
          />
        ))}

        {/* City Interchange Nodes */}
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
            <span className="color-dot" style={{ backgroundColor: '#10b981' }}></span>
            <span>Free Flow</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#eab308' }}></span>
            <span>Moderate Traffic</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#f97316' }}></span>
            <span>Heavy Bottleneck</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#ef4444' }}></span>
            <span>Critical Gridlock</span>
          </div>
          <div className="legend-item">
            <span className="color-dot" style={{ backgroundColor: '#a855f7' }}></span>
            <span>Irregular Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
}
