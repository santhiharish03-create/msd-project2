const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vignan_timetable';
    console.log('Environment variables loaded:', Object.keys(process.env).filter(key => key.includes('MONGO')));
    console.log('Raw MONGODB_URI:', process.env.MONGODB_URI);
    console.log('Using MongoDB URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Failed URI was:', mongoUri);
    process.exit(1);
  }
};

module.exports = connectDB;