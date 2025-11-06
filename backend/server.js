const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const timetableRoutes = require('./routes/timetableRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const realtimeRoutes = require('./routes/realtimeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const errorHandler = require('./middleware/errorHandler');

connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
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

app.use('/api/auth', authRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/announcements', announcementRoutes);
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