import React, { useState } from 'react';
import { FaChevronRight, FaSpinner } from 'react-icons/fa';

const InteractiveCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  loading = false,
  disabled = false,
  className = '',
  children 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`interactive-card ${className} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-header">
        {Icon && <Icon className="card-icon" />}
        <div className="card-content">
          <h3 className="card-title">{title}</h3>
          {description && <p className="card-description">{description}</p>}
        </div>
        <div className="card-action">
          {loading ? (
            <FaSpinner className="spin" />
          ) : (
            <FaChevronRight className={`chevron ${isHovered ? 'hovered' : ''}`} />
          )}
        </div>
      </div>
      {children && <div className="card-body">{children}</div>}
    </div>
  );
};

export default InteractiveCard;