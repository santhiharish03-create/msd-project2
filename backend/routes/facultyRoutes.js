const express = require('express');
const {
  getAllFaculty,
  getFacultySchedule,
  createFaculty,
  updateFaculty,
  deleteFaculty
} = require('../controllers/facultyController');

const router = express.Router();

router.get('/', getAllFaculty);
router.get('/:name/schedule', getFacultySchedule);
router.post('/', createFaculty);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);

module.exports = router;