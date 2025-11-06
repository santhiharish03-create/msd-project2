import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaBookOpen, FaBell, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import realTimeEngine from '../../services/realTimeEngine';
import { useAuth } from '../../contexts/AuthContext';
import InteractiveCard from '../InteractiveCard';
import campusImage from '../../assets/vignan-logo.png';
import './Dashboard.css';
import './Dashboard.css';

const StudentDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [myTimetable, setMyTimetable] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const handleTimetableUpdate = (timetables) => {
      if (user?.section && timetables) {
        const mySection = timetables.find(t => t.section === user.section);
        setMyTimetable(mySection);
      }
    };

    realTimeEngine.subscribe('timetables', handleTimetableUpdate);
    realTimeEngine.start();

    return () => {
      clearInterval(clockTimer);
      realTimeEngine.unsubscribe('timetables', handleTimetableUpdate);
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

      {currentClass && (
        <section className="current-class-section">
          <h2>Current Class</h2>
          <div className="class-card current">
            <h3>{currentClass.subject}</h3>
            <p><FaUser /> {currentClass.faculty}</p>
            <p><FaMapMarkerAlt /> {currentClass.room}</p>
            <p><FaClock /> {currentClass.time}</p>
          </div>
        </section>
      )}

      {nextClass && (
        <section className="next-class-section">
          <h2>Next Class</h2>
          <div className="class-card next">
            <h3>{nextClass.subject}</h3>
            <p><FaUser /> {nextClass.faculty}</p>
            <p><FaMapMarkerAlt /> {nextClass.room}</p>
            <p><FaClock /> {nextClass.time}</p>
          </div>
        </section>
      )}

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