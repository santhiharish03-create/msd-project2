const Faculty = require('../models/Faculty');
const Timetable = require('../models/Timetable');

const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().select('name phone subjects');
    
    if (faculty.length === 0) {
      return res.json({ message: 'No faculty found. Please add faculty members first.', data: [] });
    }
    
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Failed to fetch faculty', error: error.message });
  }
};

const getFacultySchedule = async (req, res) => {
  try {
    const { name } = req.params;
    const scheduleEntries = [];

    const timetables = await Timetable.find();
    
    if (timetables.length === 0) {
      return res.json({ message: 'No timetables found', data: [] });
    }
    
    timetables.forEach(timetable => {
      Object.entries(timetable.schedule).forEach(([day, slots]) => {
        Object.entries(slots).forEach(([time, subject]) => {
          if (subject && timetable.faculty[subject]?.includes(name)) {
            scheduleEntries.push({
              id: `${timetable.section}-${day}-${time}`,
              section: timetable.section,
              day,
              time,
              subject,
              roomNumber: timetable.roomNumber,
              faculty: timetable.faculty[subject]
            });
          }
        });
      });
    });

    if (scheduleEntries.length === 0) {
      return res.json({ message: `No schedule found for faculty ${name}`, data: [] });
    }

    res.json(scheduleEntries);
  } catch (error) {
    console.error('Error fetching faculty schedule:', error);
    res.status(500).json({ message: 'Failed to fetch faculty schedule', error: error.message });
  }
};

const createFaculty = async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFaculty,
  getFacultySchedule,
  createFaculty,
  updateFaculty,
  deleteFaculty
};