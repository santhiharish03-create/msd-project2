import React from 'react';
import { FaPlus, FaDatabase } from 'react-icons/fa';

const EmptyState = ({ 
  title, 
  message, 
  actionText, 
  onAction, 
  icon: Icon = FaDatabase 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <Icon className="empty-state-icon" />
        <h3>{title}</h3>
        <p>{message}</p>
        {onAction && (
          <button onClick={onAction} className="empty-state-action">
            <FaPlus /> {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;