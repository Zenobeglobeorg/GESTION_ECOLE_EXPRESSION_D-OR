import { sendWelcomeEmail } from './emailService.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

/**
 * Crée un transporteur email (réutilise la configuration de emailService)
 */
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    requireTLS: true,
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });

  return transporter;
};

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP non configuré - Email de réinitialisation non envoyé');
      console.log(`📧 [DEV] Lien de réinitialisation pour ${email}:`);
      console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
      return { success: false, message: 'SMTP non configuré dans .env' };
    }

    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Expression d'Or" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Expression d\'Or',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #fbbf24; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .token { font-family: monospace; background: #f0fdf4; padding: 10px; border-radius: 4px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation de Mot de Passe</h1>
              <p>Expression d'Or</p>
            </div>
            <div class="content">
              <h2>Bonjour ${userName || 'Cher Utilisateur'},</h2>
              
              <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte <strong>Expression d'Or</strong>.</p>
              
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              
              <p>Ou copiez-collez ce lien dans votre navigateur :</p>
              <div class="token">${resetUrl}</div>
              
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Ce lien est valide pendant <strong>1 heure</strong> uniquement</li>
                  <li>Ne partagez jamais ce lien avec quelqu'un d'autre</li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                </ul>
              </div>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe Expression d'Or</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              <p>© ${new Date().getFullYear()} Expression d'Or - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Réinitialisation de votre mot de passe - Expression d'Or
        
        Bonjour ${userName || 'Cher Utilisateur'},
        
        Vous avez demandé à réinitialiser votre mot de passe pour votre compte Expression d'Or.
        
        Cliquez sur ce lien pour créer un nouveau mot de passe :
        ${resetUrl}
        
        Important :
        - Ce lien est valide pendant 1 heure uniquement
        - Ne partagez jamais ce lien avec quelqu'un d'autre
        - Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
        
        Cordialement,
        L'équipe Expression d'Or
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de réinitialisation envoyé à ${email}`);
    console.log(`   Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error.message);
    console.log(`📧 [FALLBACK] Lien de réinitialisation pour ${email}:`);
    console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
    return { success: false, error: error.message, code: error.code };
  }
};

