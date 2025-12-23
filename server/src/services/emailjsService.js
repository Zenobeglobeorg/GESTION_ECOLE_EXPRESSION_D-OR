import dotenv from 'dotenv';

dotenv.config();

/**
 * Service d'envoi d'emails via EmailJS API
 * Solution la plus rapide à configurer - pas de vérification de domaine nécessaire
 * Gratuit jusqu'à 200 emails/mois
 */
class EmailJSService {
  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.templateId = process.env.EMAILJS_TEMPLATE_ID; // Template pour email de bienvenue
    this.templateIdReset = process.env.EMAILJS_TEMPLATE_ID_RESET; // Template pour réinitialisation (optionnel)
    // EmailJS a deux types de clés :
    // - Public Key (User ID) : Pour utilisation côté client (navigateur) uniquement
    // - Private Key (API Key) : Pour utilisation côté serveur (backend)
    // ⚠️ IMPORTANT : EmailJS peut bloquer les appels backend même avec Private Key
    // Recommandation : Utilisez Mailgun pour les appels backend
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY; // Private Key pour backend (optionnel)
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY; // Public Key (pour référence, mais bloquée en backend)
    this.apiUrl = process.env.EMAILJS_API_URL || 'https://api.emailjs.com/api/v1.0/email/send';
    // Utiliser Private Key si disponible, sinon Public Key (mais sera probablement bloqué)
    this.userId = this.privateKey || this.publicKey;
    this.isConfigured = !!(this.serviceId && this.templateId && this.userId);
    
    if (this.isConfigured && !this.privateKey && this.publicKey) {
      console.warn('⚠️ EmailJS : Public Key détectée. EmailJS bloque les appels backend avec Public Key.');
      console.warn('   💡 Solution : Utilisez Mailgun (recommandé) ou obtenez une Private Key dans EmailJS → Account → API Keys');
      console.warn('   📖 Guide Mailgun : GUIDE_MAILGUN.md');
    }
  }

  /**
   * Envoie un email via l'API EmailJS
   * @param {string} to - Email du destinataire
   * @param {string} subject - Sujet de l'email
   * @param {string} html - Contenu HTML
   * @param {string} text - Contenu texte
   * @param {object} templateParams - Paramètres pour remplacer les variables dans le template
   * @param {string} customTemplateId - Template ID personnalisé (optionnel, pour utiliser un template différent)
   */
  async sendEmail({ to, subject, html, text, templateParams = {}, customTemplateId = null }) {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'EmailJS non configuré. EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID et EMAILJS_PRIVATE_KEY (ou EMAILJS_PUBLIC_KEY) requis.',
      };
    }

    // Utiliser le template personnalisé si fourni, sinon utiliser le template par défaut
    const templateIdToUse = customTemplateId || this.templateId;

    try {
      // EmailJS utilise des templateParams pour remplacer les variables dans le template
      const emailData = {
        service_id: this.serviceId,
        template_id: templateIdToUse,
        user_id: this.userId, // Utiliser Private Key si disponible, sinon Public Key
        template_params: {
          to_email: to,
          to_name: templateParams.toName || 'Utilisateur',
          subject: subject,
          message_html: html,
          message_text: text,
          // Ajouter tous les paramètres personnalisés (password, login_url, reset_url, etc.)
          ...templateParams,
        },
      };

      const keyType = this.privateKey ? 'Private Key' : 'Public Key';
      console.log(`📤 Envoi EmailJS à ${to} via service ${this.serviceId}, template ${templateIdToUse} (${keyType})`);
      
      if (!this.privateKey) {
        console.warn('⚠️ EmailJS : Utilisation de Public Key depuis backend - peut être bloqué par EmailJS');
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Si la réponse n'est pas du JSON, c'est probablement un succès (EmailJS retourne parfois du texte)
        if (response.ok) {
          responseData = { status: 'success', text: responseText };
        } else {
          responseData = { status: 'error', message: responseText };
        }
      }

      if (!response.ok) {
        console.error('❌ Erreur EmailJS:', responseData);
        
        // Détecter l'erreur spécifique "API calls are disabled for non-browser applications"
        if (responseData.message && responseData.message.includes('non-browser applications')) {
          console.error('❌ EmailJS bloque les appels depuis un serveur backend.');
          console.error('   💡 Solution recommandée : Utilisez Mailgun pour les appels backend');
          console.error('   📖 Guide Mailgun : GUIDE_MAILGUN.md');
          console.error('   🔑 Alternative : Obtenez une Private Key dans EmailJS → Account → API Keys');
          return {
            success: false,
            error: 'EmailJS bloque les appels backend. Utilisez Mailgun ou obtenez une Private Key.',
            code: response.status,
            details: responseData,
            recommendation: 'Utilisez Mailgun (GUIDE_MAILGUN.md) ou configurez EMAILJS_PRIVATE_KEY',
          };
        }
        
        return {
          success: false,
          error: responseData.message || responseData.text || 'Erreur lors de l\'envoi via EmailJS',
          code: response.status,
          details: responseData,
        };
      }

      console.log(`✅ Email envoyé via EmailJS à ${to}`);
      console.log(`   Status: ${responseData.status || 'success'}`);
      return {
        success: true,
        messageId: responseData.text || 'N/A',
        response: responseData,
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi via EmailJS:', error);
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
      templateParams: {
        toName: parentName,
        password: password,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
      },
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

    // Utiliser le template de réinitialisation s'il est configuré, sinon utiliser le template par défaut
    const templateIdToUse = this.templateIdReset || this.templateId;
    
    if (this.templateIdReset) {
      console.log(`📧 Utilisation du template de réinitialisation: ${this.templateIdReset}`);
    } else {
      console.log(`📧 Utilisation du template par défaut: ${this.templateId} (pour la réinitialisation aussi)`);
      console.log(`   💡 Astuce: Créez un template séparé et ajoutez EMAILJS_TEMPLATE_ID_RESET sur Railway`);
    }

    return await this.sendEmail({
      to: normalizedEmail,
      subject: 'Réinitialisation de votre mot de passe - Expression d\'Or',
      html,
      text,
      templateParams: {
        toName: userName,
        resetUrl: resetUrl,
      },
      customTemplateId: templateIdToUse, // Utiliser le template de réinitialisation si disponible
    });
  }
}

// Export une instance singleton
export const emailjsService = new EmailJSService();

