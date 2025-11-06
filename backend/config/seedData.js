const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Announcement = require('../models/Announcement');

const facultyData = {
  COA: "Dr. S. Ramesh (9876543210)",
  CCPS: "Mr. T. Anirudh, Ms. P. Deepa, Mr. K. Suresh",
  DAA: "Dr. N. Kishore (9123456789), Ms. B. Aditi, Mr. H. Karan, Ms. T. Megha",
  FAD: "Ms. R. Pooja (8765432109), Mr. S. Rohan, Ms. M. Sneha, Mr. V. Akash",
  OS: "Dr. K. Kumar, Mr. P. Arjun, Ms. A. Snehal, Ms. R. Swathi",
  TOC: "Mrs. G. Lavanya, Mr. D. Ankit, Ms. T. Priya, Mr. S. Rahul",
  FP: "Dr. P. Sandeep",
  NPTEL: "Mr. R. Karthik (9098765432)"
};

const baseSchedule = {
  Monday: {
    "08:15-09:10": "FP",
    "09:10-10:05": "NPTEL",
    "10:20-11:15": "CCPS",
    "11:15-12:10": "COA",
    "02:00-02:55": "DAA",
    "02:55-03:50": "NPTEL"
  },
  Tuesday: {
    "08:15-09:10": "COA",
    "09:10-10:05": "COA",
    "10:20-11:15": "OS",
    "11:15-12:10": "DAA",
    "02:00-02:55": "FP",
    "02:55-03:50": "DAA"
  },
  Wednesday: {
    "08:15-09:10": "FAD",
    "10:20-11:15": "COA",
    "11:15-12:10": "TOC",
    "12:10-01:05": "DAA",
    "02:00-02:55": "OS",
    "02:55-03:50": "CCPS"
  },
  Thursday: {
    "08:15-09:10": "OS",
    "09:10-10:05": "TOC",
    "10:20-11:15": "TOC",
    "11:15-12:10": "CCPS",
    "02:00-02:55": "DAA",
    "02:55-03:50": "FP"
  },
  Friday: {
    "08:15-09:10": "DAA",
    "09:10-10:05": "TOC",
    "10:20-11:15": "OS",
    "11:15-12:10": "CCPS",
    "02:00-02:55": "OS",
    "02:55-03:50": "FAD"
  }
};

const generateRoomNumber = (section) => {
  const floor = Math.floor(Math.random() * 4) + 2;
  const wing = String.fromCharCode(65 + Math.floor(Math.random() * 3));
  return `${floor}${wing}-${Math.floor(Math.random() * 400) + 100}`;
};

const seedData = async () => {
  try {
    const existingTimetables = await Timetable.countDocuments();
    if (existingTimetables > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');

    // Seed timetables for sections A-S
    const sections = Array.from('ABCDEFGHIJKLMNOPQRS');
    for (const section of sections) {
      await Timetable.create({
        section,
        roomNumber: generateRoomNumber(section),
        schedule: baseSchedule,
        faculty: facultyData
      });
    }

    // Seed faculty
    const facultyEntries = Object.entries(facultyData).map(([subject, name]) => ({
      name: name.split('(')[0].trim(),
      phone: name.includes('(') ? name.match(/\(([^)]+)\)/)?.[1] || '' : '',
      subjects: [subject]
    }));

    await Faculty.insertMany(facultyEntries);

    // Seed rooms using timetable room numbers
    const timetables = await Timetable.find().select('section roomNumber');
    const roomEntries = timetables.map(timetable => ({
      roomNumber: timetable.roomNumber,
      section: timetable.section,
      capacity: 60,
      schedule: baseSchedule
    }));

    await Room.insertMany(roomEntries);

    // Seed sample bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleBookings = [
      {
        roomNumber: roomEntries[0].roomNumber,
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        purpose: 'Extra Class - Data Structures',
        faculty: 'Dr. S. Ramesh'
      },
      {
        roomNumber: roomEntries[1].roomNumber,
        date: tomorrow.toISOString().split('T')[0],
        startTime: '15:30',
        endTime: '16:30',
        purpose: 'Lab Session - Programming',
        faculty: 'Ms. R. Pooja'
      }
    ];

    await Booking.insertMany(sampleBookings);

    // Seed sample users
    const sampleUsers = [
      {
        username: 'student1',
        email: 'student1@vignan.edu',
        password: 'password123',
        role: 'student'
      },
      {
        username: 'faculty1',
        email: 'faculty1@vignan.edu',
        password: 'password123',
        role: 'faculty'
      },
      {
        username: 'testuser',
        email: 'test@vignan.edu',
        password: 'test123',
        role: 'student'
      }
    ];

    await User.insertMany(sampleUsers);

    // Seed sample announcements
    const sampleAnnouncements = [
      {
        title: 'Mid-Semester Exam Schedule',
        content: 'The mid-semester examinations will begin from April 15th, 2025.',
        priority: 'high',
        author: 'Academic Office',
        targetSections: []
      },
      {
        title: 'Guest Lecture on AI/ML',
        content: 'Special lecture by industry experts on April 5th, 2025 at 2:00 PM.',
        priority: 'medium',
        author: 'CSE Department',
        targetSections: ['A', 'B', 'C']
      },
      {
        title: 'Lab Equipment Maintenance',
        content: 'Computer Lab-1 will be under maintenance on April 3rd, 2025.',
        priority: 'low',
        author: 'IT Department',
        targetSections: []
      }
    ];

    await Announcement.insertMany(sampleAnnouncements);

    console.log('Database seeded successfully with all sample data');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedData;