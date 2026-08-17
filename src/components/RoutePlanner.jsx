import React from 'react';
import { Navigation, Clock, Zap, MapPin, ArrowRight, ShieldCheck, AlertCircle, Compass, CheckCircle2 } from 'lucide-react';
import { CITY_NODES } from '../services/trafficDataGenerator';

export default function RoutePlanner({ 
  startNodeId, 
  setStartNodeId, 
  targetNodeId, 
  setTargetNodeId, 
  routeResult,
  activeRouteType,
  setActiveRouteType,
  calculateRoute
}) {

  const smartRoute = routeResult?.smartRoute;
  const distanceRoute = routeResult?.distanceRoute;
  const historicalRoute = routeResult?.historicalRoute;
  const timeSaved = routeResult?.timeSavedMinutes || 0;

  return (
    <div className="route-planner-container glass-panel">
      <div className="planner-header">
        <Navigation className="header-icon-cyan" size={22} />
        <div>
          <h3>Smart Traffic Route Recommender</h3>
          <p>Driven by real-time K-Means congestion clusters & multi-factor ML scoring</p>
        </div>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="planner-inputs-grid">
        <div className="input-group">
          <label><MapPin size={16} className="text-emerald" /> Origin (Start Point A)</label>
          <select 
            value={startNodeId} 
            onChange={(e) => setStartNodeId(e.target.value)}
            className="custom-select"
          >
            {CITY_NODES.map(node => (
              <option key={node.id} value={node.id} disabled={node.id === targetNodeId}>
                {node.name} ({node.id})
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label><Navigation size={16} className="text-rose" /> Destination (Target Point B)</label>
          <select 
            value={targetNodeId} 
            onChange={(e) => setTargetNodeId(e.target.value)}
            className="custom-select"
          >
            {CITY_NODES.map(node => (
              <option key={node.id} value={node.id} disabled={node.id === startNodeId}>
                {node.name} ({node.id})
              </option>
            ))}
          </select>
        </div>

        <div className="input-action">
          <button className="btn-calc-route" onClick={calculateRoute}>
            <Zap size={18} /> Compute Routes
          </button>
        </div>
      </div>

      {/* Time Savings Banner */}
      {timeSaved > 0 && (
        <div className="time-savings-banner">
          <Zap size={20} className="banner-zap" />
          <span>
            <strong>K-Means Smart Route saves ~{timeSaved} minutes</strong> compared to standard shortest distance route by avoiding high-density cluster bottlenecks!
          </span>
        </div>
      )}

      {/* Route Comparison Cards */}
      {routeResult ? (
        <div className="route-cards-grid">
          {/* 1. K-Means Smart Route */}
          <div 
            className={`route-card ${activeRouteType === 'kmeans_smart' ? 'active-card' : ''}`}
            onClick={() => setActiveRouteType('kmeans_smart')}
          >
            <div className="route-card-header">
              <span className="recommended-badge">
                <CheckCircle2 size={12} /> Recommended
              </span>
              <h4>K-Means ML Smart Route</h4>
            </div>

            <div className="route-metrics">
              <div className="r-metric">
                <Clock size={16} />
                <span><strong>{smartRoute?.totalTravelMinutes}</strong> mins</span>
              </div>
              <div className="r-metric">
                <Compass size={16} />
                <span><strong>{smartRoute?.totalDistanceKm}</strong> km</span>
              </div>
              <div className="r-metric">
                <span>Avg Speed: <strong>{smartRoute?.avgSpeed}</strong> km/h</span>
              </div>
            </div>

            <div className="route-status">
              <ShieldCheck size={14} className="text-emerald" />
              <span>Optimized to bypass severe gridlock & weather bottlenecks.</span>
            </div>
          </div>

          {/* 2. Shortest Distance Route */}
          <div 
            className={`route-card ${activeRouteType === 'distance' ? 'active-card' : ''}`}
            onClick={() => setActiveRouteType('distance')}
          >
            <div className="route-card-header">
              <span className="standard-badge">Direct Distance</span>
              <h4>Shortest Physical Path</h4>
            </div>

            <div className="route-metrics">
              <div className="r-metric">
                <Clock size={16} />
                <span><strong>{distanceRoute?.totalTravelMinutes}</strong> mins</span>
              </div>
              <div className="r-metric">
                <Compass size={16} />
                <span><strong>{distanceRoute?.totalDistanceKm}</strong> km</span>
              </div>
              <div className="r-metric">
                <span>Avg Speed: <strong>{distanceRoute?.avgSpeed}</strong> km/h</span>
              </div>
            </div>

            <div className="route-status">
              {distanceRoute?.hasAnomaly ? (
                <span className="text-rose flex-align"><AlertCircle size={14} /> Passes through severe incident zone!</span>
              ) : (
                <span>Ignores live traffic congestion & signal delays.</span>
              )}
            </div>
          </div>

          {/* 3. Historical Pattern Route */}
          <div 
            className={`route-card ${activeRouteType === 'historical' ? 'active-card' : ''}`}
            onClick={() => setActiveRouteType('historical')}
          >
            <div className="route-card-header">
              <span className="historical-badge">Historical Baseline</span>
              <h4>Predictive Time Route</h4>
            </div>

            <div className="route-metrics">
              <div className="r-metric">
                <Clock size={16} />
                <span><strong>{historicalRoute?.totalTravelMinutes}</strong> mins</span>
              </div>
              <div className="r-metric">
                <Compass size={16} />
                <span><strong>{historicalRoute?.totalDistanceKm}</strong> km</span>
              </div>
              <div className="r-metric">
                <span>Avg Speed: <strong>{historicalRoute?.avgSpeed}</strong> km/h</span>
              </div>
            </div>

            <div className="route-status">
              <span>Based on historical rush-hour day averages.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-route-state">
          <p>Select origin & destination nodes and click <strong>Compute Routes</strong> to analyze navigation options.</p>
        </div>
      )}

      {/* Turn-by-Turn Segment Breakdown */}
      {routeResult && (
        <div className="turn-by-turn-section">
          <h4>Turn-by-Turn Route Segments</h4>
          <div className="segments-timeline">
            {((activeRouteType === 'kmeans_smart' ? smartRoute : activeRouteType === 'distance' ? distanceRoute : historicalRoute)?.pathSegments || []).map((seg, idx) => (
              <div key={seg.id} className="timeline-step">
                <div className="step-num">{idx + 1}</div>
                <div className="step-content">
                  <div className="step-title">
                    <strong>{seg.name}</strong> ({seg.distanceKm} km)
                  </div>
                  <div className="step-tags">
                    <span className="step-cluster-tag" style={{ backgroundColor: seg.clusterColor }}>
                      {seg.clusterName}
                    </span>
                    <span>Speed: {seg.speed} km/h</span>
                    <span>Volume: {seg.volume} veh/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
