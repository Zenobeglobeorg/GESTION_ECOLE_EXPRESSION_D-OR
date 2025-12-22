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
    debug: true, // Toujours activer pour voir les détails dans Railway
    logger: true, // Toujours activer pour voir les logs dans Railway
    // Augmenter les timeouts pour Railway
    connectionTimeout: 60000, // 60 secondes
    greetingTimeout: 30000, // 30 secondes
    socketTimeout: 60000, // 60 secondes
    // Pool de connexions pour améliorer les performances
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  return transporter;
};

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    // Normaliser l'email en minuscule pour l'envoi (même si stocké en majuscule)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérifier la configuration SMTP
    console.log('🔍 Vérification de la configuration SMTP...');
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com (par défaut)'}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '587 (par défaut)'}`);
    console.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ Configuré' : '❌ MANQUANT'}`);
    console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Configuré' : '❌ MANQUANT'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173 (par défaut)'}`);
    console.log(`   Email original: ${email}`);
    console.log(`   Email normalisé: ${normalizedEmail}`);
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ ERREUR: Configuration SMTP incomplète !');
      console.error('   Les variables d\'environnement suivantes sont requises:');
      console.error('   - SMTP_HOST (optionnel, défaut: smtp.gmail.com)');
      console.error('   - SMTP_PORT (optionnel, défaut: 587)');
      console.error('   - SMTP_USER (REQUIS)');
      console.error('   - SMTP_PASS (REQUIS)');
      console.error('   - FRONTEND_URL (optionnel, défaut: http://localhost:5173)');
      console.log(`📧 [FALLBACK] Lien de réinitialisation pour ${email}:`);
      console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
      return { 
        success: false, 
        message: 'SMTP non configuré dans les variables d\'environnement',
        error: 'SMTP_USER ou SMTP_PASS manquant'
      };
    }

    console.log('📧 Création du transporteur email...');
    const transporter = createTransporter();
    
    // Vérifier la connexion SMTP avant d'envoyer
    console.log('🔍 Vérification de la connexion SMTP...');
    try {
      await transporter.verify();
      console.log('✅ Connexion SMTP vérifiée avec succès');
    } catch (verifyError) {
      console.error('❌ Échec de la vérification SMTP:', verifyError.message);
      console.error('   Code d\'erreur:', verifyError.code);
      console.error('   Vérifiez vos identifiants SMTP dans Railway');
      return { 
        success: false, 
        error: verifyError.message,
        code: verifyError.code
      };
    }
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.log(`📧 Préparation de l'email de réinitialisation pour ${email}`);
    console.log(`   URL de réinitialisation: ${resetUrl}`);

    const mailOptions = {
      from: `"Expression d'Or" <${process.env.SMTP_USER}>`,
      to: normalizedEmail, // Utiliser l'email normalisé
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

    console.log(`📤 Envoi de l'email de réinitialisation à ${normalizedEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de réinitialisation envoyé avec succès à ${normalizedEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Réponse du serveur: ${info.response || 'N/A'}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const normalizedEmail = email.toLowerCase().trim();
    console.error('❌ ERREUR lors de l\'envoi de l\'email de réinitialisation:');
    console.error(`   Email: ${normalizedEmail}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error(`   Stack: ${error.stack || 'N/A'}`);
    
    // Détails spécifiques selon le type d'erreur
    if (error.code === 'EAUTH') {
      console.error('   ⚠️ Erreur d\'authentification SMTP');
      console.error('   Vérifiez que SMTP_USER et SMTP_PASS sont corrects dans Railway');
      console.error('   Pour Gmail, utilisez un "Mot de passe d\'application":');
      console.error('   https://support.google.com/accounts/answer/185833');
    } else if (error.code === 'ECONNECTION') {
      console.error('   ⚠️ Erreur de connexion au serveur SMTP');
      console.error('   Vérifiez SMTP_HOST et SMTP_PORT dans Railway');
      console.error('   Note: Railway peut bloquer certaines connexions SMTP. Considérez utiliser un service d\'email tiers (SendGrid, Mailgun, etc.)');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⚠️ Timeout lors de la connexion SMTP');
      console.error('   Le serveur SMTP ne répond pas dans les délais');
      console.error('   Solutions possibles:');
      console.error('   1. Vérifiez que Gmail autorise les connexions depuis Railway');
      console.error('   2. Utilisez un service d\'email tiers (SendGrid, Mailgun, AWS SES)');
      console.error('   3. Vérifiez les paramètres de sécurité de votre compte Gmail');
    } else if (error.response) {
      console.error(`   Réponse du serveur: ${error.response}`);
    }
    
    console.log(`📧 [FALLBACK] Token créé mais email non envoyé. Lien de réinitialisation:`);
    console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
    return { 
      success: false, 
      error: error.message, 
      code: error.code,
      details: error.response || error.stack
    };
  }
};

