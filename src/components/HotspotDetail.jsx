import React, { useState } from 'react';
import { MapPin, Navigation, Gauge, Layers, Clock, AlertTriangle, Truck, Car, Bus, Droplets, Compass, ChevronRight, Activity } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { CITY_NODES, INITIAL_SEGMENTS } from '../services/trafficDataGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

// Detailed Hotspot Meta Definitions for Gurgaon
export const HOTSPOT_LOCATIONS = [
  {
    id: 'H1',
    nodeId: 'N2',
    name: 'Cyber City & Shankar Chowk Hub',
    corridor: 'Delhi-Gurgaon NH-48 Expressway & Cyber City Toll',
    type: 'Commercial / Corporate Transit Hub',
    typicalPeak: '8:30 AM - 10:30 AM & 5:30 PM - 8:30 PM',
    detourSuggestion: 'Use Ambience Mall Service Road or Golf Course Road Underpass (S7) to bypass Shankar Chowk bottle-neck.',
    lanes: 5,
    speedLimit: 80,
    waterloggingRisk: 'Moderate (Cyber City Underpasses)'
  },
  {
    id: 'H2',
    nodeId: 'N3',
    name: 'IFFCO Chowk Interchange & Flyover',
    corridor: 'NH-48 & MG Road Crossing',
    type: 'Major Arterial Interchange',
    typicalPeak: '8:00 AM - 11:00 AM & 5:00 PM - 9:00 PM',
    detourSuggestion: 'Divert via MG Road Metro Station (S6) or take Sukhrali inner road towards Rajiv Chowk.',
    lanes: 4,
    speedLimit: 80,
    waterloggingRisk: 'High (IFFCO Chowk Underpass)'
  },
  {
    id: 'H3',
    nodeId: 'N4',
    name: 'Rajiv Chowk (NH-48 Central Crossing)',
    corridor: 'NH-48 & Sohna Road Junction',
    type: 'Central Highway & Transit Terminal',
    typicalPeak: '7:30 AM - 11:00 AM & 4:30 PM - 9:30 PM',
    detourSuggestion: 'Take Sector 15 / Old Railway Road bypass or use Southern Peripheral Road (SPR) for southbound traffic.',
    lanes: 4,
    speedLimit: 80,
    waterloggingRisk: 'High'
  },
  {
    id: 'H4',
    nodeId: 'N5',
    name: 'Hero Honda Chowk & Service Road',
    corridor: 'NH-48 Expressway (Sector 10A / 34 Entry)',
    type: 'Industrial & Freight Junction',
    typicalPeak: '8:00 AM - 10:30 AM & 5:00 PM - 8:30 PM',
    detourSuggestion: 'Use Dwarka Expressway feeder link (S16) or Sector 10A service road to bypass main flyover queue.',
    lanes: 4,
    speedLimit: 85,
    waterloggingRisk: 'Severe (Monsoon Flash Flooding Spot)'
  },
  {
    id: 'H5',
    nodeId: 'N8',
    name: 'Golf Course Road 16-Lane Expressway',
    corridor: 'Genpact Crossing & Cyber Park Corridor',
    type: 'Signal-Free Rapid Expressway',
    typicalPeak: '8:30 AM - 10:00 AM & 6:00 PM - 8:00 PM',
    detourSuggestion: 'Flow is generally smooth due to underpasses. Use Golf Course Ext Road (S8) for Sector 56 destination.',
    lanes: 4,
    speedLimit: 70,
    waterloggingRisk: 'Low (Underpasses pumped)'
  },
  {
    id: 'H6',
    nodeId: 'N10',
    name: 'Subhash Chowk (Sohna Road Commercial)',
    corridor: 'Sohna Road & Sector 47/48 Commercial Hub',
    type: 'Urban Signalized Junction',
    typicalPeak: '8:00 AM - 11:00 AM & 5:00 PM - 9:00 PM',
    detourSuggestion: 'Use Netaji Subhash Marg / Huda City Centre Connector (S12) to avoid Sohna Road signal delays.',
    lanes: 3,
    speedLimit: 55,
    waterloggingRisk: 'High (Sector 47 stretch)'
  },
  {
    id: 'H7',
    nodeId: 'N6',
    name: 'Kherki Daula Toll Plaza Corridor',
    corridor: 'NH-48 Expressway & SPR Exit',
    type: 'Toll Barrier & Heavy Goods Terminal',
    typicalPeak: '7:00 AM - 11:00 PM (Heavy Freight at Night)',
    detourSuggestion: 'Use Southern Peripheral Road (S14) to bypass toll plaza directly towards Golf Course Extension.',
    lanes: 4,
    speedLimit: 90,
    waterloggingRisk: 'Moderate'
  }
];

export default function HotspotDetail({ segments, isDarkMode }) {
  const [selectedHotspotId, setSelectedHotspotId] = useState('H1');

  const hotspot = HOTSPOT_LOCATIONS.find(h => h.id === selectedHotspotId) || HOTSPOT_LOCATIONS[0];
  
  // Find related segments connected to this hotspot node
  const relatedSegments = segments.filter(s => s.from === hotspot.nodeId || s.to === hotspot.nodeId);
  const primarySegment = relatedSegments[0] || segments[0] || {};

  // Micro-level metrics calculations
  const volume = primarySegment.volume || 1800;
  const speed = primarySegment.speed || 35;
  const density = primarySegment.density || 45;
  const clusterName = primarySegment.clusterName || 'Moderate Traffic Flow';
  const clusterColor = primarySegment.clusterColor || '#d97706';
  const precipitation = primarySegment.precipitation || 0;
  const vehicleMix = primarySegment.vehicleMix || 15;

  const queueLengthKm = parseFloat(((density / 35) * (primarySegment.distanceKm || 2.5)).toFixed(1));
  const estimatedDelayMins = Math.max(1, Math.round(((primarySegment.distanceKm || 2) / Math.max(speed, 5)) * 60 - ((primarySegment.distanceKm || 2) / (primarySegment.speedLimit || 80)) * 60));

  // Hourly 24h Congestion Profile Data (Live vs 7-Day Average)
  const hoursLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  // Synthetic hourly congestion curve matching peak hours
  const todayCurve = hoursLabels.map((_, h) => {
    let base = 25;
    if ((h >= 8 && h <= 10) || (h >= 17 && h <= 20)) base = 85;
    else if (h >= 11 && h <= 16) base = 50;
    return Math.min(100, base + Math.floor(Math.random() * 12 - 6));
  });

  const avg7DayCurve = hoursLabels.map((_, h) => {
    let base = 22;
    if ((h >= 8 && h <= 10) || (h >= 17 && h <= 20)) base = 78;
    else if (h >= 11 && h <= 16) base = 45;
    return base;
  });

  const lineChartData = {
    labels: hoursLabels,
    datasets: [
      {
        label: "Today's Live Congestion Index (%)",
        data: todayCurve,
        borderColor: clusterColor,
        backgroundColor: `${clusterColor}20`,
        fill: true,
        tension: 0.35,
        pointRadius: 3
      },
      {
        label: '7-Day Historical Average (%)',
        data: avg7DayCurve,
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        fill: false,
        tension: 0.35,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }, ticks: { color: isDarkMode ? '#cbd5e1' : '#475569' } },
      y: { grid: { color: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }, ticks: { color: isDarkMode ? '#cbd5e1' : '#475569' }, max: 100 }
    },
    plugins: {
      legend: { labels: { color: isDarkMode ? '#f8fafc' : '#0f172a', font: { family: 'Inter', size: 12 } } }
    }
  };

  // Vehicle Mix Distribution Breakdown
  const carPct = Math.max(40, 100 - vehicleMix - 25);
  const cabPct = 20;
  const busPct = 5;
  const truckPct = vehicleMix;

  return (
    <div className="hotspot-container glass-panel">
      {/* Header & Location Selector */}
      <div className="hotspot-header">
        <div className="hotspot-title">
          <MapPin className="header-icon-cyan" size={24} />
          <div>
            <h3>Gurgaon Hotspot Micro-Level Analytics</h3>
            <p>Detailed lane flow, signal delays, queue lengths & micro-detour recommendations</p>
          </div>
        </div>

        {/* Hotspot Dropdown */}
        <div className="hotspot-selector-wrapper">
          <label>Select Gurgaon High-Traffic Location:</label>
          <select 
            value={selectedHotspotId} 
            onChange={(e) => setSelectedHotspotId(e.target.value)}
            className="custom-select hotspot-select"
          >
            {HOTSPOT_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>
                📍 {loc.name} ({loc.corridor})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Location Summary Card */}
      <div className="location-banner glass-panel" style={{ borderLeft: `6px solid ${clusterColor}` }}>
        <div className="loc-main-info">
          <span className="loc-cluster-badge" style={{ backgroundColor: clusterColor }}>
            {clusterName}
          </span>
          <h2>{hotspot.name}</h2>
          <p className="loc-corridor"><strong>Corridor:</strong> {hotspot.corridor} | <strong>Type:</strong> {hotspot.type}</p>
          <p className="loc-peak"><strong>Typical Peak Hours:</strong> {hotspot.typicalPeak}</p>
        </div>

        <div className="loc-quick-metrics">
          <div className="q-metric-box">
            <span className="q-lbl">Queue Standstill Length</span>
            <span className="q-val text-amber">{queueLengthKm} km</span>
          </div>
          <div className="q-metric-box">
            <span className="q-lbl">Average Bottleneck Delay</span>
            <span className="q-val text-rose">+{estimatedDelayMins} mins</span>
          </div>
          <div className="q-metric-box">
            <span className="q-lbl">Speed Drop Ratio</span>
            <span className="q-val">{Math.round((speed / hotspot.speedLimit) * 100)}% <small>of speed limit</small></span>
          </div>
        </div>
      </div>

      {/* Micro-Metrics Detailed Grid */}
      <div className="micro-metrics-grid">
        {/* 1. Flow & Density Meter */}
        <div className="micro-card glass-panel">
          <h4><Gauge size={16} /> Traffic Flow & Density Stats</h4>
          <div className="micro-stats-list">
            <div className="m-row">
              <span>Hourly Flow Rate (Volume):</span>
              <strong>{volume} veh/hr</strong>
            </div>
            <div className="m-row">
              <span>Vehicle Density:</span>
              <strong>{density} veh/km</strong>
            </div>
            <div className="m-row">
              <span>Actual Speed:</span>
              <strong>{speed} km/h (Limit: {hotspot.speedLimit} km/h)</strong>
            </div>
            <div className="m-row">
              <span>Road Design Capacity:</span>
              <strong>{hotspot.lanes * 1100} veh/hr ({hotspot.lanes} Lanes)</strong>
            </div>
          </div>
        </div>

        {/* 2. Weather & Waterlogging Impact */}
        <div className="micro-card glass-panel">
          <h4><Droplets size={16} /> Waterlogging & Weather Impact</h4>
          <div className="micro-stats-list">
            <div className="m-row">
              <span>Current Weather:</span>
              <strong>{['Clear Sky ☀️', 'Light Rain 🌧️', 'Heavy Rain ⛈️', 'Severe Storm 🌨️'][precipitation]}</strong>
            </div>
            <div className="m-row">
              <span>Monsoon Waterlogging Vulnerability:</span>
              <strong className={hotspot.waterloggingRisk.includes('Severe') ? 'text-rose' : ''}>{hotspot.waterloggingRisk}</strong>
            </div>
            <div className="m-row">
              <span>Road Surface Grip Penalty:</span>
              <strong>{precipitation === 0 ? 'Normal (100%)' : precipitation === 1 ? 'Slight Slip (85%)' : 'Severe Hydroplaning (65%)'}</strong>
            </div>
          </div>
        </div>

        {/* 3. Vehicle Mix Breakdown */}
        <div className="micro-card glass-panel">
          <h4><Truck size={16} /> Vehicle Class Distribution</h4>
          <div className="vehicle-mix-bars">
            <div className="v-bar-item">
              <div className="v-label"><span><Car size={14} /> Passenger Cars</span> <strong>{carPct}%</strong></div>
              <div className="v-progress-bg"><div className="v-progress-fill" style={{ width: `${carPct}%`, backgroundColor: '#0284c7' }}></div></div>
            </div>
            <div className="v-bar-item">
              <div className="v-label"><span>Cabs / Auto-Rickshaws</span> <strong>{cabPct}%</strong></div>
              <div className="v-progress-bg"><div className="v-progress-fill" style={{ width: `${cabPct}%`, backgroundColor: '#d97706' }}></div></div>
            </div>
            <div className="v-bar-item">
              <div className="v-label"><span><Bus size={14} /> Buses & Corporate Shuttles</span> <strong>{busPct}%</strong></div>
              <div className="v-progress-bg"><div className="v-progress-fill" style={{ width: `${busPct}%`, backgroundColor: '#059669' }}></div></div>
            </div>
            <div className="v-bar-item">
              <div className="v-label"><span><Truck size={14} /> Freight & Heavy Trucks</span> <strong>{truckPct}%</strong></div>
              <div className="v-progress-bg"><div className="v-progress-fill" style={{ width: `${truckPct}%`, backgroundColor: '#dc2626' }}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Hourly Congestion Profile Chart */}
      <div className="hotspot-chart-panel glass-panel">
        <div className="panel-title">
          <Clock size={18} />
          <h4>24-Hour Hourly Congestion Index vs. 7-Day Historical Pattern</h4>
        </div>
        <div className="hourly-chart-wrapper">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      {/* Localized Micro-Detour Recommendation */}
      <div className="micro-detour-card glass-panel">
        <div className="detour-title">
          <Compass className="header-icon-cyan" size={20} />
          <h4>Localized Micro-Bypass Recommendation</h4>
        </div>
        <p className="detour-text">{hotspot.detourSuggestion}</p>
      </div>
    </div>
  );
}
