import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaUserGraduate, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import vignanLogo from '../assets/vignan-logo.png';
import './Login.css';

const Signup = () => {
  // All hooks must be called before any conditional returns
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/home');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={vignanLogo} alt="Vignan Logo" className="login-logo" />
          <h2>Create Account</h2>
          <p>Join Vignan Timetable System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({...formData, username: value});
                  setValidations({...validations, username: value.length >= 3});
                }}
                className={validations.username ? 'valid' : ''}
                required
              />
              {formData.username && (
                <span className={`validation-icon ${validations.username ? 'valid' : 'invalid'}`}>
                  {validations.username ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
              )}
            </div>

            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({...formData, email: value});
                  setValidations({...validations, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)});
                }}
                className={validations.email ? 'valid' : ''}
                required
              />
              {formData.email && (
                <span className={`validation-icon ${validations.email ? 'valid' : 'invalid'}`}>
                  {validations.email ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
              )}
            </div>
          </div>

          <div className="input-group role-select">
            <FaUserGraduate className="input-icon" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="student">👨‍🎓 Student</option>
              <option value="faculty">👨‍🏫 Faculty Member</option>
              <option value="admin">👨💼 Administrator</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({...formData, password: value});
                  setValidations({...validations, password: value.length >= 6});
                }}
                className={validations.password ? 'valid' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {formData.password && (
                <span className={`validation-icon ${validations.password ? 'valid' : 'invalid'}`}>
                  {validations.password ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
              )}
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({...formData, confirmPassword: value});
                  setValidations({...validations, confirmPassword: value === formData.password && value.length > 0});
                }}
                className={validations.confirmPassword ? 'valid' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {formData.confirmPassword && (
                <span className={`validation-icon ${validations.confirmPassword ? 'valid' : 'invalid'}`}>
                  {validations.confirmPassword ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
              )}
            </div>
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.password.length >= 6 ? 'met' : ''}>
                <span>At least 6 characters</span>
              </li>
              <li className={formData.password === formData.confirmPassword && formData.confirmPassword ? 'met' : ''}>
                <span>Passwords match</span>
              </li>
            </ul>
          </div>
          
          <button 
            type="submit" 
            className="signup-btn" 
            disabled={isLoading || !Object.values(validations).every(v => v)}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="switch-form">
            <p>Already have an account? 
              <Link to="/login" className="link-btn">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;