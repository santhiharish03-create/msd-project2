import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaClock, FaBell, FaCalendarAlt, FaChalkboardTeacher, FaDoorOpen, FaBullhorn, FaUniversity, FaUsers, FaCloudDownloadAlt, FaShieldAlt, FaChartLine, FaWifi, FaSpinner } from 'react-icons/fa';
import realTimeEngine from '../../services/realTimeEngine';
import { NotificationBusinessLogic } from '../../services/businessLogic';
import { useAuth } from '../../contexts/AuthContext';
import RealTimeStatus from '../RealTimeStatus';
import InteractiveCard from '../InteractiveCard';
import campusImage from '../../assets/vignan-logo.png';
import './Home.css';

import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

const Home = () => {
  const { user } = useAuth();
  
  // All hooks must be called before any conditional returns
  const [showContent, setShowContent] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({ sections: 0, rooms: 0, faculty: 0, occupancyRate: 0 });
  const [liveClasses, setLiveClasses] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(null);
  const [academicWeek, setAcademicWeek] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1500);

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const handleDashboardUpdate = (data) => {
      if (!data) return;
      
      setStats(data.stats || { sections: 0, rooms: 0, faculty: 0, occupancyRate: 0 });
      setLiveClasses(data.liveClasses || []);
      setCurrentTimeSlot(data.currentTimeSlot);
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
    
    // Subscribe to real-time updates
    realTimeEngine.subscribe('dashboard', handleDashboardUpdate);
    realTimeEngine.subscribe('announcements', handleAnnouncementUpdate);
    realTimeEngine.subscribe('rooms', handleRoomUpdate);
    realTimeEngine.start();

    return () => {
      clearTimeout(timer);
      clearInterval(clockTimer);
      realTimeEngine.unsubscribe('dashboard', handleDashboardUpdate);
      realTimeEngine.unsubscribe('announcements', handleAnnouncementUpdate);
      realTimeEngine.unsubscribe('rooms', handleRoomUpdate);
    };
  }, []);

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Role-based dashboard routing
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'student' || user?.role === 'faculty') {
    return <StudentDashboard />;
  }

  if (!showContent) {
    return (
      <div className="loading-screen">
        <img src={campusImage} alt="Vignan Logo" className="loading-logo" />
        <div className="loading-spinner"></div>
        <p>Loading Timetable Management System...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <RealTimeStatus />
      <section className="welcome-section">
        <div className="welcome-content">
          <p className="welcome-tagline">Synchronise academics across every department in real time.</p>
          <h1>Welcome to Vignan University</h1>
          <p className="welcome-description">Timetable Management System</p>
          <div className="current-time">
            <FaClock /> {getCurrentTimeString()}
          </div>
          <div className="cta-buttons">
            <Link to="/timetable" className="cta-link primary-cta">Explore Timetables</Link>
            <Link to="/rooms" className="cta-link secondary-cta">Monitor Rooms</Link>
          </div>
          <div className="highlight-row">
            <div className="highlight-item">
              <div className="highlight-icon">
                <FaBell />
              </div>
              <div>
                <h3 className="highlight-heading">Instant Alerts</h3>
                <p className="highlight-description">Receive schedule changes and faculty updates without delay.</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">
                <FaSearch />
              </div>
              <div>
                <h3 className="highlight-heading">Smart Lookup</h3>
                <p className="highlight-description">Locate classrooms, slots, and departments in just a couple of clicks.</p>
              </div>
            </div>
          </div>
        </div>
        <figure className="campus-visual">
          <img src={campusImage} alt="Vignan University crest" className="campus-image" />
          <figcaption className="campus-caption">
            Crafted for Vignan&apos;s academic community to streamline every timetable.
          </figcaption>
        </figure>
      </section>

      <section className="quick-access">
        <h2>Quick Access</h2>
        <div className="quick-links">
          <Link to="/timetable" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="View Timetable"
              description="Browse daily schedules across all sections and laboratories."
              icon={FaCalendarAlt}
            />
          </Link>
          <Link to="/faculty" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Faculty Status"
              description="Check teaching assignments and identify free faculty slots."
              icon={FaChalkboardTeacher}
            />
          </Link>
          <Link to="/rooms" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Room Availability"
              description="Track occupancy and secure the right classroom for your session."
              icon={FaDoorOpen}
            />
          </Link>
          <Link to="/class" style={{ textDecoration: 'none' }}>
            <InteractiveCard
              title="Class Overview"
              description="Review section-wise plans and download consolidated views."
              icon={FaBullhorn}
            />
          </Link>
        </div>
      </section>

      <section className="metric-strip">
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

      <section className="application-showcase">
        <h2>Applications</h2>
        <div className="application-grid">
          <div className="application-card">
            <div className="application-icon"><FaSearch /></div>
            <h3 className="application-title">Section Lookup</h3>
            <p className="application-description">Search any section to view a consolidated daily or weekly plan at a glance.</p>
          </div>
          <div className="application-card">
            <div className="application-icon"><FaDoorOpen /></div>
            <h3 className="application-title">Room Booking</h3>
            <p className="application-description">Quickly find available rooms, avoid clashes, and book with a single click.</p>
          </div>
          <div className="application-card">
            <div className="application-icon"><FaChalkboardTeacher /></div>
            <h3 className="application-title">Faculty Tracking</h3>
            <p className="application-description">Check teaching loads and free slots to plan substitutions efficiently.</p>
          </div>
          <div className="application-card">
            <div className="application-icon"><FaCloudDownloadAlt /></div>
            <h3 className="application-title">Export & Share</h3>
            <p className="application-description">Export timetables to PDF and share across departments instantly.</p>
          </div>
        </div>
      </section>

      <section className="trust-badges">
        <div className="badge">
          <FaShieldAlt className="badge-icon" />
          <div>
            <p className="badge-title">Reliable by design</p>
            <p className="badge-text">Built with integrity checks and conflict validation.</p>
          </div>
        </div>
        <div className="badge">
          <FaCloudDownloadAlt className="badge-icon" />
          <div>
            <p className="badge-title">Easy distribution</p>
            <p className="badge-text">One-click exports for committees and class groups.</p>
          </div>
        </div>
      </section>

      <section className="resource-overview">
        <div className="resource-card">
          <h3>Academic Snapshot</h3>
          <p>Live statistics to keep the scheduling committee and faculty aligned.</p>
          <ul className="resource-details">
            <li>52 departments synchronised with central scheduling.</li>
            <li>120 classrooms tracked with up-to-the-minute occupancy.</li>
            <li>Automated conflict checks across labs and lecture halls.</li>
          </ul>
        </div>
        <div className="resource-card">
          <h3>Need Assistance?</h3>
          <p>Reach the timetable coordination desk for clarifications or urgent changes.</p>
          <div className="contact-grid">
            <span className="contact-label">Support Desk</span>
            <a href="mailto:timetable@vignan.ac.in" className="contact-link">timetable@vignan.ac.in</a>
            <span className="contact-label">Helpline</span>
            <a href="tel:+919876543210" className="contact-link">+91 98765 43210</a>
          </div>
        </div>
      </section>

      <section className="current-status">
        <div className="status-card ongoing-classes">
          <h3>
            <FaBell /> Ongoing Classes 
            <span className={`ml-2 text-xs ${connected ? 'text-green-500' : 'text-red-500'}`}>
              <FaWifi /> {connected ? 'Live' : 'Offline'}
            </span>
            {currentTimeSlot && (
              <small className="current-slot">Current: {currentTimeSlot}</small>
            )}
          </h3>
          <div className="status-list">
            {liveClasses.length > 0 ? liveClasses.map((cls, index) => (
              <div key={index} className="status-item">
                <p>Room {cls.roomNumber}: {cls.subject}</p>
                <small>{cls.faculty} (Section {cls.section})</small>
              </div>
            )) : (
              <div className="status-item">
                <p>No ongoing classes</p>
                <small>All sections are free</small>
              </div>
            )}
          </div>
        </div>

        <div className="status-card available-rooms">
          <h3><FaSearch /> Available Rooms</h3>
          <div className="status-list">
            {loading ? (
              <div className="status-item">
                <FaSpinner className="spin" /> Loading rooms...
              </div>
            ) : availableRooms.length > 0 ? availableRooms.map((room, index) => (
              <div key={index} className="status-item available">
                <p>Room {room.roomNumber}</p>
                <small>Capacity: {room.capacity} seats</small>
              </div>
            )) : (
              <div className="status-item">
                <p>No available rooms</p>
                <small>All rooms are occupied</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="announcements">
        <h2>Important Announcements</h2>
        <div className="announcement-list">
          {loading ? (
            <div className="announcement loading-announcement">
              <FaSpinner className="spin" /> Loading announcements...
            </div>
          ) : announcements.length > 0 ? announcements.map((announcement) => (
            <div key={announcement._id} className={`announcement priority-${announcement.priority}`}>
              <div className="announcement-header">
                <span className="notification-icon">
                  {NotificationBusinessLogic.getNotificationIcon(announcement.type || 'announcement')}
                </span>
                <h4>{announcement.title}</h4>
              </div>
              <p>{announcement.content}</p>
              <div className="announcement-meta">
                <small>Posted {new Date(announcement.createdAt).toLocaleDateString()}</small>
                <span className={`priority-badge priority-${announcement.priority}`}>
                  {announcement.priority.toUpperCase()}
                </span>
              </div>
            </div>
          )) : (
            <div className="announcement">
              <h4>No Announcements</h4>
              <p>No recent announcements available.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
