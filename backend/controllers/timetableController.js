const Timetable = require('../models/Timetable');
const { validationResult } = require('express-validator');

const getTimetable = async (req, res) => {
  try {
    const { section } = req.params;
    const timetable = await Timetable.findOne({ section: section.toUpperCase() });
    
    if (!timetable) {
      return res.status(404).json({ 
        message: `Timetable for section ${section.toUpperCase()} not found. Please create it first.`,
        section: section.toUpperCase()
      });
    }
    
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Failed to fetch timetable', error: error.message });
  }
};

const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find().select('section roomNumber');
    
    if (timetables.length === 0) {
      return res.json({ message: 'No timetables found. Please create timetables first.', data: [] });
    }
    
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ message: 'Failed to fetch timetables', error: error.message });
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
      return res.json({ message: 'No classes today', section: timetable.section });
    }

    let currentClass = null;
    let nextClass = null;
    
    const timeSlots = Object.entries(schedule)
      .filter(([, subject]) => subject && subject !== 'BREAK')
      .sort(([a], [b]) => a.localeCompare(b));
    
    for (const [timeSlot, subject] of timeSlots) {
      const [start, end] = timeSlot.split('-');
      
      if (timeStr >= start && timeStr <= end) {
        currentClass = {
          subject,
          time: timeSlot,
          faculty: timetable.faculty[subject] || 'TBA',
          section: timetable.section,
          roomNumber: timetable.roomNumber
        };
      } else if (timeStr < start && !nextClass) {
        nextClass = {
          subject,
          time: timeSlot,
          faculty: timetable.faculty[subject] || 'TBA',
          section: timetable.section,
          roomNumber: timetable.roomNumber
        };
      }
    }

    res.json({ currentClass, nextClass, section: timetable.section });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLiveClasses = async (req, res) => {
  try {
    const sections = ['A', 'B', 'C', 'D', 'E'];
    const liveClasses = [];
    
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    for (const section of sections) {
      const timetable = await Timetable.findOne({ section });
      if (!timetable) continue;
      
      const schedule = timetable.schedule[day];
      if (!schedule) continue;
      
      const timeSlots = Object.entries(schedule)
        .filter(([, subject]) => subject && subject !== 'BREAK')
        .sort(([a], [b]) => a.localeCompare(b));
      
      for (const [timeSlot, subject] of timeSlots) {
        const [start, end] = timeSlot.split('-');
        
        if (timeStr >= start && timeStr <= end) {
          liveClasses.push({
            section,
            subject,
            time: timeSlot,
            faculty: timetable.faculty[subject] || 'TBA',
            roomNumber: timetable.roomNumber
          });
          break;
        }
      }
    }
    
    res.json(liveClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTimetable,
  getAllTimetables,
  createTimetable,
  updateTimetable,
  getCurrentClass,
  getLiveClasses
};