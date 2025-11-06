import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaBookOpen, FaBell } from 'react-icons/fa';
import realTimeEngine from '../../services/realTimeEngine';
import { useAuth } from '../../contexts/AuthContext';
import InteractiveCard from '../InteractiveCard';
import campusImage from '../../assets/vignan-logo.png';
import './Dashboard.css';
import './Dashboard.css';

const StudentDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [announcements] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    realTimeEngine.start();

    return () => {
      clearInterval(clockTimer);
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
    <div className="student-dashboard">
      <section className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome, {user?.username}!</h1>
          <p className="section-info">Section: {user?.section || 'Not Assigned'}</p>
          <div className="current-time">
            <FaClock /> {getCurrentTimeString()}
          </div>
        </div>
        <img src={campusImage} alt="Vignan Logo" className="dashboard-logo" />
      </section>



      <section className="quick-access">
        <h2>Quick Access</h2>
        <div className="quick-links">
          <Link to="/timetable" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="My Timetable"
              description="View your complete class schedule"
              icon={FaCalendarAlt}
            />
          </Link>
          <Link to="/class" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Class Details"
              description="Check detailed class information"
              icon={FaBookOpen}
            />
          </Link>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="announcements">
          <h2><FaBell /> Announcements</h2>
          {announcements.map((announcement, index) => (
            <div key={index} className="announcement-card">
              <h4>{announcement.title}</h4>
              <p>{announcement.message}</p>
              <small>{announcement.date}</small>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;