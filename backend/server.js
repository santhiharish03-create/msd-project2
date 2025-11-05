const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const seedData = require('./config/seedData');

const timetableRoutes = require('./routes/timetableRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const realtimeRoutes = require('./routes/realtimeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');

connectDB().then(() => {
  seedData();
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5001;

app.set('io', io);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

app.use('/api/timetables', timetableRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vignan Timetable API is running' });
});

app.use(errorHandler);

// Real-time connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});