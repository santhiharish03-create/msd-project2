import React, { useState, useEffect } from 'react';
import { FaWifi, FaBell, FaClock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import socketService from '../services/socketService';

const RealTimeStatus = () => {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    socketService.connect();

    socketService.on('connect', () => {
      setConnected(true);
      toast.success('Real-time connection established');
    });

    socketService.on('disconnect', () => {
      setConnected(false);
      toast.error('Real-time connection lost');
    });

    socketService.on('timetableUploaded', (data) => {
      setLastUpdate(new Date());
      setUpdates(prev => [{
        type: 'upload',
        message: `${data.count} timetables uploaded`,
        timestamp: new Date(),
        data
      }, ...prev.slice(0, 4)]);
      toast.success(`New timetables uploaded: ${data.sections.join(', ')}`);
    });

    socketService.on('timetableUpdated', (data) => {
      setLastUpdate(new Date());
      setUpdates(prev => [{
        type: 'update',
        message: `Section ${data.section} updated`,
        timestamp: new Date(),
        data
      }, ...prev.slice(0, 4)]);
      toast.info(`Timetable updated: Section ${data.section}`);
    });

    socketService.on('timetableCreated', (data) => {
      setLastUpdate(new Date());
      setUpdates(prev => [{
        type: 'create',
        message: `Section ${data.section} created`,
        timestamp: new Date(),
        data
      }, ...prev.slice(0, 4)]);
      toast.success(`New timetable created: Section ${data.section}`);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="realtime-status">
      <div className="status-header">
        <div className="connection-status">
          <FaWifi className={`status-icon ${connected ? 'connected' : 'disconnected'}`} />
          <span className={`status-text ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
        {lastUpdate && (
          <div className="last-update">
            <FaClock className="clock-icon" />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {updates.length > 0 && (
        <div className="recent-updates">
          <h4><FaBell /> Recent Updates</h4>
          <div className="updates-list">
            {updates.map((update, index) => (
              <div key={index} className={`update-item ${update.type}`}>
                <span className="update-message">{update.message}</span>
                <span className="update-time">
                  {update.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .realtime-status {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid ${connected ? '#28a745' : '#dc3545'};
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-icon.connected {
          color: #28a745;
        }

        .status-icon.disconnected {
          color: #dc3545;
        }

        .status-text.connected {
          color: #28a745;
          font-weight: 600;
        }

        .status-text.disconnected {
          color: #dc3545;
          font-weight: 600;
        }

        .last-update {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #666;
        }

        .clock-icon {
          color: #007bff;
        }

        .recent-updates h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #333;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .updates-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .update-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .update-item.upload {
          background: #e8f5e8;
          border-left: 3px solid #28a745;
        }

        .update-item.update {
          background: #e3f2fd;
          border-left: 3px solid #007bff;
        }

        .update-item.create {
          background: #fff3cd;
          border-left: 3px solid #ffc107;
        }

        .update-message {
          font-weight: 500;
        }

        .update-time {
          color: #666;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default RealTimeStatus;