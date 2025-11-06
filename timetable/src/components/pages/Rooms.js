import React, { useMemo, useState, useEffect } from 'react';
import { FaDoorOpen, FaUserTie, FaUsers, FaClock, FaCalendarPlus, FaChartPie, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import realTimeEngine from '../../services/realTimeEngine';
import apiService from '../../services/apiService';
import EmptyState from '../EmptyState';
import InteractiveCard from '../InteractiveCard';
import './Rooms.css';



const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomAnalytics, setRoomAnalytics] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const handleRoomUpdate = (roomsData) => {
      if (!roomsData) {
        setRooms([]);
        setLoading(false);
        return;
      }
      
      setRooms(roomsData);
      
      // Calculate analytics from processed room data
      const analytics = {
        totalRooms: roomsData.length,
        occupiedRooms: roomsData.filter(r => r.status === 'occupied').length,
        availableRooms: roomsData.filter(r => r.status === 'available').length,
        maintenanceRooms: roomsData.filter(r => r.status === 'maintenance').length,
        averageUtilization: roomsData.reduce((sum, r) => sum + (r.utilization || 0), 0) / roomsData.length
      };
      
      setRoomAnalytics(analytics);
      setLoading(false);
      
      if (roomsData.length === 0) {
        toast.info('No room data found. Please upload Excel data first.');
      }
    };
    realTimeEngine.subscribe('rooms', handleRoomUpdate);
    realTimeEngine.start();
    
    return () => {
      realTimeEngine.unsubscribe('rooms', handleRoomUpdate);
    };
  }, []);

  const [bookingForm, setBookingForm] = useState({
    roomNumber: '',
    purpose: '',
    date: '',
    startTime: '',
    endTime: '',
    faculty: ''
  });
  const [availableRooms, setAvailableRooms] = useState([]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const loadAvailableRooms = async () => {
    try {
      const { date, startTime, endTime } = bookingForm;
      if (date && startTime && endTime) {
        const data = await apiService.getAvailableRooms(date, startTime, endTime);
        setAvailableRooms(data);
      } else {
        setAvailableRooms(rooms.filter(r => r.status === 'available'));
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
      setAvailableRooms(rooms.filter(r => r.status === 'available'));
    }
  };

  const handleBooking = async () => {
    const { roomNumber, purpose, date, startTime, endTime, faculty } = bookingForm;

    if (!roomNumber || !purpose || !date || !startTime || !endTime || !faculty) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await apiService.bookRoom(bookingForm);
      toast.success('Room booked successfully');
      setShowBookingForm(false);
      setBookingForm({
        roomNumber: '',
        purpose: '',
        date: '',
        startTime: '',
        endTime: '',
        faculty: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to book room');
    }
  };

  useEffect(() => {
    if (showBookingForm) {
      loadAvailableRooms();
    }
  }, [showBookingForm, bookingForm.date, bookingForm.startTime, bookingForm.endTime]);

  const filteredRooms = useMemo(() => {
    let filtered = rooms.filter((room) => {
      if (filterType === 'all') return true;
      if (filterType === 'available') return room.status === 'available';
      if (filterType === 'occupied') return room.status === 'occupied';
      if (filterType === 'maintenance') return room.status === 'maintenance';
      return true;
    });
    
    // Sort by utilization and status using business logic
    return filtered.sort((a, b) => {
      if (a.status !== b.status) {
        const statusPriority = { 'occupied': 0, 'available': 1, 'maintenance': 2 };
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return (b.utilization || 0) - (a.utilization || 0);
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
      ) : filteredRooms.length === 0 ? (
        <EmptyState 
          title="No Rooms Found"
          message="No rooms are available. Please add rooms to get started."
          actionText="Add Room"
          onAction={() => toast.info('Room creation feature coming soon!')}
          icon={FaDoorOpen}
        />
      ) : (
        <>
          <div className="room-analytics">
            <div className="analytics-card">
              <FaChartPie className="analytics-icon" />
              <div>
                <h4>Occupancy Rate</h4>
                <p>{roomAnalytics.totalRooms > 0 ? 
                  Math.round((roomAnalytics.occupiedRooms / roomAnalytics.totalRooms) * 100) : 0}%</p>
              </div>
            </div>
            <div className="analytics-card">
              <FaUsers className="analytics-icon" />
              <div>
                <h4>Available Rooms</h4>
                <p>{roomAnalytics.availableRooms || 0}</p>
              </div>
            </div>
            <div className="analytics-card">
              <FaExclamationTriangle className="analytics-icon" />
              <div>
                <h4>Maintenance</h4>
                <p>{roomAnalytics.maintenanceRooms || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="rooms-grid">
            {filteredRooms.map(room => (
              <InteractiveCard
                key={room.id || room.roomNumber}
                title={`Room ${room.roomNumber || room.id}`}
                description={`${room.capacity} seats • ${room.utilization || 0}% utilized`}
                icon={FaDoorOpen}
                onClick={() => setSelectedRoom(room)}
                className={`room-card ${room.status}`}
              >
                <div className="room-details">
                  <span className={`status-badge ${room?.status || 'unknown'}`}>
                    {room?.status
                      ? room.status.charAt(0).toUpperCase() + room.status.slice(1)
                      : 'Unknown'}
                  </span>

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
              </InteractiveCard>
            ))}
          </div>
        </>
      )}

      {showBookingForm && (
        <div className="booking-modal">
          <div className="booking-content">
            <h3>Book a Room</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Room:</label>
                <select
                  value={bookingForm.roomNumber}
                  onChange={(e) => setBookingForm({...bookingForm, roomNumber: e.target.value})}
                >
                  <option value="">Select Room</option>
                  {availableRooms.map(room => (
                    <option key={room.roomNumber || room.id} value={room.roomNumber || room.id}>
                      Room {room.roomNumber || room.id} ({room.capacity} seats)
                    </option>
                  ))}
                </select>
                {bookingForm.date && bookingForm.startTime && bookingForm.endTime && availableRooms.length === 0 && (
                  <small className="no-rooms-message">No rooms available for selected time</small>
                )}
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
      
      {selectedRoom && (
        <div className="room-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Room {selectedRoom.roomNumber || selectedRoom.id} - Detailed Analysis</h3>
              <button onClick={() => setSelectedRoom(null)} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="room-stats">
                <div className="stat-card">
                  <h4>Utilization</h4>
                  <div className="utilization-bar">
                    <div 
                      className="utilization-fill" 
                      style={{ width: `${selectedRoom.utilization || 0}%` }}
                    ></div>
                  </div>
                  <p>{selectedRoom.utilization || 0}% weekly utilization</p>
                </div>
                
                <div className="stat-card">
                  <h4>Capacity</h4>
                  <p>{selectedRoom.capacity} students</p>
                  <p>Type: {selectedRoom.type || 'Classroom'}</p>
                </div>
                
                <div className="stat-card">
                  <h4>Current Status</h4>
                  <p className={`status-text ${selectedRoom.status}`}>
                    {selectedRoom.status?.charAt(0).toUpperCase() + selectedRoom.status?.slice(1)}
                  </p>
                  {selectedRoom.currentClass && (
                    <div>
                      <p>Subject: {selectedRoom.currentClass.subject}</p>
                      <p>Faculty: {selectedRoom.currentClass.faculty}</p>
                      <p>Section: {selectedRoom.currentClass.section}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
