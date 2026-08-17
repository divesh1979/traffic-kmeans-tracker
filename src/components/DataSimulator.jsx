import React from 'react';
import { Sliders, Sun, CloudRain, Truck, Calendar, Clock, Play, Pause, RefreshCw, AlertOctagon } from 'lucide-react';

export default function DataSimulator({
  envConfig,
  setEnvConfig,
  isLiveStreaming,
  setIsLiveStreaming,
  regenerateData
}) {

  const handleSliderChange = (key, value) => {
    setEnvConfig(prev => ({ ...prev, [key]: value }));
  };

  const hours = envConfig.timeOfDay || 17;
  const isMorningRush = hours >= 7 && hours <= 9;
  const isEveningRush = hours >= 16 && hours <= 19;

  return (
    <div className="simulator-container glass-panel">
      <div className="simulator-header">
        <Sliders className="header-icon-cyan" size={22} />
        <div>
          <h3>Multi-Factor Traffic & Environmental Simulator</h3>
          <p>Adjust environmental factors to observe real-time K-Means cluster re-calculation & route divergence</p>
        </div>
      </div>

      <div className="simulator-grid">
        {/* 1. Time of Day Control */}
        <div className="sim-control-card">
          <div className="sim-card-title">
            <Clock size={18} />
            <span>Time of Day (00:00 - 23:00)</span>
          </div>
          <div className="time-display">
            <strong>{hours < 10 ? `0${hours}` : hours}:00</strong>
            {isMorningRush && <span className="rush-badge morning">AM Rush Hour</span>}
            {isEveningRush && <span className="rush-badge evening">PM Rush Hour</span>}
            {!isMorningRush && !isEveningRush && <span className="rush-badge offpeak">Off-Peak Flow</span>}
          </div>
          <input 
            type="range" 
            min="0" 
            max="23" 
            step="1"
            value={envConfig.timeOfDay} 
            onChange={(e) => handleSliderChange('timeOfDay', Number(e.target.value))}
            className="sim-slider"
          />
        </div>

        {/* 2. Day of Week */}
        <div className="sim-control-card">
          <div className="sim-card-title">
            <Calendar size={18} />
            <span>Day of the Week</span>
          </div>
          <select 
            value={envConfig.dayOfWeek}
            onChange={(e) => handleSliderChange('dayOfWeek', Number(e.target.value))}
            className="custom-select"
          >
            <option value={1}>Monday (Commute Day)</option>
            <option value={2}>Tuesday (Peak Work Day)</option>
            <option value={3}>Wednesday (Midweek Flow)</option>
            <option value={4}>Thursday (High Volume)</option>
            <option value={5}>Friday (Weekend Commute Peak)</option>
            <option value={6}>Saturday (Leisure & Shopping)</option>
            <option value={0}>Sunday (Low Volume)</option>
          </select>
        </div>

        {/* 3. Precipitation / Weather Condition */}
        <div className="sim-control-card">
          <div className="sim-card-title">
            <CloudRain size={18} />
            <span>Precipitation (Weather Impact)</span>
          </div>
          <div className="weather-buttons-group">
            {[
              { val: 0, label: 'Clear ☀️' },
              { val: 1, label: 'Rain 🌧️' },
              { val: 2, label: 'Heavy Rain ⛈️' },
              { val: 3, label: 'Snow ❄️' }
            ].map(w => (
              <button 
                key={w.val}
                className={`weather-btn ${envConfig.precipitation === w.val ? 'active' : ''}`}
                onClick={() => handleSliderChange('precipitation', w.val)}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Vehicle Mix (% Heavy Freight/Trucks) */}
        <div className="sim-control-card">
          <div className="sim-card-title">
            <Truck size={18} />
            <span>Vehicle Mix (Heavy Vehicles %)</span>
          </div>
          <div className="slider-val-header">
            <span>Truck / Freight Ratio:</span>
            <strong>{envConfig.vehicleMixHeavy}%</strong>
          </div>
          <input 
            type="range" 
            min="5" 
            max="45" 
            step="5"
            value={envConfig.vehicleMixHeavy} 
            onChange={(e) => handleSliderChange('vehicleMixHeavy', Number(e.target.value))}
            className="sim-slider"
          />
        </div>

        {/* 5. Rush Hour Multiplier */}
        <div className="sim-control-card">
          <div className="sim-card-title">
            <AlertOctagon size={18} />
            <span>Rush Hour Volume Multiplier</span>
          </div>
          <div className="slider-val-header">
            <span>Demand Multiplier:</span>
            <strong>{envConfig.rushHourMultiplier}x</strong>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="2.2" 
            step="0.1"
            value={envConfig.rushHourMultiplier} 
            onChange={(e) => handleSliderChange('rushHourMultiplier', Number(e.target.value))}
            className="sim-slider"
          />
        </div>

        {/* 6. Seasonality Selector */}
        <div className="sim-control-card">
          <div className="sim-card-title">
            <Sun size={18} />
            <span>Seasonality & Holiday Impact</span>
          </div>
          <select 
            value={envConfig.seasonality}
            onChange={(e) => handleSliderChange('seasonality', Number(e.target.value))}
            className="custom-select"
          >
            <option value={0}>Winter Season</option>
            <option value={1}>Spring Season (Normal Flow)</option>
            <option value={2}>Summer Vacation (Tourism Peak)</option>
            <option value={3}>Autumn / Fall Season</option>
          </select>
        </div>
      </div>

      {/* Simulator Action Controls */}
      <div className="simulator-actions">
        <button 
          className={`btn-stream ${isLiveStreaming ? 'streaming' : ''}`}
          onClick={() => setIsLiveStreaming(!isLiveStreaming)}
        >
          {isLiveStreaming ? <Pause size={18} /> : <Play size={18} />}
          <span>{isLiveStreaming ? 'Pause Live Sensor Feed' : 'Start Live Telemetry Stream'}</span>
        </button>

        <button className="btn-regenerate" onClick={regenerateData}>
          <RefreshCw size={18} /> Regenerate Random Telemetry
        </button>
      </div>
    </div>
  );
}
