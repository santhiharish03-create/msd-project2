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
    console.log('File filter check:', {
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv',
      'text/plain' // Sometimes CSV files have this mimetype
    ];
    
    const hasValidExtension = file.originalname.match(/\.(xlsx|xls|csv)$/i);
    const hasValidMimetype = allowedTypes.includes(file.mimetype);
    
    if (hasValidMimetype || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Got: ${file.mimetype}. Expected: Excel or CSV files`));
    }
  }
});

const parseExcelToTimetable = (buffer, mimetype) => {
  console.log('Parsing file with mimetype:', mimetype);
  let workbook;
  
  try {
    if (mimetype === 'text/csv' || mimetype === 'application/csv') {
      const csvData = buffer.toString('utf8');
      console.log('CSV data preview:', csvData.substring(0, 200));
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('Invalid file format or corrupted file');
  }
  
  const results = { timetables: [], faculty: [], rooms: [] };
  console.log('Sheet names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`Processing sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    
    // Try different parsing methods
    const parsedData = parseSheetData(sheet, sheetName);
    
    parsedData.forEach((row, index) => {
      const section = extractValue(row, ['section', 'Section', 'SECTION', 'Section Name', 'CLASS', 'Class']) || sheetName;
      const day = extractValue(row, ['day', 'Day', 'DAY', 'Day of Week', 'DAYS']);
      const time = extractValue(row, ['time', 'Time', 'TIME', 'Time Slot', 'time slot', 'PERIOD', 'Period']);
      const subject = extractValue(row, ['subject', 'Subject', 'SUBJECT', 'Subject Name', 'COURSE', 'Course']);
      const faculty = extractValue(row, ['faculty', 'Faculty', 'FACULTY', 'teacher', 'Teacher', 'Faculty Name', 'INSTRUCTOR', 'Instructor']);
      const room = extractValue(row, ['room', 'Room', 'ROOM', 'Room Number', 'room number', 'VENUE', 'Venue']);
      const capacity = extractValue(row, ['capacity', 'Capacity', 'CAPACITY']) || 60;
      const department = extractValue(row, ['department', 'Department', 'DEPARTMENT', 'DEPT', 'Dept']) || 'General';
      
      if (section && day && time && subject) {
        const timetableEntry = {
          section: section.toString().trim().toUpperCase(),
          day: day.toString().trim(),
          time: time.toString().trim(),
          subject: subject.toString().trim(),
          faculty: faculty ? faculty.toString().trim() : 'TBA',
          room: room ? room.toString().trim() : 'TBA'
        };
        results.timetables.push(timetableEntry);
        
        if (index < 3) {
          console.log(`Sample entry ${index + 1}:`, timetableEntry);
        }
        
        // Extract faculty data
        if (faculty && faculty !== 'TBA') {
          const existingFaculty = results.faculty.find(f => f.name === faculty.toString().trim());
          if (!existingFaculty) {
            results.faculty.push({
              name: faculty.toString().trim(),
              department: department.toString().trim(),
              subjects: [subject.toString().trim()]
            });
          } else {
            if (!existingFaculty.subjects.includes(subject.toString().trim())) {
              existingFaculty.subjects.push(subject.toString().trim());
            }
          }
        }
        
        // Extract room data
        if (room && room !== 'TBA') {
          const existingRoom = results.rooms.find(r => r.roomNumber === room.toString().trim());
          if (!existingRoom) {
            results.rooms.push({
              roomNumber: room.toString().trim(),
              capacity: parseInt(capacity) || 60,
              type: 'Classroom',
              status: 'available'
            });
          }
        }
      } else {
        if (index < 5) {
          console.log(`Skipping row ${index + 1} - missing required fields:`, {
            section: !!section,
            day: !!day,
            time: !!time,
            subject: !!subject
          });
        }
      }
    });
  });
  
  return results;
};

const parseSheetData = (sheet, sheetName) => {
  // Try standard JSON conversion first
  let data = XLSX.utils.sheet_to_json(sheet);
  
  if (data.length === 0) {
    // Try with header row detection
    data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 1) {
      const headers = data[0];
      data = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          if (header && row[i]) obj[header] = row[i];
        });
        return obj;
      });
    }
  }
  
  console.log(`Sheet ${sheetName} parsed ${data.length} rows`);
  if (data.length > 0) {
    console.log('Sample row:', data[0]);
  }
  
  return data;
};

const extractValue = (row, possibleKeys) => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return null;
};

// Add template download route
router.get('/template', (req, res) => {
  const templateData = [
    ['Section', 'Day', 'Time', 'Subject', 'Faculty', 'Room', 'Department'],
    ['III-CSE-A', 'Monday', '09:00-10:00', 'Data Structures', 'Dr. Smith', 'Room-101', 'CSE'],
    ['III-CSE-A', 'Monday', '10:00-11:00', 'Algorithms', 'Prof. Johnson', 'Room-102', 'CSE'],
    ['III-CSE-B', 'Tuesday', '09:00-10:00', 'Database Systems', 'Dr. Brown', 'Room-103', 'CSE'],
    ['III-ECE-A', 'Wednesday', '11:00-12:00', 'Digital Circuits', 'Prof. Davis', 'Room-201', 'ECE']
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable Template');
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Disposition', 'attachment; filename=timetable-template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

router.post('/excel', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        message: err.message,
        error: 'FILE_UPLOAD_ERROR',
        details: 'Please check file format (.xlsx, .xls, .csv)'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        error: 'NO_FILE_ERROR'
      });
    }

    console.log('Parsing file...');
    const parsedData = parseExcelToTimetable(req.file.buffer, req.file.mimetype);
    console.log('Parsed data:', {
      timetables: parsedData.timetables.length,
      faculty: parsedData.faculty.length,
      rooms: parsedData.rooms.length
    });
    
    if (parsedData.timetables.length === 0) {
      return res.status(400).json({ 
        message: 'No valid timetable data found. Please check column names: Section, Day, Time, Subject, Faculty, Room',
        error: 'NO_DATA_ERROR',
        expectedColumns: ['Section', 'Day', 'Time', 'Subject', 'Faculty', 'Room']
      });
    }

    // Save Faculty data
    const savedFaculty = [];
    for (const facultyData of parsedData.faculty) {
      const faculty = await Faculty.findOneAndUpdate(
        { name: facultyData.name },
        {
          name: facultyData.name,
          department: facultyData.department,
          subjects: facultyData.subjects,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      savedFaculty.push(faculty);
    }

    // Save Room data
    const savedRooms = [];
    for (const roomData of parsedData.rooms) {
      const room = await Room.findOneAndUpdate(
        { roomNumber: roomData.roomNumber },
        {
          roomNumber: roomData.roomNumber,
          capacity: roomData.capacity,
          type: roomData.type,
          status: roomData.status,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      savedRooms.push(room);
    }

    // Group timetables by section
    const sectionGroups = {};
    parsedData.timetables.forEach(entry => {
      // Clean and normalize section name
      const sectionName = entry.section.toString().trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-');
      
      if (!sectionGroups[sectionName]) {
        sectionGroups[sectionName] = {
          section: sectionName,
          schedule: {},
          faculty: {},
          roomNumber: entry.room || 'TBA'
        };
      }
      
      if (!sectionGroups[sectionName].schedule[entry.day]) {
        sectionGroups[sectionName].schedule[entry.day] = {};
      }
      
      sectionGroups[sectionName].schedule[entry.day][entry.time] = entry.subject;
      sectionGroups[sectionName].faculty[entry.subject] = entry.faculty;
      
      // Update room if not set
      if (entry.room && entry.room !== 'TBA') {
        sectionGroups[sectionName].roomNumber = entry.room;
      }
    });

    // Save Timetable data
    const savedTimetables = [];
    for (const sectionData of Object.values(sectionGroups)) {
      const timetable = await Timetable.findOneAndUpdate(
        { section: sectionData.section },
        {
          ...sectionData,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      savedTimetables.push(timetable);
    }

    // Emit real-time updates
    req.app.get('io').emit('dataUploaded', {
      timetables: savedTimetables.length,
      faculty: savedFaculty.length,
      rooms: savedRooms.length,
      timestamp: new Date()
    });

    res.json({
      message: 'Excel file processed successfully',
      data: {
        timetables: savedTimetables.length,
        faculty: savedFaculty.length,
        rooms: savedRooms.length,
        totalEntries: parsedData.timetables.length
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;