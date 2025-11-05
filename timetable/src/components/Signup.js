import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone } from 'react-icons/fa';
import vignanLogo from '../assets/vignan-logo.png';
import './Login.css';

const Signup = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Save to localStorage (simple implementation)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(user => user.username === formData.username)) {
      setError('Username already exists');
      return;
    }

    users.push({
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    onSignup(true);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={vignanLogo} alt="Vignan Logo" className="login-logo" />
          <h2>Create Account</h2>
          <p>Join Vignan Timetable System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <FaPhone className="input-icon" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-btn">Create Account</button>
          
          <div className="switch-form">
            <p>Already have an account? 
              <button type="button" onClick={onSwitchToLogin} className="link-btn">
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;