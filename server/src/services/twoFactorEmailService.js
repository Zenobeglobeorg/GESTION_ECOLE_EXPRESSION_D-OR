import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { emailjsService } from './emailjsService.js';
import { mailgunService } from './mailgunService.js';

dotenv.config();

/**
 * Crée un transporteur email
 */
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

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
 * Envoie un code 2FA par email
 * Utilise EmailJS en priorité, puis Mailgun, puis SMTP
 */
export const sendTwoFactorCode = async (email, code, userName) => {
  try {
    // Normaliser l'email en minuscule pour l'envoi (même si stocké en majuscule)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Essayer EmailJS en premier (le plus rapide à configurer)
    if (emailjsService.isConfigured) {
      console.log('📧 Tentative d\'envoi du code 2FA via EmailJS...');
      const emailjsResult = await emailjsService.sendTwoFactorCode(normalizedEmail, code, userName);
      if (emailjsResult.success) {
        return emailjsResult;
      }
      console.warn('⚠️ Échec de l\'envoi via EmailJS, tentative avec Mailgun...');
      console.warn(`   Erreur EmailJS: ${emailjsResult.error || 'Inconnue'}`);
    }
    
    // Essayer Mailgun en deuxième (plus fiable depuis Railway)
    if (mailgunService.isConfigured) {
      console.log('📧 Tentative d\'envoi du code 2FA via Mailgun...');
      // Mailgun n'a pas encore de méthode sendTwoFactorCode, on utilisera SMTP pour l'instant
      // TODO: Ajouter sendTwoFactorCode dans mailgunService si nécessaire
    }
    
    // Fallback sur SMTP si EmailJS et Mailgun ne sont pas configurés ou ont échoué
    console.log('🔍 Vérification de la configuration SMTP pour code 2FA...');
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Aucun service d\'email configuré (ni EmailJS, ni Mailgun, ni SMTP)');
      console.warn('   Pour activer l\'envoi d\'emails 2FA, configurez l\'un des services suivants :');
      console.warn('   - EmailJS (RECOMMANDÉ - le plus rapide): EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PRIVATE_KEY');
      console.warn('   - Mailgun: MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL');
      console.warn('   - SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      console.log(`📧 [DEV] Code 2FA pour ${normalizedEmail}: ${code}`);
      return {
        success: false,
        error: 'Aucun service d\'email configuré',
        message: 'Code 2FA affiché dans la console (mode développement)',
      };
    }

    const transporter = createTransporter();
    
    // Vérifier la connexion SMTP avant d'envoyer
    try {
      await transporter.verify();
      console.log('✅ Configuration SMTP vérifiée avec succès pour code 2FA');
    } catch (verifyError) {
      console.warn('⚠️ Vérification SMTP échouée, mais on continue quand même :', verifyError.message);
    }

    const mailOptions = {
      from: `"Expression d'Or" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: 'Code de vérification - Double authentification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1e40af 0%, #fbbf24 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
              margin: -30px -30px 30px -30px;
            }
            .code-box {
              background-color: #f0f9ff;
              border: 2px dashed #1e40af;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #1e40af;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Code de Vérification</h1>
            </div>
            
            <p>Bonjour ${userName},</p>
            
            <p>Vous avez demandé à vous connecter à votre compte <strong>Expression d'Or</strong>.</p>
            
            <p>Utilisez le code suivant pour compléter votre connexion :</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Ce code est valide pendant <strong>10 minutes</strong> uniquement</li>
                <li>Ne partagez jamais ce code avec personne</li>
                <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
              </ul>
            </div>
            
            <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email ou contacter le support si vous êtes préoccupé par la sécurité de votre compte.</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              <p>Expression d'Or - Système de gestion scolaire</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Code de vérification - Expression d'Or

Bonjour ${userName},

Vous avez demandé à vous connecter à votre compte Expression d'Or.

Votre code de vérification est : ${code}

Ce code est valide pendant 10 minutes uniquement.

Si vous n'avez pas demandé ce code, ignorez cet email.

Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Code 2FA envoyé par email (SMTP) à ${normalizedEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du code 2FA:', error.message);
    console.log(`📧 [FALLBACK] Code 2FA pour ${email}: ${code}`);
    return {
      success: false,
      error: error.message,
      message: 'Code 2FA affiché dans la console (erreur d\'envoi)',
    };
  }
};

/**
 * Envoie un email de confirmation d'activation de la 2FA
 * Utilise EmailJS en priorité, puis Mailgun, puis SMTP
 */
export const sendTwoFactorActivationEmail = async (email, userName) => {
  try {
    // Normaliser l'email en minuscule pour l'envoi (même si stocké en majuscule)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Essayer EmailJS en premier (le plus rapide à configurer)
    if (emailjsService.isConfigured) {
      console.log('📧 Tentative d\'envoi de confirmation 2FA via EmailJS...');
      const emailjsResult = await emailjsService.sendTwoFactorActivationEmail(normalizedEmail, userName);
      if (emailjsResult.success) {
        return emailjsResult;
      }
      console.warn('⚠️ Échec de l\'envoi via EmailJS, tentative avec Mailgun...');
      console.warn(`   Erreur EmailJS: ${emailjsResult.error || 'Inconnue'}`);
    }
    
    // Essayer Mailgun en deuxième (plus fiable depuis Railway)
    if (mailgunService.isConfigured) {
      console.log('📧 Tentative d\'envoi de confirmation 2FA via Mailgun...');
      // Mailgun n'a pas encore de méthode sendTwoFactorActivationEmail, on utilisera SMTP pour l'instant
      // TODO: Ajouter sendTwoFactorActivationEmail dans mailgunService si nécessaire
    }
    
    // Fallback sur SMTP si EmailJS et Mailgun ne sont pas configurés ou ont échoué
    console.log('🔍 Vérification de la configuration SMTP pour confirmation 2FA...');
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`📧 [DEV] Confirmation d'activation 2FA pour ${normalizedEmail}`);
      return { success: false, error: 'SMTP non configuré' };
    }

    const transporter = createTransporter();
    
    // Vérifier la connexion SMTP avant d'envoyer
    try {
      await transporter.verify();
      console.log('✅ Configuration SMTP vérifiée avec succès pour confirmation 2FA');
    } catch (verifyError) {
      console.warn('⚠️ Vérification SMTP échouée, mais on continue quand même :', verifyError.message);
    }

    const mailOptions = {
      from: `"Expression d'Or" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: 'Double authentification activée - Expression d\'Or',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
              margin: -30px -30px 30px -30px;
            }
            .success-box {
              background-color: #d1fae5;
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Double Authentification Activée</h1>
            </div>
            
            <p>Bonjour ${userName},</p>
            
            <div class="success-box">
              <p><strong>La double authentification a été activée avec succès sur votre compte.</strong></p>
            </div>
            
            <p>Désormais, à chaque connexion, vous recevrez un code de vérification par email que vous devrez entrer pour accéder à votre compte.</p>
            
            <p><strong>Comment ça fonctionne :</strong></p>
            <ul>
              <li>Vous entrez votre email et mot de passe</li>
              <li>Un code à 6 chiffres vous est envoyé par email</li>
              <li>Vous entrez ce code pour finaliser votre connexion</li>
              <li>Le code est valide pendant 10 minutes</li>
            </ul>
            
            <p>Si vous n'avez pas activé cette fonctionnalité, veuillez contacter immédiatement le support.</p>
            
            <p>Merci d'utiliser Expression d'Or !</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation 2FA envoyé (SMTP) à ${normalizedEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error.message);
    return { success: false, error: error.message };
  }
};
