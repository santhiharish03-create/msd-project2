import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserTie, FaDoorOpen, FaGraduationCap, FaUpload, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/pages/Home';
import TimeTable from './components/TimeTable';
import Faculty from './components/pages/Faculty';
import Rooms from './components/pages/Rooms';
import ClassView from './components/pages/ClassView';
import UploadExcel from './components/UploadExcel';
import Footer from './components/Footer';
import vignanLogo from './assets/vignan-logo.png';
import './App.css';

// Wrapper component to handle transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.key}
        nodeRef={nodeRef}
        timeout={300}
        classNames="page"
        unmountOnExit
      >
        <div ref={nodeRef}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/timetable" element={<TimeTable />} />
            <Route path="/class" element={<ClassView />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/upload" element={<UploadExcel />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <Signup 
          onSignup={setIsLoggedIn} 
          onSwitchToLogin={() => setShowSignup(false)} 
        />
      );
    }
    return (
      <Login 
        onLogin={setIsLoggedIn} 
        onSwitchToSignup={() => setShowSignup(true)} 
      />
    );
  }

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <nav className="navbar">
          <div className="nav-brand">
            <img src={vignanLogo} alt="Vignan Logo" className="nav-logo" />
            <h1>Vignan University</h1>
          </div>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <FaHome /> Home
            </Link>
            <Link to="/timetable" className="nav-link">
              <FaCalendarAlt /> Timetable
            </Link>
            <Link to="/class" className="nav-link">
              <FaGraduationCap /> Class View
            </Link>
            <Link to="/faculty" className="nav-link">
              <FaUserTie /> Faculty
            </Link>
            <Link to="/rooms" className="nav-link">
              <FaDoorOpen /> Rooms
            </Link>
            <Link to="/upload" className="nav-link">
              <FaUpload /> Upload
            </Link>
            <button 
              className="dark-mode-toggle" 
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              aria-label="Logout"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </nav>

        <main className="main-content">
          <AnimatedRoutes />
        </main>

        <Footer />

        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: darkMode ? 'dark-toast' : '',
            style: {
              background: darkMode ? '#333' : '#fff',
              color: darkMode ? '#fff' : '#333',
            },
          }} 
        />
      </div>
    </Router>
  );
};

export default App;
