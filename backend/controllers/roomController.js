const Room = require('../models/Room');
const Timetable = require('../models/Timetable');
const Booking = require('../models/Booking');

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().select('roomNumber section capacity');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoomSchedule = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const timetable = await Timetable.findOne({ roomNumber });
    
    if (!timetable) {
      return res.status(404).json({ message: 'Room schedule not found' });
    }

    res.json({
      roomNumber: timetable.roomNumber,
      section: timetable.section,
      schedule: timetable.schedule,
      faculty: timetable.faculty
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    const allRooms = await Room.find().select('roomNumber section capacity');
    
    if (!date || !startTime || !endTime) {
      return res.json(allRooms);
    }

    const bookedRooms = await Booking.find({
      date,
      status: 'active',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    }).select('roomNumber');

    const bookedRoomNumbers = bookedRooms.map(b => b.roomNumber);
    const availableRooms = allRooms.filter(room => !bookedRoomNumbers.includes(room.roomNumber));
    
    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookRoom = async (req, res) => {
  try {
    const { roomNumber, date, startTime, endTime, purpose, faculty } = req.body;

    const existingBooking = await Booking.findOne({
      roomNumber,
      date,
      status: 'active',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Room is already booked for this time slot' });
    }

    const booking = new Booking({ roomNumber, date, startTime, endTime, purpose, faculty });
    await booking.save();
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'active' }).sort({ date: 1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomSchedule,
  createRoom,
  getAvailableRooms,
  bookRoom,
  getAllBookings
};