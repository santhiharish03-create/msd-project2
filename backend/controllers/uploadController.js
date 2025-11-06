const multer = require('multer');
const xlsx = require('xlsx');
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Parse Excel/CSV data
const parseExcelData = (buffer, mimetype) => {
  let workbook;
  
  if (mimetype === 'text/csv') {
    // Handle CSV files
    const csvData = buffer.toString('utf8');
    workbook = xlsx.read(csvData, { type: 'string' });
  } else {
    // Handle Excel files
    workbook = xlsx.read(buffer, { type: 'buffer' });
  }
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  return jsonData;
};

// Validate and process timetable data
const processTimetableData = (data) => {
  const headers = data[0];
  const rows = data.slice(1);
  
  // Expected headers for timetable
  const expectedHeaders = ['Section', 'Day', 'Time', 'Subject', 'Faculty', 'Room'];
  
  // Validate headers
  const hasValidHeaders = expectedHeaders.every(header => 
    headers.some(h => h && h.toLowerCase().includes(header.toLowerCase()))
  );
  
  if (!hasValidHeaders) {
    throw new Error(`Invalid Excel format. Expected headers: ${expectedHeaders.join(', ')}`);
  }
  
  const timetableEntries = [];
  
  rows.forEach((row, index) => {
    if (row.length === 0 || !row[0]) return; // Skip empty rows
    
    try {
      const entry = {
        section: row[0]?.toString().trim(),
        day: row[1]?.toString().trim(),
        time: row[2]?.toString().trim(),
        subject: row[3]?.toString().trim(),
        faculty: row[4]?.toString().trim(),
        room: row[5]?.toString().trim()
      };
      
      // Validate required fields
      if (!entry.section || !entry.day || !entry.time || !entry.subject) {
        throw new Error(`Missing required data in row ${index + 2}`);
      }
      
      timetableEntries.push(entry);
    } catch (error) {
      throw new Error(`Error processing row ${index + 2}: ${error.message}`);
    }
  });
  
  return timetableEntries;
};

// Upload Excel file
const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { buffer, mimetype, originalname } = req.file;
    
    // Parse the Excel/CSV data
    const rawData = parseExcelData(buffer, mimetype);
    
    if (rawData.length < 2) {
      return res.status(400).json({ error: 'File must contain at least header row and one data row' });
    }
    
    // Process timetable data
    const timetableEntries = processTimetableData(rawData);
    
    // Group entries by section
    const sectionGroups = {};
    timetableEntries.forEach(entry => {
      if (!sectionGroups[entry.section]) {
        sectionGroups[entry.section] = [];
      }
      sectionGroups[entry.section].push({
        day: entry.day,
        time: entry.time,
        subject: entry.subject,
        faculty: entry.faculty,
        room: entry.room
      });
    });
    
    // Save to database
    const savedSections = [];
    const errors = [];
    
    for (const [section, schedule] of Object.entries(sectionGroups)) {
      try {
        // Update or create timetable for section
        const timetable = await Timetable.findOneAndUpdate(
          { section },
          { 
            section,
            schedule,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        
        savedSections.push(section);
        
        // Extract and save faculty data
        const facultyNames = [...new Set(schedule.map(s => s.faculty).filter(f => f))];
        for (const facultyName of facultyNames) {
          await Faculty.findOneAndUpdate(
            { name: facultyName },
            { 
              name: facultyName,
              department: 'General', // Default department
              lastUpdated: new Date()
            },
            { upsert: true }
          );
        }
        
        // Extract and save room data
        const roomNumbers = [...new Set(schedule.map(s => s.room).filter(r => r))];
        for (const roomNumber of roomNumbers) {
          await Room.findOneAndUpdate(
            { roomNumber },
            { 
              roomNumber,
              capacity: 60, // Default capacity
              type: 'Classroom',
              status: 'available',
              lastUpdated: new Date()
            },
            { upsert: true }
          );
        }
        
      } catch (error) {
        errors.push(`Error saving section ${section}: ${error.message}`);
      }
    }
    
    res.json({
      message: 'File processed successfully',
      filename: originalname,
      sectionsProcessed: savedSections.length,
      sections: savedSections,
      entriesProcessed: timetableEntries.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to process file',
      details: 'Please ensure your Excel file has the correct format with columns: Section, Day, Time, Subject, Faculty, Room'
    });
  }
};

// Get upload template
const getTemplate = (req, res) => {
  const templateData = [
    ['Section', 'Day', 'Time', 'Subject', 'Faculty', 'Room'],
    ['CSE-A', 'Monday', '09:00-10:00', 'Data Structures', 'Dr. Smith', 'Room-101'],
    ['CSE-A', 'Monday', '10:00-11:00', 'Algorithms', 'Prof. Johnson', 'Room-102'],
    ['CSE-B', 'Tuesday', '09:00-10:00', 'Database Systems', 'Dr. Brown', 'Room-103']
  ];
  
  const ws = xlsx.utils.aoa_to_sheet(templateData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Timetable Template');
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Disposition', 'attachment; filename=timetable-template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

module.exports = {
  upload: upload.single('file'),
  uploadExcel,
  getTemplate
};