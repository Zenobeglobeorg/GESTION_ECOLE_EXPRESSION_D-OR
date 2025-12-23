import dotenv from 'dotenv';

dotenv.config();

/**
 * Service d'envoi d'emails via EmailJS API
 * Solution la plus rapide à configurer - pas de vérification de domaine nécessaire
 * Gratuit jusqu'à 200 emails/mois
 * 
 * ⚠️ IMPORTANT : Pour les appels backend, EmailJS nécessite :
 * 1. Une Private Key (API Key) - pas la Public Key
 * 2. Le package @emailjs/nodejs pour gérer correctement l'authentification
 * 3. Activation des appels API non-browser dans EmailJS → Account → Security
 * 
 * 💡 Recommandation : Utilisez Mailgun pour les appels backend (plus fiable)
 */
class EmailJSService {
  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.templateId = process.env.EMAILJS_TEMPLATE_ID; // Template pour email de bienvenue
    this.templateIdReset = process.env.EMAILJS_TEMPLATE_ID_RESET; // Template pour réinitialisation (optionnel)
    // EmailJS a deux types de clés :
    // - Public Key (User ID) : Pour utilisation côté client (navigateur) uniquement
    // - Private Key (API Key) : Pour utilisation côté serveur (backend) - REQUIS pour backend
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY; // Private Key pour backend (REQUIS)
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY; // Public Key (optionnel, pour référence)
    
    // Pour les appels backend avec @emailjs/nodejs, la Private Key est REQUISE
    // La Public Key est recommandée mais optionnelle
    this.isConfigured = !!(this.serviceId && this.templateId && this.privateKey);
    
    if (this.serviceId && this.templateId && !this.privateKey && this.publicKey) {
      console.warn('⚠️ EmailJS : Public Key détectée mais Private Key manquante.');
      console.warn('   ❌ EmailJS bloque les appels backend avec Public Key uniquement.');
      console.warn('   🔑 Solution 1 : Obtenez une Private Key dans EmailJS → Account → API Keys');
      console.warn('   🔑 Solution 2 : Activez les appels API non-browser dans EmailJS → Account → Security');
      console.warn('   💡 Solution recommandée : Utilisez Mailgun pour les appels backend (GUIDE_MAILGUN.md)');
    }
    
    if (this.isConfigured && this.privateKey) {
      if (this.publicKey) {
        console.log('✅ EmailJS configuré avec Private Key + Public Key (pour appels backend)');
      } else {
        console.log('✅ EmailJS configuré avec Private Key (Public Key recommandée mais optionnelle)');
      }
    }
  }

  /**
   * Envoie un email via l'API EmailJS en utilisant le package officiel @emailjs/nodejs
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
        error: 'EmailJS non configuré. EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID et EMAILJS_PRIVATE_KEY requis.',
      };
    }

    // Utiliser le template personnalisé si fourni, sinon utiliser le template par défaut
    const templateIdToUse = customTemplateId || this.templateId;

    try {
      // Préparer les paramètres du template
      // EmailJS remplace les variables {{variable_name}} dans le template
      const emailjsTemplateParams = {
        to_email: to,
        to_name: templateParams.toName || 'Utilisateur',
        subject: subject,
        message_html: html,
        message_text: text,
        // Ajouter tous les paramètres personnalisés (password, login_url, reset_url, etc.)
        ...templateParams,
      };

      // Utiliser le package officiel @emailjs/nodejs pour les appels backend
      // Ce package nécessite les deux clés : publicKey (User ID) et privateKey (API Key)
      // La privateKey est utilisée pour l'authentification backend
      // La publicKey est utilisée pour identifier le compte
      if (!this.publicKey) {
        console.warn('⚠️ EmailJS : Public Key manquante. Elle est recommandée pour les appels backend.');
        console.warn('   💡 Ajoutez EMAILJS_PUBLIC_KEY sur Railway pour une meilleure compatibilité.');
      }
      
      console.log(`📤 Envoi EmailJS à ${to} via service ${this.serviceId}, template ${templateIdToUse}`);
      console.log(`   Public Key: ${this.publicKey ? '✅ Configurée' : '❌ Manquante'}`);
      console.log(`   Private Key: ✅ Configurée`);

      // Utiliser l'API REST directement au lieu du package (évite les problèmes de modules ESM)
      // Documentation: https://www.emailjs.com/docs/rest-api/send/
      const emailjsApiUrl = `https://api.emailjs.com/api/v1.0/email/send`;
      
      // Pour les appels backend avec Private Key, utiliser accessToken dans le body
      const requestBody = {
        service_id: this.serviceId,
        template_id: templateIdToUse,
        user_id: this.publicKey || '', // Public Key (User ID) - recommandée
        template_params: emailjsTemplateParams,
        accessToken: this.privateKey, // Private Key (API Key) - REQUISE pour backend
      };

      const response = await fetch(emailjsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // EmailJS peut retourner soit du JSON soit du texte simple ("OK")
      let responseData;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // Réponse texte simple (ex: "OK")
          const textResponse = await response.text();
          responseData = { text: textResponse, status: response.status };
        }
      } catch (parseError) {
        // Si le parsing JSON échoue, essayer de lire comme texte
        const textResponse = await response.text();
        responseData = { text: textResponse, status: response.status };
      }

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || responseData.text || 'Erreur inconnue';
        throw {
          status: response.status,
          text: errorMessage,
          message: errorMessage,
        };
      }

      console.log(`✅ Email envoyé via EmailJS à ${to}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${responseData.text || responseData.message || 'OK'}`);
      
      return {
        success: true,
        messageId: responseData.text || responseData.message || 'OK',
        status: response.status,
        response: responseData,
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi via EmailJS:', error);
      console.error(`   Message: ${error.message || 'Erreur inconnue'}`);
      console.error(`   Status: ${error.status || 'N/A'}`);
      console.error(`   Text: ${error.text || 'N/A'}`);
      
      // Détecter les erreurs spécifiques
      const errorMessage = error.message || error.text || 'Erreur lors de l\'envoi via EmailJS';
      
      if (errorMessage.includes('Public Key is invalid') || errorMessage.includes('invalid')) {
        console.error('❌ EmailJS : Private Key invalide ou mal configurée.');
        console.error('   🔑 Vérifiez que EMAILJS_PRIVATE_KEY est correcte dans Railway');
        console.error('   🔑 Obtenez votre Private Key dans EmailJS → Account → API Keys');
        console.error('   🔑 Activez les appels API non-browser dans EmailJS → Account → Security');
        console.error('   💡 Solution recommandée : Utilisez Mailgun (GUIDE_MAILGUN.md)');
        return {
          success: false,
          error: 'Private Key EmailJS invalide. Vérifiez EMAILJS_PRIVATE_KEY ou utilisez Mailgun.',
          code: error.status,
          details: error,
          recommendation: 'Vérifiez EMAILJS_PRIVATE_KEY ou utilisez Mailgun (GUIDE_MAILGUN.md)',
        };
      }
      
      if (errorMessage.includes('non-browser') || errorMessage.includes('disabled')) {
        console.error('❌ EmailJS bloque les appels depuis un serveur backend.');
        console.error('   🔑 Activez les appels API non-browser dans EmailJS → Account → Security');
        console.error('   💡 Solution recommandée : Utilisez Mailgun pour les appels backend');
        console.error('   📖 Guide Mailgun : GUIDE_MAILGUN.md');
        return {
          success: false,
          error: 'EmailJS bloque les appels backend. Activez les appels API non-browser ou utilisez Mailgun.',
          code: error.status,
          details: error,
          recommendation: 'Activez les appels API non-browser dans EmailJS ou utilisez Mailgun',
        };
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.status,
        details: error,
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

