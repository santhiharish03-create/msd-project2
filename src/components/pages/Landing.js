import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaChalkboardTeacher, FaDoorOpen, FaUsers, FaArrowRight, FaClock, FaUniversity } from 'react-icons/fa';
import campusImage from '../../assets/vignan-logo.png';
import './Landing.css';

const Landing = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <div className="university-branding">
            <img src={campusImage} alt="Vignan University" className="university-logo" />
            <div className="university-info">
              <h1>Vignan University</h1>
              <p className="tagline">Timetable Management System</p>
            </div>
          </div>
          
          <div className="live-clock">
            <FaClock className="clock-icon" />
            <span className="time-display">{getCurrentTimeString()}</span>
          </div>

          <div className="hero-description">
            <h2>Streamline Academic Scheduling</h2>
            <p>Comprehensive timetable management for faculty, students, and administration. 
               Real-time updates, room booking, and intelligent scheduling all in one platform.</p>
          </div>

          <div className="cta-section">
            <Link to="/home" className="primary-cta">
              Enter Dashboard <FaArrowRight />
            </Link>
            <Link to="/login" className="secondary-cta">
              Faculty Login
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="feature-grid">
            <div className="feature-card">
              <FaCalendarAlt className="feature-icon" />
              <h3>Smart Scheduling</h3>
              <p>Automated timetable generation with conflict detection</p>
            </div>
            <div className="feature-card">
              <FaChalkboardTeacher className="feature-icon" />
              <h3>Faculty Management</h3>
              <p>Track teaching loads and availability in real-time</p>
            </div>
            <div className="feature-card">
              <FaDoorOpen className="feature-icon" />
              <h3>Room Booking</h3>
              <p>Instant room availability and booking system</p>
            </div>
            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Student Access</h3>
              <p>Easy access to class schedules and updates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-stats">
        <div className="stat-item">
          <FaUniversity className="stat-icon" />
          <div className="stat-content">
            <h3>50+</h3>
            <p>Departments</p>
          </div>
        </div>
        <div className="stat-item">
          <FaUsers className="stat-icon" />
          <div className="stat-content">
            <h3>500+</h3>
            <p>Faculty Members</p>
          </div>
        </div>
        <div className="stat-item">
          <FaDoorOpen className="stat-icon" />
          <div className="stat-content">
            <h3>200+</h3>
            <p>Classrooms</p>
          </div>
        </div>
        <div className="stat-item">
          <FaCalendarAlt className="stat-icon" />
          <div className="stat-content">
            <h3>24/7</h3>
            <p>Live Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;