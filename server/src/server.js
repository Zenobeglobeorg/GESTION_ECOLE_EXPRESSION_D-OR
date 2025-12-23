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

// Vérification de la configuration email au démarrage
console.log('\n📧 Vérification de la configuration email...');

// Vérifier EmailJS en premier (le plus rapide à configurer)
if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
  console.log('✅ Configuration EmailJS détectée (RECOMMANDÉ - le plus rapide)');
  console.log(`   Service ID: ${process.env.EMAILJS_SERVICE_ID}`);
  console.log(`   Template ID (Bienvenue): ${process.env.EMAILJS_TEMPLATE_ID}`);
  if (process.env.EMAILJS_TEMPLATE_ID_RESET) {
    console.log(`   Template ID (Réinitialisation): ${process.env.EMAILJS_TEMPLATE_ID_RESET} ✅`);
  } else {
    console.log(`   Template ID (Réinitialisation): ${process.env.EMAILJS_TEMPLATE_ID} (même que bienvenue)`);
    console.log(`   💡 Astuce: Créez un template séparé et ajoutez EMAILJS_TEMPLATE_ID_RESET pour personnaliser`);
  }
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
} else if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  console.log('✅ Configuration Mailgun détectée (recommandé)');
  console.log(`   Domain: ${process.env.MAILGUN_DOMAIN}`);
  console.log(`   From Email: ${process.env.MAILGUN_FROM_EMAIL || process.env.SMTP_USER || 'noreply@expressiondor.com'}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
} else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log('✅ Configuration SMTP détectée (fallback)');
  console.log(`   Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`   Port: ${process.env.SMTP_PORT || '587'}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.warn('   ⚠️  Note: SMTP peut avoir des problèmes de timeout depuis Railway.');
  console.warn('   💡 Recommandation: Utilisez EmailJS ou Mailgun (voir GUIDE_EMAILJS.md)');
} else {
  console.warn('⚠️  ATTENTION: Aucun service d\'email configuré !');
  console.warn('   Les emails ne seront PAS envoyés.');
  console.warn('   Options de configuration dans Railway (par ordre de recommandation):');
  console.warn('   Option 1 - EmailJS (RECOMMANDÉ - le plus rapide, 5 min de config):');
  console.warn('     - EMAILJS_SERVICE_ID (REQUIS)');
  console.warn('     - EMAILJS_TEMPLATE_ID (REQUIS - pour email de bienvenue)');
  console.warn('     - EMAILJS_PUBLIC_KEY (REQUIS)');
  console.warn('     - EMAILJS_TEMPLATE_ID_RESET (optionnel - pour réinitialisation, sinon utilise EMAILJS_TEMPLATE_ID)');
  console.warn('   Option 2 - Mailgun (recommandé pour production):');
  console.warn('     - MAILGUN_API_KEY (REQUIS)');
  console.warn('     - MAILGUN_DOMAIN (REQUIS)');
  console.warn('     - MAILGUN_FROM_EMAIL (optionnel)');
  console.warn('   Option 3 - SMTP (peut avoir des timeouts):');
  console.warn('     - SMTP_HOST (optionnel, défaut: smtp.gmail.com)');
  console.warn('     - SMTP_PORT (optionnel, défaut: 587)');
  console.warn('     - SMTP_USER (REQUIS)');
  console.warn('     - SMTP_PASS (REQUIS)');
  console.warn('   - FRONTEND_URL (optionnel, défaut: http://localhost:5173)');
  console.warn('   📖 Voir GUIDE_EMAILJS.md pour la configuration EmailJS (le plus rapide)');
}
console.log('');

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server initialized`);
});

export default app;

