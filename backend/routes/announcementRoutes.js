const express = require('express');
const {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllAnnouncements);
router.post('/', auth, createAnnouncement);
router.put('/:id', auth, updateAnnouncement);
router.delete('/:id', auth, deleteAnnouncement);

module.exports = router;