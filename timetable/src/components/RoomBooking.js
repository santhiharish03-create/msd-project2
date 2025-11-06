import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';
import './RoomBooking.css';

const RoomBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [newBooking, setNewBooking] = useState({
    roomNumber: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    faculty: ''
  });

  useEffect(() => {
    loadBookings();
    loadAvailableRooms();
  }, []);

  useEffect(() => {
    if (newBooking.date && newBooking.startTime && newBooking.endTime) {
      loadAvailableRooms();
    }
  }, [newBooking.date, newBooking.startTime, newBooking.endTime]);

  const loadBookings = async () => {
    try {
      const data = await apiService.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadAvailableRooms = async () => {
    try {
      const data = await apiService.getAvailableRooms(
        newBooking.date,
        newBooking.startTime,
        newBooking.endTime
      );
      setAvailableRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setAvailableRooms([]);
    }
  };

  const handleBooking = async () => {
    const { roomNumber, date, startTime, endTime, purpose, faculty } = newBooking;

    if (!roomNumber || !date || !startTime || !endTime || !purpose || !faculty) {
      toast.error('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      await apiService.bookRoom(newBooking);
      toast.success('Room booked successfully');
      setNewBooking({
        roomNumber: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        faculty: ''
      });
      loadBookings();
      loadAvailableRooms();
    } catch (error) {
      toast.error(error.message || 'Failed to book room');
    }
  };

  return (
    <div className="room-booking">
      <h3>Room Booking System</h3>
      
      <div className="booking-form">
        <div className="form-group">
          <label>Room:</label>
          <select
            value={newBooking.roomNumber}
            onChange={(e) => setNewBooking({ ...newBooking, roomNumber: e.target.value })}
          >
            <option value="">Select Room</option>
            {availableRooms.map(room => (
              <option key={room.roomNumber} value={room.roomNumber}>
                Room {room.roomNumber} ({room.capacity} seats)
              </option>
            ))}
          </select>
          {newBooking.date && newBooking.startTime && newBooking.endTime && availableRooms.length === 0 && (
            <small className="no-rooms-message">No rooms available for selected time</small>
          )}
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={newBooking.date}
            onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="time"
            value={newBooking.startTime}
            onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>End Time:</label>
          <input
            type="time"
            value={newBooking.endTime}
            onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Purpose:</label>
          <input
            type="text"
            value={newBooking.purpose}
            onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
            placeholder="Extra class, Lab session, etc."
          />
        </div>

        <div className="form-group">
          <label>Faculty:</label>
          <input
            type="text"
            value={newBooking.faculty}
            onChange={(e) => setNewBooking({ ...newBooking, faculty: e.target.value })}
            placeholder="Faculty name"
          />
        </div>

        <button onClick={handleBooking} className="book-room-btn">
          <FaCalendarAlt /> Book Room
        </button>
      </div>

      <div className="bookings-list">
        <h4>Current Bookings</h4>
        {bookings.map(booking => (
          <div key={booking._id} className="booking-item">
            <div className="booking-header">
              <h5>Room {booking.roomNumber}</h5>
              <span className="status booked">
                <FaTimes /> Booked
              </span>
            </div>
            <div className="booking-details">
              <p><FaCalendarAlt /> {booking.date}</p>
              <p><FaClock /> {booking.startTime} - {booking.endTime}</p>
              <p>Purpose: {booking.purpose}</p>
              <p>Faculty: {booking.faculty}</p>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <p className="no-bookings">No active bookings</p>
        )}
      </div>
    </div>
  );
};

export default RoomBooking;
