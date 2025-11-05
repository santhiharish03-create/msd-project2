const Timetable = require('../models/Timetable');
const { validationResult } = require('express-validator');

const getTimetable = async (req, res) => {
  try {
    const { section } = req.params;
    const timetable = await Timetable.findOne({ section: section.toUpperCase() });
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find().select('section roomNumber');
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTimetable = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const timetable = new Timetable(req.body);
    await timetable.save();
    
    // Emit real-time update
    req.app.get('io').emit('timetableCreated', {
      section: timetable.section,
      data: timetable,
      timestamp: new Date()
    });
    
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const { section } = req.params;
    const timetable = await Timetable.findOneAndUpdate(
      { section: section.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    // Emit real-time update
    req.app.get('io').emit('timetableUpdated', {
      section: timetable.section,
      data: timetable,
      timestamp: new Date()
    });
    
    res.json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCurrentClass = async (req, res) => {
  try {
    const { section } = req.params;
    const timetable = await Timetable.findOne({ section: section.toUpperCase() });
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const schedule = timetable.schedule[day];
    if (!schedule) {
      return res.json({ message: 'No classes today' });
    }

    const currentSlot = Object.entries(schedule).find(([timeSlot]) => {
      const [start, end] = timeSlot.split('-');
      return timeStr >= start && timeStr <= end;
    });

    if (currentSlot) {
      res.json({
        subject: currentSlot[1],
        time: currentSlot[0],
        faculty: timetable.faculty[currentSlot[1]] || 'N/A',
        section: timetable.section,
        roomNumber: timetable.roomNumber
      });
    } else {
      res.json({ message: 'No current class' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTimetable,
  getAllTimetables,
  createTimetable,
  updateTimetable,
  getCurrentClass
};