import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/authRoutes.js';
import userRoutes from './api/userRoutes.js';
import roleRoutes from './api/roleRoutes.js';
import permissionRoutes from './api/permissionRoutes.js';
import studentRoutes from './api/studentRoutes.js';
import parentRoutes from './api/parentRoutes.js';
import classRoutes from './api/classRoutes.js';
import subjectRoutes from './api/subjectRoutes.js';
import scheduleRoutes from './api/scheduleRoutes.js';
import replacementRoutes from './api/replacementRoutes.js';
import evaluationRoutes from './api/evaluationRoutes.js';
import gradeRoutes from './api/gradeRoutes.js';
import bulletinRoutes from './api/bulletinRoutes.js';
import attendanceRoutes from './api/attendanceRoutes.js';
import calendarRoutes from './api/calendarRoutes.js';
import settingsRoutes from './api/settingsRoutes.js';
import announcementRoutes from './api/announcementRoutes.js';
import paymentRoutes from './api/paymentRoutes.js';
import messageRoutes from './api/messageRoutes.js';
import notificationRoutes from './api/notificationRoutes.js';
import assignmentRoutes from './api/assignmentRoutes.js';
import dashboardRoutes from './api/dashboardRoutes.js';
import { initializeSocket } from './websocket/socketHandler.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:5173'];
    
    // Permettre les requêtes sans origine (ex: Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed. Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Expression d\'Or API is running',
    websocket: 'active'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/replacements', replacementRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/bulletins', bulletinRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialiser Socket.IO
const io = initializeSocket(server);

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server initialized`);
});

export default app;

