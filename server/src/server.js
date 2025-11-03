import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/authRoutes.js';
import userRoutes from './api/userRoutes.js';
import roleRoutes from './api/roleRoutes.js';
import permissionRoutes from './api/permissionRoutes.js';
import studentRoutes from './api/studentRoutes.js';
import parentRoutes from './api/parentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Expression d\'Or API is running' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);

// Routes à implémenter
// app.use('/api/classes', classRoutes);
// app.use('/api/grades', gradeRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
});

export default app;

