import React from 'react';
import { Activity, Navigation, BarChart3, Sliders, AlertTriangle, Moon, Sun, ShieldCheck, MapPin } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isDarkMode, setIsDarkMode, isLiveStreaming, setIsLiveStreaming }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <Activity className="brand-icon pulsing" />
        </div>
        <div className="brand-text">
          <h1>TrafficPulse <span className="version-tag">Gurgaon ML</span></h1>
          <p className="brand-subtitle">Gurgaon (Gurugram) Multi-Factor Congestion Tracker & Route Optimizer</p>
        </div>
      </div>

      <nav className="header-nav desktop-nav">
        <button 
          className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Navigation size={18} />
          <span>Live Map & Routing</span>
        </button>
        
        <button 
          className={`nav-btn ${activeTab === 'hotspot' ? 'active' : ''}`}
          onClick={() => setActiveTab('hotspot')}
        >
          <MapPin size={18} />
          <span>Hotspot Deep Dive</span>
        </button>

        <button 
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} />
          <span>K-Means Clusters</span>
        </button>

        <button 
          className={`nav-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <Sliders size={18} />
          <span>Factor Simulator</span>
        </button>

        <button 
          className={`nav-btn ${activeTab === 'anomaly' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomaly')}
        >
          <AlertTriangle size={18} />
          <span>Irregular Events</span>
        </button>
      </nav>

      <div className="header-controls">
        <button 
          className={`live-toggle-btn ${isLiveStreaming ? 'active' : ''}`}
          onClick={() => setIsLiveStreaming(!isLiveStreaming)}
          title="Toggle live simulated traffic telemetry feed"
        >
          <span className="live-dot"></span>
          <span>{isLiveStreaming ? 'LIVE FEED ON' : 'PAUSED'}</span>
        </button>

        <button 
          className="theme-toggle-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Mobile Tab Bar */}
      <div className="mobile-nav-bar">
        <button 
          className={`mobile-tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Navigation size={20} />
          <span>Map</span>
        </button>

        <button 
          className={`mobile-tab ${activeTab === 'hotspot' ? 'active' : ''}`}
          onClick={() => setActiveTab('hotspot')}
        >
          <MapPin size={20} />
          <span>Hotspot</span>
        </button>

        <button 
          className={`mobile-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={20} />
          <span>Clusters</span>
        </button>

        <button 
          className={`mobile-tab ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <Sliders size={20} />
          <span>Simulate</span>
        </button>

        <button 
          className={`mobile-tab ${activeTab === 'anomaly' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomaly')}
        >
          <AlertTriangle size={20} />
          <span>Anomalies</span>
        </button>
      </div>
    </header>
  );
}
