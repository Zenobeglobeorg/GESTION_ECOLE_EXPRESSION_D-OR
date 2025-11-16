// Alternative avec port 465 (SSL) - Utilisez cette version si le port 587 ne fonctionne pas
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Crée un transporteur email avec SSL (port 465)
 * Utilisez cette version si vous avez des problèmes avec le port 587
 */
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465, // Port SSL
    secure: true, // true pour 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Pas besoin de configuration TLS pour le port 465 avec secure: true
  });

  return transporter;
};

// Le reste du code est identique à emailService.js
// Copiez les fonctions sendWelcomeEmail et testEmailConfig depuis emailService.js

