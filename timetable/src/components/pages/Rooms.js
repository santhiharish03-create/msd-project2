import React, { useMemo, useState, useEffect } from 'react';
import { FaDoorOpen, FaUserTie, FaUsers, FaClock, FaCalendarPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getAllRooms } from '../../services/timetableService';
import './Rooms.css';

const ROOMS_DIRECTORY = [
  {
    id: 'A101',
    type: 'Classroom',
    capacity: 60,
    status: 'occupied',
    currentClass: {
      subject: 'Computer Networks',
      faculty: 'Dr. Ramesh Kumar',
      section: 'CSE-A',
      endTime: '11:00 AM'
    }
  },
  {
    id: 'B205',
    type: 'Classroom',
    capacity: 60,
    status: 'available',
    nextClass: {
      subject: 'Database Management',
      faculty: 'Prof. Sita Sharma',
      section: 'CSE-B',
      startTime: '2:00 PM'
    }
  },
  {
    id: 'LAB-1',
    type: 'Computer Lab',
    capacity: 40,
    status: 'maintenance',
    maintenanceEnd: '3:00 PM'
  }
];

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getAllRooms();
        setRooms(data.length ? data : ROOMS_DIRECTORY);
      } catch (error) {
        console.error('Error loading rooms:', error);
        setRooms(ROOMS_DIRECTORY);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    purpose: '',
    date: '',
    startTime: '',
    endTime: '',
    faculty: ''
  });

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const handleBooking = () => {
    const { roomId, purpose, date, startTime, endTime, faculty } = bookingForm;

    if (!roomId || !purpose || !date || !startTime || !endTime || !faculty) {
      toast.error('Please fill in all fields');
      return;
    }

    // In a real app, this would make an API call
    toast.success('Room booked successfully');
    setShowBookingForm(false);
    setBookingForm({
      roomId: '',
      purpose: '',
      date: '',
      startTime: '',
      endTime: '',
      faculty: ''
    });
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filterType === 'all') return true;
      if (filterType === 'available') return room.status === 'available';
      if (filterType === 'occupied') return room.status === 'occupied';
      if (filterType === 'maintenance') return room.status === 'maintenance';
      return true;
    });
  }, [filterType, rooms]);

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h2>Room Status</h2>
        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Rooms</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Under Maintenance</option>
          </select>
          <button
            className="book-room-btn"
            onClick={() => setShowBookingForm(true)}
          >
            <FaCalendarPlus /> Book a Room
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading room data...</div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map(room => (
          <div key={room.id} className={`room-card ${room.status}`}>
            <div className="room-header">
              <h3><FaDoorOpen /> Room {room.id}</h3>
              <span className={`status-badge ${room?.status || 'unknown'}`}>
  {room?.status
    ? room.status.charAt(0).toUpperCase() + room.status.slice(1)
    : 'Unknown'}
</span>

            </div>

            <div className="room-info">
              <p className="room-type">{room.type}</p>
              <p className="capacity"><FaUsers /> {room.capacity} seats</p>
            </div>

            {room.status === 'occupied' && room.currentClass && (
              <div className="current-class">
                <h4>Current Class</h4>
                <p><FaUserTie /> {room.currentClass.faculty}</p>
                <p>{room.currentClass.subject}</p>
                <p>Section: {room.currentClass.section}</p>
                <p><FaClock /> Until {room.currentClass.endTime}</p>
              </div>
            )}

            {room.status === 'available' && room.nextClass && (
              <div className="next-class">
                <h4>Next Class</h4>
                <p>{room.nextClass.subject}</p>
                <p><FaClock /> at {room.nextClass.startTime}</p>
              </div>
            )}

            {room.status === 'maintenance' && (
              <div className="maintenance-info">
                <p>Under maintenance until {room.maintenanceEnd}</p>
              </div>
            )}
          </div>
          ))}
        </div>
      )}

      {showBookingForm && (
        <div className="booking-modal">
          <div className="booking-content">
            <h3>Book a Room</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Room:</label>
                <select
                  value={bookingForm.roomId}
                  onChange={(e) => setBookingForm({...bookingForm, roomId: e.target.value})}
                >
                  <option value="">Select Room</option>
                  {rooms.filter(r => r.status === 'available').map(room => (
                    <option key={room.id} value={room.id}>Room {room.id}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Purpose:</label>
                <input
                  type="text"
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})}
                  placeholder="Extra class, Lab session, etc."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Start Time:</label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Time:</label>
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Faculty:</label>
                <input
                  type="text"
                  value={bookingForm.faculty}
                  onChange={(e) => setBookingForm({...bookingForm, faculty: e.target.value})}
                  placeholder="Faculty name"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleBooking} className="submit-btn">
                  Book Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
