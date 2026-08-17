import React from 'react';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from 'chart.js';
import { Radar, Line, Bar } from 'react-chartjs-2';
import { Sliders, Cpu, Activity, Info, BarChart2, PieChart, Layers } from 'lucide-react';
import { TRAFFIC_FACTORS } from '../services/kmeansEngine';

ChartJS.register(
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement
);

export default function ClusterAnalytics({ 
  clustersInfo, 
  inertia, 
  elbowData, 
  kValue, 
  setKValue, 
  triggerKMeansRetrain,
  isDarkMode 
}) {

  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Prepare Radar Chart Data for Multi-Factor Centroid Comparison
  const radarLabels = TRAFFIC_FACTORS.map(f => f.label);
  const radarDatasets = clustersInfo.map(cluster => {
    // Collect factor averages
    const factorValues = TRAFFIC_FACTORS.map(f => {
      const val = cluster.factorAverages[f.key] || 0;
      // Rough scale normalization for radar display (0-100)
      if (f.key === 'volume') return Math.min(100, (val / 3500) * 100);
      if (f.key === 'speed') return Math.min(100, (val / 90) * 100);
      if (f.key === 'density') return Math.min(100, (val / 120) * 100);
      if (f.key === 'timeOfDay') return (val / 24) * 100;
      if (f.key === 'dayOfWeek') return (val / 7) * 100;
      if (f.key === 'precipitation') return (val / 3) * 100;
      if (f.key === 'capacity') return (val / 4000) * 100;
      if (f.key === 'vehicleMix') return Math.min(100, val * 2.5);
      return Math.min(100, val * 25);
    });

    return {
      label: cluster.name,
      data: factorValues,
      backgroundColor: `${cluster.color}25`,
      borderColor: cluster.color,
      borderWidth: 2,
      pointBackgroundColor: cluster.color,
      pointBorderColor: '#fff',
      pointHoverRadius: 6
    };
  });

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: gridColor },
        grid: { color: gridColor },
        pointLabels: { color: textColor, font: { family: 'Inter', size: 11 } },
        ticks: { display: false, max: 100 }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor, font: { family: 'Inter', size: 12 } }
      }
    }
  };

  // Prepare Line Chart Data for Elbow Method (Inertia vs K)
  const elbowChartData = {
    labels: elbowData.map(d => `K = ${d.k}`),
    datasets: [{
      label: 'Within-Cluster Sum of Squares (Inertia)',
      data: elbowData.map(d => d.inertia),
      borderColor: '#00f2fe',
      backgroundColor: 'rgba(0, 242, 254, 0.15)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: '#00f2fe'
    }]
  };

  const elbowChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor } },
      y: { grid: { color: gridColor }, ticks: { color: textColor } }
    },
    plugins: {
      legend: { labels: { color: textColor } }
    }
  };

  return (
    <div className="analytics-container">
      {/* Controls & Engine Status Header */}
      <div className="analytics-header glass-panel">
        <div className="engine-title">
          <Cpu className="icon-cyan" />
          <div>
            <h3>K-Means Machine Learning Engine</h3>
            <p>Multi-Factor Vector Clustering & Feature Profiling</p>
          </div>
        </div>

        <div className="engine-controls">
          <div className="k-slider-group">
            <label>Number of Clusters (K): <strong>{kValue}</strong></label>
            <input 
              type="range" 
              min="3" 
              max="5" 
              step="1" 
              value={kValue}
              onChange={(e) => setKValue(Number(e.target.value))}
            />
          </div>

          <button className="btn-retrain" onClick={triggerKMeansRetrain}>
            <Activity size={16} /> Re-Train Model
          </button>
        </div>

        <div className="engine-stat">
          <span className="stat-lbl">Model Inertia (WCSS)</span>
          <span className="stat-val">{inertia}</span>
        </div>
      </div>

      {/* Cluster Profiles Cards Grid */}
      <div className="cluster-cards-grid">
        {clustersInfo.map(cluster => (
          <div key={cluster.clusterId} className="cluster-card glass-panel" style={{ borderTop: `4px solid ${cluster.color}` }}>
            <div className="cluster-card-header">
              <span className="cluster-badge-pill" style={{ backgroundColor: cluster.color }}>
                Cluster {cluster.clusterId}
              </span>
              <h4>{cluster.name}</h4>
              <span className="cluster-pct">{cluster.percentage}%</span>
            </div>

            <p className="cluster-desc">{cluster.description}</p>
            <div className="cluster-member-count">
              <strong>{cluster.memberCount}</strong> segments classified
            </div>

            {/* Unnormalized Factor Averages */}
            <div className="factor-averages-list">
              <div className="factor-row">
                <span>Avg Volume:</span> <strong>{cluster.factorAverages.volume} veh/hr</strong>
              </div>
              <div className="factor-row">
                <span>Avg Speed:</span> <strong>{cluster.factorAverages.speed} km/h</strong>
              </div>
              <div className="factor-row">
                <span>Avg Density:</span> <strong>{cluster.factorAverages.density} veh/km</strong>
              </div>
              <div className="factor-row">
                <span>Precipitation:</span> <strong>{['Clear', 'Light Rain', 'Heavy Rain', 'Snow'][Math.round(cluster.factorAverages.precipitation) || 0]}</strong>
              </div>
              <div className="factor-row">
                <span>Vehicle Mix:</span> <strong>{cluster.factorAverages.vehicleMix}% Heavy</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizers Grid */}
      <div className="charts-dual-grid">
        {/* Multi-Factor Radar Chart */}
        <div className="chart-panel glass-panel">
          <div className="panel-title">
            <PieChart size={18} />
            <h4>Multi-Factor Cluster Fingerprint Radar</h4>
          </div>
          <div className="radar-chart-wrapper">
            <Radar data={{ labels: radarLabels, datasets: radarDatasets }} options={radarOptions} />
          </div>
        </div>

        {/* Elbow Curve Inertia Chart */}
        <div className="chart-panel glass-panel">
          <div className="panel-title">
            <BarChart2 size={18} />
            <h4>Elbow Method (Inertia vs. Number of Clusters)</h4>
          </div>
          <div className="line-chart-wrapper">
            <Line data={elbowChartData} options={elbowChartOptions} />
          </div>
          <p className="elbow-hint">
            <Info size={14} /> The "elbow point" where inertia reduction levels off determines the optimal value of K for segment clustering.
          </p>
        </div>
      </div>
    </div>
  );
}
