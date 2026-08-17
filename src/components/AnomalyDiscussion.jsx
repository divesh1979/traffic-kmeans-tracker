import React, { useState } from 'react';
import { AlertTriangle, MessageSquare, ThumbsUp, Send, ShieldAlert, PlusCircle, CheckCircle, Flame, Car, CloudRain } from 'lucide-react';
import { INITIAL_SEGMENTS } from '../services/trafficDataGenerator';

export default function AnomalyDiscussion({ 
  anomalies, 
  logAnomalyIncident, 
  resolveAnomalyIncident 
}) {
  const [selectedSegmentId, setSelectedSegmentId] = useState(INITIAL_SEGMENTS[0].id);
  const [incidentType, setIncidentType] = useState('accident');
  const [severity, setSeverity] = useState('high');
  const [description, setDescription] = useState('');
  
  // Discussion thread posts state with Gurgaon incidents
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Gurugram Traffic Police Control Room',
      role: 'Operator',
      time: '8 mins ago',
      segmentName: 'Hero Honda Chowk NH-48 (S4)',
      type: 'Monsoon Waterlogging & Bottleneck',
      text: 'Heavy monsoon rainfall causing 1.5ft waterlogging under Hero Honda Chowk flyover. K-Means engine automatically flagged S4 to Anomaly Cluster. Traffic directed towards Dwarka Expressway (S15/S16) and Golf Course Ext SPR Bypass.',
      likes: 24,
      resolved: false
    },
    {
      id: 2,
      author: 'Cyber City Traffic Commute Bot',
      role: 'System Bot',
      time: '18 mins ago',
      segmentName: 'Kherki Daula Toll Plaza (S5)',
      type: 'Toll Gate Queue Surge',
      text: 'Severe heavy freight queue at Kherki Daula Toll Plaza extending 2.5km. Recommending Southern Peripheral Road (SPR) alternative route for light vehicles.',
      likes: 15,
      resolved: false
    }
  ]);

  const [newCommentText, setNewCommentText] = useState('');

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!description) return;

    const segment = INITIAL_SEGMENTS.find(s => s.id === selectedSegmentId);
    
    // Log anomaly to global traffic state
    logAnomalyIncident(selectedSegmentId, {
      type: incidentType,
      severity,
      description
    });

    // Add to discussion comments
    const newPost = {
      id: Date.now(),
      author: 'Driver User (App)',
      role: 'User',
      time: 'Just now',
      segmentName: `${segment?.name} (${segment?.id})`,
      type: incidentType.toUpperCase(),
      text: description,
      likes: 1,
      resolved: false
    };

    setComments([newPost, ...comments]);
    setDescription('');
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText) return;

    const newPost = {
      id: Date.now(),
      author: 'Field Community Driver',
      role: 'User',
      time: 'Just now',
      segmentName: 'General Traffic Report',
      type: 'Community Alert',
      text: newCommentText,
      likes: 0,
      resolved: false
    };

    setComments([newPost, ...comments]);
    setNewCommentText('');
  };

  const handleLike = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  return (
    <div className="anomaly-container">
      <div className="anomaly-header glass-panel">
        <ShieldAlert className="header-icon-rose" size={24} />
        <div>
          <h3>Irregular Condition & Anomaly Portal</h3>
          <p>Report emergency bottlenecks, road hazards, or signal failures to update live K-Means clusters and dynamic routing</p>
        </div>
      </div>

      <div className="anomaly-dual-grid">
        {/* Incident Reporting Form */}
        <div className="report-card glass-panel">
          <div className="panel-title">
            <PlusCircle size={18} className="text-rose" />
            <h4>Report New Irregular Incident</h4>
          </div>

          <form onSubmit={handleReportSubmit} className="report-form">
            <div className="form-group">
              <label>Affected Road Segment</label>
              <select 
                value={selectedSegmentId} 
                onChange={(e) => setSelectedSegmentId(e.target.value)}
                className="custom-select"
              >
                {INITIAL_SEGMENTS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Incident Type</label>
                <select 
                  value={incidentType} 
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="custom-select"
                >
                  <option value="accident">Vehicle Collision / Crash</option>
                  <option value="signal_failure">Traffic Signal Failure</option>
                  <option value="construction">Emergency Roadwork</option>
                  <option value="weather_hazard">Flooding / Ice Hazard</option>
                  <option value="spill">Hazardous Debris / Spill</option>
                </select>
              </div>

              <div className="form-group">
                <label>Severity Level</label>
                <select 
                  value={severity} 
                  onChange={(e) => setSeverity(e.target.value)}
                  className="custom-select"
                >
                  <option value="medium">Medium Delay (Yellow)</option>
                  <option value="high">High Bottleneck (Orange)</option>
                  <option value="critical">Critical Gridlock / Closure (Violet Anomaly)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Incident Description & Notes</label>
              <textarea 
                rows="3" 
                placeholder="Describe lanes blocked, estimated clearance time, or officer presence..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="custom-textarea"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-submit-report">
              <AlertTriangle size={16} /> Broadcast Incident & Re-Cluster
            </button>
          </form>
        </div>

        {/* Active Anomalies List */}
        <div className="active-anomalies-card glass-panel">
          <div className="panel-title">
            <Flame size={18} className="text-amber" />
            <h4>Active Irregular Conditions ({anomalies.length})</h4>
          </div>

          {anomalies.length > 0 ? (
            <div className="anomalies-list">
              {anomalies.map(anom => (
                <div key={anom.id} className="anomaly-item">
                  <div className="anom-item-header">
                    <span className="anom-badge">ANOMALY DETECTED</span>
                    <h5>{anom.name} ({anom.id})</h5>
                  </div>
                  <p><strong>Type:</strong> {anom.incidentDetails?.type || 'Accident Hazard'}</p>
                  <p>{anom.incidentDetails?.description || 'Severe flow disruption reported.'}</p>
                  <div className="anom-actions">
                    <button 
                      className="btn-resolve"
                      onClick={() => resolveAnomalyIncident(anom.id)}
                    >
                      <CheckCircle size={14} /> Clear Hazard & Restore Flow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-anom-state">
              <CheckCircle size={32} className="text-emerald" />
              <p>No active severe anomalies reported. All segments flowing according to standard multi-factor K-Means clusters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Community & Operator Discussion Feed */}
      <div className="discussion-panel glass-panel">
        <div className="panel-title">
          <MessageSquare size={18} />
          <h4>Live Traffic Anomaly Discussion & Driver Feed</h4>
        </div>

        {/* Post Comment Input */}
        <form onSubmit={handleAddComment} className="comment-input-row">
          <input 
            type="text" 
            placeholder="Share live updates on traffic conditions, delays, or police presence..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="custom-input"
          />
          <button type="submit" className="btn-send">
            <Send size={16} /> Post
          </button>
        </form>

        {/* Posts List */}
        <div className="comments-feed">
          {comments.map(c => (
            <div key={c.id} className="comment-card">
              <div className="comment-header">
                <div className="author-meta">
                  <strong>{c.author}</strong>
                  <span className={`role-badge ${c.role.toLowerCase()}`}>{c.role}</span>
                  <span className="comment-time">• {c.time}</span>
                </div>
                <span className="segment-tag">{c.segmentName}</span>
              </div>

              <p className="comment-body">{c.text}</p>

              <div className="comment-footer">
                <button className="btn-like" onClick={() => handleLike(c.id)}>
                  <ThumbsUp size={14} /> {c.likes} Helpful
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
