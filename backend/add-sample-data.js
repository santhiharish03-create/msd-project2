const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Room = require('./models/Room');

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
    { name: 'Dr. Rajesh Kumar', phone: '9876543210', subjects: ['Data Structures'] },
    { name: 'Prof. Anita Sharma', phone: '9876543211', subjects: ['Computer Networks'] },
    { name: 'Dr. Suresh Reddy', phone: '9876543212', subjects: ['Database Management'] },
    { name: 'Prof. Meera Patel', phone: '9876543213', subjects: ['Operating Systems'] },
    { name: 'Dr. Vikram Singh', phone: '9876543214', subjects: ['Software Engineering'] },
    { name: 'Dr. Priya Nair', phone: '9876543215', subjects: ['Machine Learning'] },
    { name: 'Prof. Arjun Gupta', phone: '9876543216', subjects: ['Web Technologies'] },
    { name: 'Dr. Sanjay Verma', phone: '9876543217', subjects: ['Digital Electronics'] },
    { name: 'Prof. Deepika Joshi', phone: '9876543218', subjects: ['Signal Processing'] }
  ];

  // Add sample rooms
  const roomData = [
    { roomNumber: 'CS-101', section: 'CSE-A', capacity: 60 },
    { roomNumber: 'CS-102', section: 'CSE-A', capacity: 60 },
    { roomNumber: 'CS-103', section: 'CSE-A', capacity: 60 },
    { roomNumber: 'CS-104', section: 'CSE-A', capacity: 60 },
    { roomNumber: 'CS-105', section: 'CSE-A', capacity: 60 },
    { roomNumber: 'CS-201', section: 'CSE-B', capacity: 60 },
    { roomNumber: 'CS-202', section: 'CSE-B', capacity: 60 },
    { roomNumber: 'ECE-101', section: 'ECE-A', capacity: 60 },
    { roomNumber: 'ECE-102', section: 'ECE-A', capacity: 60 }
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