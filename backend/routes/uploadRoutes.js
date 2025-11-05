const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('spreadsheet') || file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files allowed'));
    }
  }
});

const parseExcelToTimetable = (buffer) => {
  const workbook = XLSX.read(buffer);
  const results = [];
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    data.forEach(row => {
      // Handle different column name variations
      const section = row.section || row.Section || row.SECTION;
      const day = row.day || row.Day || row.DAY;
      const time = row.time || row.Time || row.TIME || row['time slot'];
      const subject = row.subject || row.Subject || row.SUBJECT;
      const faculty = row.faculty || row.Faculty || row.FACULTY || row.teacher;
      const room = row.room || row.Room || row.ROOM || row['room number'];
      
      if (section && day && time && subject) {
        results.push({
          section: section.toString().toUpperCase(),
          day: day.toString(),
          time: time.toString(),
          subject: subject.toString(),
          faculty: faculty ? faculty.toString() : 'TBA',
          room: room ? room.toString() : 'TBA'
        });
      }
    });
  });
  
  return results;
};

router.post('/excel', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Excel upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);
    const parsedData = parseExcelToTimetable(req.file.buffer);
    console.log('Parsed entries:', parsedData.length);
    
    if (parsedData.length === 0) {
      return res.status(400).json({ message: 'No valid timetable data found' });
    }

    // Group by section
    const sectionGroups = {};
    parsedData.forEach(entry => {
      if (!sectionGroups[entry.section]) {
        sectionGroups[entry.section] = {
          section: entry.section,
          roomNumber: entry.room,
          schedule: {},
          faculty: {}
        };
      }
      
      if (!sectionGroups[entry.section].schedule[entry.day]) {
        sectionGroups[entry.section].schedule[entry.day] = {};
      }
      
      sectionGroups[entry.section].schedule[entry.day][entry.time] = entry.subject;
      sectionGroups[entry.section].faculty[entry.subject] = entry.faculty;
    });

    // Save to database
    const savedTimetables = [];
    for (const sectionData of Object.values(sectionGroups)) {
      const timetable = await Timetable.findOneAndUpdate(
        { section: sectionData.section },
        sectionData,
        { upsert: true, new: true }
      );
      savedTimetables.push(timetable);
    }

    // Emit real-time update
    req.app.get('io').emit('timetableUploaded', {
      count: savedTimetables.length,
      sections: savedTimetables.map(t => t.section),
      timestamp: new Date()
    });

    res.json({
      message: 'Excel file processed successfully',
      sectionsCreated: savedTimetables.length,
      entriesProcessed: parsedData.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;