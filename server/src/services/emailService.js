import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Crée un transporteur email
 */
const createTransporter = () => {
  // Configuration pour Gmail (vous pouvez changer pour un autre service)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER, // Votre email
      pass: process.env.SMTP_PASS, // Votre mot de passe d'application
    },
    tls: {
      // Ignorer les erreurs de certificat auto-signé (pour le développement)
      // En production, utilisez un certificat valide
      rejectUnauthorized: false,
    },
    // Options supplémentaires pour éviter les problèmes de certificat
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
 * Envoie un email de bienvenue avec les identifiants de connexion
 */
export const sendWelcomeEmail = async (email, password, parentName) => {
  try {
    // Normaliser l'email en minuscule pour l'envoi (même si stocké en majuscule)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérifier que les variables d'environnement sont configurées
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP non configuré dans .env');
      console.warn('   Pour activer l\'envoi d\'emails, ajoutez dans server/.env :');
      console.warn('   SMTP_HOST=smtp.gmail.com');
      console.warn('   SMTP_PORT=587');
      console.warn('   SMTP_USER=your-email@gmail.com');
      console.warn('   SMTP_PASS=your-app-password');
      console.log(`📧 [DEV] Email de bienvenue pour ${normalizedEmail}:`);
      console.log(`   Mot de passe temporaire: ${password}`);
      return { success: false, message: 'SMTP non configuré dans .env' };
    }

    // Vérifier la connexion avant d'envoyer
    const transporter = createTransporter();
    
    // Vérifier la configuration (optionnel mais utile pour débugger)
    try {
      await transporter.verify();
      console.log('✅ Configuration SMTP vérifiée avec succès');
    } catch (verifyError) {
      console.warn('⚠️ Vérification SMTP échouée, mais on continue quand même :', verifyError.message);
    }

    const mailOptions = {
      from: `"Expression d'Or" <${process.env.SMTP_USER}>`,
      to: normalizedEmail, // Utiliser l'email normalisé
      subject: 'Bienvenue sur Expression d\'Or - Votre compte parent',
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
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24; }
            .credential-item { margin: 10px 0; }
            .label { font-weight: bold; color: #1e40af; }
            .value { font-family: monospace; font-size: 16px; color: #059669; background: #f0fdf4; padding: 5px 10px; border-radius: 4px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Expression d'Or</h1>
              <p>Bienvenue dans notre système de gestion scolaire</p>
            </div>
            <div class="content">
              <h2>Bonjour ${parentName || 'Cher Parent'},</h2>
              
              <p>Votre compte parent a été créé avec succès sur la plateforme <strong>Expression d'Or</strong>.</p>
              
              <p>Vous pouvez maintenant accéder à votre espace parent pour suivre la scolarité de vos enfants.</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0; color: #1e40af;">Vos identifiants de connexion :</h3>
                <div class="credential-item">
                  <span class="label">Email :</span><br>
                  <span class="value">${email}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Mot de passe temporaire :</span><br>
                  <span class="value">${password}</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important :</strong> Pour votre sécurité, veuillez changer ce mot de passe lors de votre première connexion.
              </div>
              
              <p>Pour vous connecter, rendez-vous sur : <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color: #1e40af;">${process.env.FRONTEND_URL || 'http://localhost:5173'}/login</a></p>
              
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
        Bienvenue sur Expression d'Or
        
        Bonjour ${parentName || 'Cher Parent'},
        
        Votre compte parent a été créé avec succès.
        
        Vos identifiants de connexion :
        Email : ${email}
        Mot de passe temporaire : ${password}
        
        IMPORTANT : Veuillez changer ce mot de passe lors de votre première connexion.
        
        Pour vous connecter, rendez-vous sur : ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login
        
        Cordialement,
        L'équipe Expression d'Or
      `,
    };

    console.log(`📤 Envoi de l'email de bienvenue à ${normalizedEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé avec succès à ${normalizedEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Réponse du serveur: ${info.response || 'N/A'}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const normalizedEmail = email.toLowerCase().trim();
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
    console.error(`   Email: ${normalizedEmail}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    if (error.code === 'EAUTH') {
      console.error('   Erreur d\'authentification. Vérifiez SMTP_USER et SMTP_PASS dans Railway');
      console.error('   Pour Gmail, utilisez un "Mot de passe d\'application" :');
      console.error('   https://support.google.com/accounts/answer/185833');
    } else if (error.code === 'ECONNECTION') {
      console.error('   Erreur de connexion. Vérifiez SMTP_HOST et SMTP_PORT dans Railway');
      console.error('   Note: Railway peut bloquer certaines connexions SMTP. Considérez utiliser un service d\'email tiers');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⚠️ Timeout lors de la connexion SMTP');
      console.error('   Solutions possibles:');
      console.error('   1. Vérifiez que Gmail autorise les connexions depuis Railway');
      console.error('   2. Utilisez un service d\'email tiers (SendGrid, Mailgun, AWS SES)');
    } else if (error.message.includes('self-signed certificate')) {
      console.error('   Erreur de certificat SSL. La configuration TLS a été mise à jour pour ignorer cette erreur.');
    }
    // En cas d'erreur, on log quand même les identifiants pour le développement
    console.log(`📧 [FALLBACK] Email de bienvenue pour ${normalizedEmail}:`);
    console.log(`   Mot de passe temporaire: ${password}`);
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Teste la configuration email
 */
export const testEmailConfig = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { success: false, message: 'SMTP non configuré dans .env' };
    }

    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Configuration email valide' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

