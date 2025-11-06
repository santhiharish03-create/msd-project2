import React, { useState } from 'react';
import { FaCalendarAlt, FaBell } from 'react-icons/fa';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Diwali',
      date: '2025-11-12',
      type: 'holiday'
    },
    {
      id: 2,
      title: 'Annual Day',
      date: '2025-04-15',
      type: 'event'
    },
    {
      id: 3,
      title: 'Mid Semester Break',
      startDate: '2025-09-20',
      endDate: '2025-09-28',
      type: 'holiday'
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: 'event'
  });

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      alert('Please fill in all fields');
      return;
    }

    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setNewEvent({ title: '', date: '', type: 'event' });
  };

  const isHoliday = (date) => {
    return events.some(event => 
      event.type === 'holiday' && (
        event.date === date || 
        (event.startDate && event.endDate && 
         date >= event.startDate && date <= event.endDate)
      )
    );
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => new Date(event.date || event.startDate) >= today)
      .sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate))
      .slice(0, 5);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3><FaCalendarAlt /> Academic Calendar</h3>
      </div>

      <div className="upcoming-events">
        <h4><FaBell /> Upcoming Events & Holidays</h4>
        <div className="events-list">
          {getUpcomingEvents().map(event => (
            <div key={event.id} className={`event-item ${event.type}`}>
              <span className="event-date">
                {event.startDate ? 
                  `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}` :
                  new Date(event.date).toLocaleDateString()}
              </span>
              <span className="event-title">{event.title}</span>
              <span className="event-type">{event.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="add-event-form">
        <h4>Add New Event</h4>
        <div className="form-group">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
          >
            <option value="event">Event</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
        <button onClick={addEvent} className="add-event-btn">
          Add Event
        </button>
      </div>
    </div>
  );
};

export default Calendar;
