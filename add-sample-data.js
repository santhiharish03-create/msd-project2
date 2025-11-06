const mongoose = require('mongoose');
const Faculty = require('./backend/models/Faculty');
const Room = require('./backend/models/Room');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/vignan-timetable');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const addSampleData = async () => {
  await connectDB();

  // Add sample faculty
  const facultyData = [
    { name: 'Dr. Rajesh Kumar', department: 'CSE', subjects: ['Data Structures'] },
    { name: 'Prof. Anita Sharma', department: 'CSE', subjects: ['Computer Networks'] },
    { name: 'Dr. Suresh Reddy', department: 'CSE', subjects: ['Database Management'] },
    { name: 'Prof. Meera Patel', department: 'CSE', subjects: ['Operating Systems'] },
    { name: 'Dr. Vikram Singh', department: 'CSE', subjects: ['Software Engineering'] },
    { name: 'Dr. Priya Nair', department: 'CSE', subjects: ['Machine Learning'] },
    { name: 'Prof. Arjun Gupta', department: 'CSE', subjects: ['Web Technologies'] },
    { name: 'Dr. Sanjay Verma', department: 'ECE', subjects: ['Digital Electronics'] },
    { name: 'Prof. Deepika Joshi', department: 'ECE', subjects: ['Signal Processing'] }
  ];

  // Add sample rooms
  const roomData = [
    { roomNumber: 'CS-101', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'CS-102', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'CS-103', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'CS-104', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'CS-105', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'CS-201', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'CS-202', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'ECE-101', capacity: 60, type: 'Classroom', status: 'available' },
    { roomNumber: 'ECE-102', capacity: 60, type: 'Classroom', status: 'available' }
  ];

  try {
    await Faculty.insertMany(facultyData);
    console.log('Faculty data added successfully');
    
    await Room.insertMany(roomData);
    console.log('Room data added successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
};

addSampleData();