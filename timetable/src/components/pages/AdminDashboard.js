import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaChalkboardTeacher, FaDoorOpen, FaBullhorn, FaUsers, FaChartLine, FaSpinner, FaUpload, FaCogs, FaShieldAlt } from 'react-icons/fa';
import realTimeEngine from '../../services/realTimeEngine';
import { NotificationBusinessLogic } from '../../services/businessLogic';
import { useAuth } from '../../contexts/AuthContext';
import RealTimeStatus from '../RealTimeStatus';
import InteractiveCard from '../InteractiveCard';
import campusImage from '../../assets/vignan-logo.png';
import './Dashboard.css';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({ sections: 0, rooms: 0, faculty: 0, occupancyRate: 0 });
  const [liveClasses, setLiveClasses] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const handleDashboardUpdate = (data) => {
      if (!data) return;
      
      setStats(data.stats || { sections: 0, rooms: 0, faculty: 0, occupancyRate: 0 });
      setLiveClasses(data.liveClasses || []);
      setConnected(realTimeEngine.isRunning);
      setLoading(false);
    };
    
    const handleAnnouncementUpdate = (announcements) => {
      if (!announcements) return;
      
      // Ensure announcements is an array
      const announcementArray = Array.isArray(announcements) ? announcements : (announcements.data || []);
      
      const filtered = announcementArray
        .filter(notification => NotificationBusinessLogic.shouldShowNotification(notification, user))
        .slice(0, 3);
      const prioritized = NotificationBusinessLogic.prioritizeNotifications(filtered);
      setAnnouncements(prioritized);
    };
    
    const handleRoomUpdate = (rooms) => {
      if (!rooms) return;
      setAvailableRooms(rooms.filter(r => r.status === 'available').slice(0, 3));
    };
    
    realTimeEngine.subscribe('dashboard', handleDashboardUpdate);
    realTimeEngine.subscribe('announcements', handleAnnouncementUpdate);
    realTimeEngine.subscribe('rooms', handleRoomUpdate);
    realTimeEngine.start();

    return () => {
      clearInterval(clockTimer);
      realTimeEngine.unsubscribe('dashboard', handleDashboardUpdate);
      realTimeEngine.unsubscribe('announcements', handleAnnouncementUpdate);
      realTimeEngine.unsubscribe('rooms', handleRoomUpdate);
    };
  }, [user]);

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="admin-dashboard">
      <RealTimeStatus />
      
      <section className="admin-welcome">
        <div className="welcome-content">
          <div className="admin-badge">
            <FaShieldAlt /> Administrator
          </div>
          <h1>Admin Dashboard</h1>
          <p>Complete system management and oversight</p>
          <div className="current-time">
            <FaClock /> {getCurrentTimeString()}
          </div>
        </div>
        <img src={campusImage} alt="Vignan Logo" className="dashboard-logo" />
      </section>

      <section className="admin-metrics">
        <div className="metric-item">
          <FaCalendarAlt className="metric-icon" />
          <div className="metric-content">
            <p className="metric-value">{loading ? <FaSpinner className="spin" /> : stats.sections}</p>
            <p className="metric-label">Sections</p>
          </div>
        </div>
        <div className="metric-item">
          <FaDoorOpen className="metric-icon" />
          <div className="metric-content">
            <p className="metric-value">{loading ? <FaSpinner className="spin" /> : stats.rooms}</p>
            <p className="metric-label">Classrooms</p>
          </div>
        </div>
        <div className="metric-item">
          <FaUsers className="metric-icon" />
          <div className="metric-content">
            <p className="metric-value">{loading ? <FaSpinner className="spin" /> : stats.faculty}</p>
            <p className="metric-label">Faculty</p>
          </div>
        </div>
        <div className="metric-item">
          <FaChartLine className="metric-icon" />
          <div className="metric-content">
            <p className="metric-value">{loading ? <FaSpinner className="spin" /> : `${stats.occupancyRate}%`}</p>
            <p className="metric-label">Occupancy</p>
          </div>
        </div>
      </section>

      <section className="admin-controls">
        <h2>Administrative Controls</h2>
        <div className="admin-grid">
          <Link to="/timetable" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Manage Timetables"
              description="Create, edit, and manage all section timetables"
              icon={FaCalendarAlt}
            />
          </Link>
          <Link to="/faculty" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Faculty Management"
              description="Monitor faculty schedules and workload distribution"
              icon={FaChalkboardTeacher}
            />
          </Link>
          <Link to="/rooms" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Room Management"
              description="Monitor room utilization and manage bookings"
              icon={FaDoorOpen}
            />
          </Link>
          <Link to="/upload" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Data Upload"
              description="Upload Excel files to import timetable data"
              icon={FaUpload}
            />
          </Link>
          <Link to="/generate" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Generate Timetables"
              description="Auto-generate optimized timetables"
              icon={FaCogs}
            />
          </Link>
          <Link to="/class" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="System Overview"
              description="Complete system analytics and reports"
              icon={FaBullhorn}
            />
          </Link>
        </div>
      </section>

      {liveClasses.length > 0 && (
        <section className="live-classes">
          <h2>Live Classes</h2>
          <div className="classes-grid">
            {liveClasses.map((cls, index) => (
              <div key={index} className="live-class-card">
                <h4>{cls.subject}</h4>
                <p>Section: {cls.section}</p>
                <p>Faculty: {cls.faculty}</p>
                <p>Room: {cls.room}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section className="admin-announcements">
          <h2>System Announcements</h2>
          {announcements.map((announcement, index) => (
            <div key={index} className="announcement-card admin">
              <h4>{announcement.title}</h4>
              <p>{announcement.message}</p>
              <div className="announcement-meta">
                <span className="priority">{announcement.priority}</span>
                <span className="date">{announcement.date}</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;