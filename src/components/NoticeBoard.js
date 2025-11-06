import React, { useState } from 'react';
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './NoticeBoard.css';

const NoticeBoard = ({ section }) => {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // In real app, this would come from auth

  const addNotice = () => {
    if (!newNotice.trim()) {
      toast.error('Notice cannot be empty');
      return;
    }

    const notice = {
      id: Date.now(),
      text: newNotice,
      timestamp: new Date().toISOString(),
      section: section
    };

    setNotices([notice, ...notices]);
    setNewNotice('');
    toast.success('Notice added successfully');
  };

  const deleteNotice = (id) => {
    setNotices(notices.filter(notice => notice.id !== id));
    toast.success('Notice deleted');
  };

  return (
    <div className="notice-board">
      <h3>Notices for {section}</h3>
      
      {isAdmin && (
        <div className="notice-input">
          <textarea
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
            placeholder="Type your notice here..."
          />
          <button onClick={addNotice} className="add-notice-btn">
            <FaPlus /> Add Notice
          </button>
        </div>
      )}

      <div className="notices-list">
        {notices.length === 0 ? (
          <p className="no-notices">No notices yet</p>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className="notice-item">
              <p className="notice-text">{notice.text}</p>
              <div className="notice-meta">
                <span className="notice-time">
                  <FaClock /> {new Date(notice.timestamp).toLocaleString()}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="delete-notice-btn"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
