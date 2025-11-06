import React, { useState, useEffect } from 'react';
import { FaWifi, FaCircle, FaClock, FaDatabase, FaSync } from 'react-icons/fa';
import realTimeEngine from '../services/realTimeEngine';

const RealTimeStatus = () => {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [dataStats, setDataStats] = useState({ sections: 0, rooms: 0, faculty: 0 });

  useEffect(() => {
    const handleDashboardUpdate = (data) => {
      setConnected(true);
      setLastUpdate(new Date());
      setDataStats(data.stats || { sections: 0, rooms: 0, faculty: 0 });
      
      setUpdates(prev => [{
        type: 'dashboard',
        message: `Dashboard refreshed - ${data.stats?.sections || 0} sections active`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
    };
    
    const handleTimetableUpdate = (timetables) => {
      setLastUpdate(new Date());
      setUpdates(prev => [{
        type: 'timetable',
        message: `${(timetables || []).length} timetables synchronized`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
    };
    
    const handleRoomUpdate = (rooms) => {
      setLastUpdate(new Date());
      const available = (rooms || []).filter(r => r.status === 'available').length;
      setUpdates(prev => [{
        type: 'room',
        message: `Room status updated - ${available} available`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
    };
    
    const handleFacultyUpdate = (faculty) => {
      setLastUpdate(new Date());
      const available = (faculty || []).filter(f => f.status === 'available').length;
      setUpdates(prev => [{
        type: 'faculty',
        message: `Faculty status updated - ${available} available`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
    };
    
    realTimeEngine.subscribe('dashboard', handleDashboardUpdate);
    realTimeEngine.subscribe('timetables', handleTimetableUpdate);
    realTimeEngine.subscribe('rooms', handleRoomUpdate);
    realTimeEngine.subscribe('faculty', handleFacultyUpdate);
    
    const statusInterval = setInterval(() => {
      setConnected(realTimeEngine.isRunning);
    }, 1000);
    
    return () => {
      realTimeEngine.unsubscribe('dashboard', handleDashboardUpdate);
      realTimeEngine.unsubscribe('timetables', handleTimetableUpdate);
      realTimeEngine.unsubscribe('rooms', handleRoomUpdate);
      realTimeEngine.unsubscribe('faculty', handleFacultyUpdate);
      clearInterval(statusInterval);
    };
  }, []);

  const formatTime = (date) => {
    return date ? date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }) : 'Never';
  };

  return (
    <div className="real-time-status">
      <div className="status-header">
        <div className="connection-status">
          <FaWifi className={`wifi-icon ${connected ? 'connected' : 'disconnected'}`} />
          <span className={`status-text ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'Live Data' : 'Offline'}
          </span>
          <FaCircle className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
        </div>
        
        <div className="data-stats">
          <FaDatabase className="db-icon" />
          <span>{dataStats.sections}S | {dataStats.rooms}R | {dataStats.faculty}F</span>
        </div>
        
        <div className="last-update">
          <FaClock className="clock-icon" />
          <span>{formatTime(lastUpdate)}</span>
        </div>
      </div>
      
      {updates.length > 0 && (
        <div className="recent-updates">
          <div className="updates-header">
            <FaSync className="sync-icon" />
            <span>Live Updates</span>
          </div>
          <ul className="updates-list">
            {updates.map((update, index) => (
              <li key={index} className={`update-item ${update.type}`}>
                <span className="update-message">{update.message}</span>
                <span className="update-time">{formatTime(update.timestamp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RealTimeStatus;