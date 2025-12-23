import dotenv from 'dotenv';

dotenv.config();

/**
 * Service d'envoi d'emails via Mailgun API
 * Plus fiable que SMTP direct, surtout depuis Railway
 */
class MailgunService {
  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY;
    this.domain = process.env.MAILGUN_DOMAIN;
    this.fromEmail = process.env.MAILGUN_FROM_EMAIL || process.env.SMTP_USER || 'noreply@expressiondor.com';
    this.apiUrl = process.env.MAILGUN_API_URL || 'https://api.mailgun.net/v3';
    this.isConfigured = !!(this.apiKey && this.domain);
  }

  /**
   * Envoie un email via l'API Mailgun
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Mailgun non configuré. MAILGUN_API_KEY et MAILGUN_DOMAIN requis.',
      };
    }

    try {
      // Utiliser URLSearchParams pour créer le body
      const formData = new URLSearchParams();
      formData.append('from', `"Expression d'Or" <${this.fromEmail}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      if (html) formData.append('html', html);
      if (text) formData.append('text', text);

      // Node.js 20+ a fetch natif

      const response = await fetch(`${this.apiUrl}/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Erreur Mailgun:', responseData);
        return {
          success: false,
          error: responseData.message || 'Erreur lors de l\'envoi via Mailgun',
          code: response.status,
          details: responseData,
        };
      }

      console.log(`✅ Email envoyé via Mailgun à ${to}`);
      console.log(`   Message ID: ${responseData.id || 'N/A'}`);
      return {
        success: true,
        messageId: responseData.id,
        response: responseData,
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi via Mailgun:', error);
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack || 'N/A'}`);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Envoie un email de bienvenue
   */
  async sendWelcomeEmail(email, password, parentName) {
    const normalizedEmail = email.toLowerCase().trim();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue sur Expression d'Or</h1>
          </div>
          <div class="content">
            <p>Bonjour ${parentName},</p>
            <p>Votre compte parent a été créé avec succès sur la plateforme de gestion de l'école Expression d'Or.</p>
            
            <div class="credentials">
              <h3>Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${normalizedEmail}</p>
              <p><strong>Mot de passe temporaire :</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
            </div>
            
            <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, veuillez changer ce mot de passe dès votre première connexion.</p>
            
            <p>Vous pouvez vous connecter en cliquant sur le bouton ci-dessous :</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Se connecter</a>
            
            <p>Si vous avez des questions, n'hésitez pas à contacter l'administration de l'école.</p>
            
            <div class="footer">
              <p>Expression d'Or - Plateforme de gestion scolaire</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bienvenue sur Expression d'Or

Bonjour ${parentName},

Votre compte parent a été créé avec succès sur la plateforme de gestion de l'école Expression d'Or.

Vos identifiants de connexion :
Email : ${normalizedEmail}
Mot de passe temporaire : ${password}

⚠️ Important : Pour des raisons de sécurité, veuillez changer ce mot de passe dès votre première connexion.

Vous pouvez vous connecter à l'adresse suivante :
${process.env.FRONTEND_URL || 'http://localhost:5173'}/login

Si vous avez des questions, n'hésitez pas à contacter l'administration de l'école.

Expression d'Or - Plateforme de gestion scolaire
    `;

    return await this.sendEmail({
      to: normalizedEmail,
      subject: 'Bienvenue sur Expression d\'Or - Vos identifiants de connexion',
      html,
      text,
    });
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(email, resetToken, userName) {
    const normalizedEmail = email.toLowerCase().trim();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe sur la plateforme Expression d'Or.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            
            <p>Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Ce lien est valide pendant <strong>1 heure</strong> uniquement</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Pour votre sécurité, ne partagez jamais ce lien</li>
              </ul>
            </div>
            
            <p>Si vous avez des questions, contactez l'administration de l'école.</p>
            
            <div class="footer">
              <p>Expression d'Or - Plateforme de gestion scolaire</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Réinitialisation de mot de passe - Expression d'Or

Bonjour ${userName},

Vous avez demandé à réinitialiser votre mot de passe sur la plateforme Expression d'Or.

Cliquez sur le lien suivant pour créer un nouveau mot de passe :
${resetUrl}

⚠️ Important :
- Ce lien est valide pendant 1 heure uniquement
- Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
- Pour votre sécurité, ne partagez jamais ce lien

Si vous avez des questions, contactez l'administration de l'école.

Expression d'Or - Plateforme de gestion scolaire
    `;

    return await this.sendEmail({
      to: normalizedEmail,
      subject: 'Réinitialisation de votre mot de passe - Expression d\'Or',
      html,
      text,
    });
  }
}

// Export une instance singleton
export const mailgunService = new MailgunService();

