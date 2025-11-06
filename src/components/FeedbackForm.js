import React, { useState } from 'react';
import { FaPaperPlane, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState({
    type: 'conflict',
    subject: '',
    description: '',
    section: '',
    studentId: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!feedback.subject || !feedback.description || !feedback.section || !feedback.studentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would be sent to a server
    console.log('Feedback submitted:', feedback);
    toast.success('Feedback submitted successfully');
    
    // Reset form
    setFeedback({
      type: 'conflict',
      subject: '',
      description: '',
      section: '',
      studentId: '',
      priority: 'medium'
    });
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h3><FaExclamationCircle /> Feedback & Complaints</h3>
        <p>Help us improve your timetable experience</p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label>Type:</label>
          <select
            value={feedback.type}
            onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
          >
            <option value="conflict">Schedule Conflict</option>
            <option value="suggestion">Suggestion</option>
            <option value="complaint">Complaint</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Subject:</label>
          <input
            type="text"
            value={feedback.subject}
            onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
            placeholder="Brief subject of your feedback"
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={feedback.description}
            onChange={(e) => setFeedback({ ...feedback, description: e.target.value })}
            placeholder="Detailed description of your feedback"
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Section:</label>
            <input
              type="text"
              value={feedback.section}
              onChange={(e) => setFeedback({ ...feedback, section: e.target.value })}
              placeholder="Your section"
              required
            />
          </div>

          <div className="form-group">
            <label>Student ID:</label>
            <input
              type="text"
              value={feedback.studentId}
              onChange={(e) => setFeedback({ ...feedback, studentId: e.target.value })}
              placeholder="Your student ID"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Priority:</label>
          <div className="priority-options">
            <label className="priority-label">
              <input
                type="radio"
                name="priority"
                value="low"
                checked={feedback.priority === 'low'}
                onChange={(e) => setFeedback({ ...feedback, priority: e.target.value })}
              />
              Low
            </label>
            <label className="priority-label">
              <input
                type="radio"
                name="priority"
                value="medium"
                checked={feedback.priority === 'medium'}
                onChange={(e) => setFeedback({ ...feedback, priority: e.target.value })}
              />
              Medium
            </label>
            <label className="priority-label">
              <input
                type="radio"
                name="priority"
                value="high"
                checked={feedback.priority === 'high'}
                onChange={(e) => setFeedback({ ...feedback, priority: e.target.value })}
              />
              High
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          <FaPaperPlane /> Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
