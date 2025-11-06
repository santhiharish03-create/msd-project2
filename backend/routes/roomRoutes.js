const express = require('express');
const {
  getAllRooms,
  getRoomSchedule,
  createRoom,
  getAvailableRooms,
  bookRoom,
  getAllBookings
} = require('../controllers/roomController');

const router = express.Router();

router.get('/', getAllRooms);
router.get('/available', getAvailableRooms);
router.get('/bookings', getAllBookings);
router.get('/:roomNumber/schedule', getRoomSchedule);
router.post('/', createRoom);
router.post('/book', bookRoom);

module.exports = router;