import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Development Team</h3>
          <ul className="team-list">
            <li>Pokuri Ganesh</li>
            <li>Raghuram</li>
            <li>kusuma</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub /> GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin /> LinkedIn
            </a>
          </div>
        </div>
        <div className="footer-section">
          <h3>About</h3>
          <p className="copyright"> {new Date().getFullYear()} Vignan University</p>
          <p className="copyright">All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
