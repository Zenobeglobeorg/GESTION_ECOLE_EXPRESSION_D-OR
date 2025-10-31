import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/authRoutes.js';

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

// Routes à implémenter
// app.use('/api/users', userRoutes);
// app.use('/api/students', studentRoutes);
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

