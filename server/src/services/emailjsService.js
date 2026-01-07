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
    // Compte EmailJS principal (pour bienvenue et réinitialisation)
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.templateId = process.env.EMAILJS_TEMPLATE_ID; // Template pour email de bienvenue
    this.templateIdReset = process.env.EMAILJS_TEMPLATE_ID_RESET; // Template pour réinitialisation (optionnel)
    
    // Compte EmailJS séparé pour la 2FA (optionnel)
    this.serviceId2FA = process.env.EMAILJS_SERVICE_ID_2FA; // Service ID pour 2FA
    this.templateId2FA = process.env.EMAILJS_TEMPLATE_ID_2FA; // Template ID pour 2FA
    
    // EmailJS a deux types de clés :
    // - Public Key (User ID) : Pour utilisation côté client (navigateur) uniquement
    // - Private Key (API Key) : Pour utilisation côté serveur (backend) - REQUIS pour backend
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY; // Private Key pour backend (REQUIS)
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY; // Public Key (optionnel, pour référence)
    
    // Private Key pour le compte 2FA (peut être la même ou différente)
    this.privateKey2FA = process.env.EMAILJS_PRIVATE_KEY_2FA || this.privateKey; // Fallback sur la clé principale si non spécifiée
    this.publicKey2FA = process.env.EMAILJS_PUBLIC_KEY_2FA || this.publicKey; // Fallback sur la clé principale si non spécifiée
    
    // Pour les appels backend avec @emailjs/nodejs, la Private Key est REQUISE
    // La Public Key est recommandée mais optionnelle
    this.isConfigured = !!(this.serviceId && this.templateId && this.privateKey);
    this.isConfigured2FA = !!(this.serviceId2FA && this.templateId2FA && this.privateKey2FA);
    
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
  async sendEmail({ to, subject, html, text, templateParams = {}, customTemplateId = null, customServiceId = null, customPrivateKey = null, customPublicKey = null }) {
    // Utiliser les paramètres personnalisés si fournis (pour 2FA), sinon utiliser les paramètres par défaut
    const serviceIdToUse = customServiceId || this.serviceId;
    const templateIdToUse = customTemplateId || this.templateId;
    const privateKeyToUse = customPrivateKey || this.privateKey;
    const publicKeyToUse = customPublicKey || this.publicKey;
    
    if (!serviceIdToUse || !templateIdToUse || !privateKeyToUse) {
      return {
        success: false,
        error: 'EmailJS non configuré. EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID et EMAILJS_PRIVATE_KEY requis.',
      };
    }

    try {
      // Préparer les paramètres du template
      // EmailJS remplace les variables {{variable_name}} dans le template configuré dans le dashboard
      // IMPORTANT: Les templates EmailJS ignorent le HTML/text envoyé ici et utilisent le template du dashboard
      const emailjsTemplateParams = {
        to_email: to,
        to_name: templateParams.toName || 'Utilisateur',
        // Variables standard EmailJS
        subject: subject,
        // Variables personnalisées (doivent correspondre aux noms dans le template EmailJS)
        password: templateParams.password || '',
        login_url: templateParams.loginUrl || templateParams.login_url || '',
        reset_url: templateParams.resetUrl || templateParams.reset_url || '',
        code: templateParams.code || templateParams.verification_code || '',
        verification_code: templateParams.verification_code || templateParams.code || '',
        // Ajouter tous les autres paramètres personnalisés
        ...templateParams,
      };
      
      // Log des paramètres envoyés pour debug
      console.log(`   Paramètres du template:`, {
        to_email: to,
        to_name: emailjsTemplateParams.to_name,
        password: emailjsTemplateParams.password ? '***' : '(vide)',
        login_url: emailjsTemplateParams.login_url || '(vide)',
        reset_url: emailjsTemplateParams.reset_url || '(vide)',
        code: emailjsTemplateParams.code ? '***' : '(vide)',
      });

      // Utiliser le package officiel @emailjs/nodejs pour les appels backend
      // Ce package nécessite les deux clés : publicKey (User ID) et privateKey (API Key)
      // La privateKey est utilisée pour l'authentification backend
      // La publicKey est utilisée pour identifier le compte
      if (!publicKeyToUse) {
        console.warn('⚠️ EmailJS : Public Key manquante. Elle est recommandée pour les appels backend.');
        console.warn('   💡 Ajoutez EMAILJS_PUBLIC_KEY sur Railway pour une meilleure compatibilité.');
      }
      
      console.log(`📤 Envoi EmailJS à ${to} via service ${serviceIdToUse}, template ${templateIdToUse}`);
      console.log(`   Public Key: ${publicKeyToUse ? '✅ Configurée' : '❌ Manquante'}`);
      console.log(`   Private Key: ✅ Configurée`);
      if (customServiceId) {
        console.log(`   ℹ️ Utilisation du compte EmailJS 2FA (séparé)`);
      }

      // Utiliser l'API REST directement au lieu du package (évite les problèmes de modules ESM)
      // Documentation: https://www.emailjs.com/docs/rest-api/send/
      const emailjsApiUrl = `https://api.emailjs.com/api/v1.0/email/send`;
      
      // Pour les appels backend avec Private Key, utiliser accessToken dans le body
      const requestBody = {
        service_id: serviceIdToUse,
        template_id: templateIdToUse,
        user_id: publicKeyToUse || '', // Public Key (User ID) - recommandée
        template_params: emailjsTemplateParams,
        accessToken: privateKeyToUse, // Private Key (API Key) - REQUISE pour backend
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
   * Envoie un code 2FA par email
   * Utilise le compte EmailJS 2FA si configuré, sinon utilise le compte principal
   */
  async sendTwoFactorCode(email, code, userName) {
    const normalizedEmail = email.toLowerCase().trim();

    // Utiliser le compte 2FA si configuré, sinon le compte principal
    const serviceIdToUse = this.serviceId2FA || this.serviceId;
    const templateIdToUse = this.templateId2FA || this.templateId;
    const privateKeyToUse = this.privateKey2FA || this.privateKey;
    const publicKeyToUse = this.publicKey2FA || this.publicKey;
    
    if (!serviceIdToUse || !templateIdToUse || !privateKeyToUse) {
      return {
        success: false,
        error: 'EmailJS non configuré pour la 2FA. EMAILJS_SERVICE_ID_2FA, EMAILJS_TEMPLATE_ID_2FA et EMAILJS_PRIVATE_KEY_2FA requis (ou utilisez le compte principal).',
      };
    }

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
          .code-box { background-color: #f0f9ff; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Code de Vérification</h1>
          </div>
          <div class="content">
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
            <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email ou contacter le support.</p>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              <p>Expression d'Or - Système de gestion scolaire</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Code de vérification - Expression d'Or

Bonjour ${userName},

Vous avez demandé à vous connecter à votre compte Expression d'Or.

Votre code de vérification est : ${code}

Ce code est valide pendant 10 minutes uniquement.

Si vous n'avez pas demandé ce code, ignorez cet email.

Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
    `;

    return await this.sendEmail({
      to: normalizedEmail,
      subject: 'Code de vérification - Double authentification',
      html,
      text,
      templateParams: {
        toName: userName,
        code: code,
        verification_code: code, // Alias pour compatibilité
      },
      customTemplateId: templateIdToUse, // Utiliser le template 2FA
      customServiceId: serviceIdToUse, // Utiliser le service 2FA
      customPrivateKey: privateKeyToUse, // Utiliser la clé 2FA
      customPublicKey: publicKeyToUse, // Utiliser la clé publique 2FA
    });
  }

  /**
   * Envoie un email de confirmation d'activation de la 2FA
   * Utilise le compte EmailJS 2FA si configuré, sinon utilise le compte principal
   */
  async sendTwoFactorActivationEmail(email, userName) {
    const normalizedEmail = email.toLowerCase().trim();

    // Utiliser le compte 2FA si configuré, sinon le compte principal
    const serviceIdToUse = this.serviceId2FA || this.serviceId;
    const templateIdToUse = this.templateId2FA || this.templateId;
    const privateKeyToUse = this.privateKey2FA || this.privateKey;
    const publicKeyToUse = this.publicKey2FA || this.publicKey;
    
    if (!serviceIdToUse || !templateIdToUse || !privateKeyToUse) {
      return {
        success: false,
        error: 'EmailJS non configuré pour la 2FA. EMAILJS_SERVICE_ID_2FA, EMAILJS_TEMPLATE_ID_2FA et EMAILJS_PRIVATE_KEY_2FA requis (ou utilisez le compte principal).',
      };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Double Authentification Activée</h1>
          </div>
          <div class="content">
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
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              <p>Expression d'Or - Système de gestion scolaire</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Double authentification activée - Expression d'Or

Bonjour ${userName},

La double authentification a été activée avec succès sur votre compte.

Désormais, à chaque connexion, vous recevrez un code de vérification par email que vous devrez entrer pour accéder à votre compte.

Comment ça fonctionne :
- Vous entrez votre email et mot de passe
- Un code à 6 chiffres vous est envoyé par email
- Vous entrez ce code pour finaliser votre connexion
- Le code est valide pendant 10 minutes

Si vous n'avez pas activé cette fonctionnalité, veuillez contacter immédiatement le support.

Merci d'utiliser Expression d'Or !
    `;

    return await this.sendEmail({
      to: normalizedEmail,
      subject: 'Double authentification activée - Expression d\'Or',
      html,
      text,
      templateParams: {
        toName: userName,
      },
      customTemplateId: templateIdToUse, // Utiliser le template 2FA
      customServiceId: serviceIdToUse, // Utiliser le service 2FA
      customPrivateKey: privateKeyToUse, // Utiliser la clé 2FA
      customPublicKey: publicKeyToUse, // Utiliser la clé publique 2FA
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

    console.log(`📧 Construction de l'URL de réinitialisation: ${resetUrl}`);
    
    return await this.sendEmail({
      to: normalizedEmail,
      subject: 'Réinitialisation de votre mot de passe - Expression d\'Or',
      html, // Ignoré par EmailJS si template utilisé
      text, // Ignoré par EmailJS si template utilisé
      templateParams: {
        toName: userName,
        reset_url: resetUrl, // Variable pour le template EmailJS ({{reset_url}})
        resetUrl: resetUrl, // Alias pour compatibilité
      },
      customTemplateId: templateIdToUse, // Utiliser le template de réinitialisation si disponible
    });
  }

  /**
   * Envoie un email de rappel de paiement
   * Utilise un compte EmailJS séparé pour les paiements (comme pour la 2FA)
   */
  async sendPaymentReminderEmail(email, userName, studentName, amount, dueDate, totalRemaining, daysUntilFinal) {
    const normalizedEmail = email.toLowerCase().trim();

    // Utiliser le compte EmailJS pour paiements si configuré, sinon le compte principal
    const serviceIdToUse = process.env.EMAILJS_SERVICE_ID_PAYMENT || this.serviceId;
    const templateIdToUse = process.env.EMAILJS_TEMPLATE_ID_PAYMENT || this.templateId;
    const privateKeyToUse = process.env.EMAILJS_PRIVATE_KEY_PAYMENT || this.privateKey;
    const publicKeyToUse = process.env.EMAILJS_PUBLIC_KEY_PAYMENT || this.publicKey;
    
    if (!serviceIdToUse || !templateIdToUse || !privateKeyToUse) {
      return {
        success: false,
        error: 'EmailJS non configuré pour les paiements. EMAILJS_SERVICE_ID_PAYMENT, EMAILJS_TEMPLATE_ID_PAYMENT et EMAILJS_PRIVATE_KEY_PAYMENT requis (ou utilisez le compte principal).',
      };
    }

    const dueDateFormatted = new Date(dueDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    let subject, html, text;
    
    if (daysUntilFinal !== undefined && daysUntilFinal <= 7) {
      // Dernière semaine - message urgent
      subject = `⚠️ URGENT - Paiement en retard - ${studentName}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ URGENT - Paiement en Retard</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <div class="warning">
                <p><strong>⚠️ URGENT :</strong> Il ne reste que ${daysUntilFinal} jour${daysUntilFinal > 1 ? 's' : ''} avant la date limite du 5 mars.</p>
              </div>
              <p>Une échéance de paiement est en attente pour <strong>${studentName}</strong>.</p>
              <div class="info-box">
                <p><strong>📅 Date limite :</strong> ${dueDateFormatted}</p>
                <p><strong>💰 Montant de cette échéance :</strong> ${amount.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>📊 Montant total restant :</strong> ${totalRemaining.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div class="warning">
                <p><strong>⚠️ ATTENTION :</strong> Si le paiement n'est pas effectué avant le 5 mars, votre compte sera bloqué.</p>
              </div>
              <p>Merci de régulariser votre situation au plus vite.</p>
              <p>Cordialement,<br>L'équipe Expression d'Or</p>
              <div class="footer">
                <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      text = `URGENT - Paiement en retard - ${studentName}\n\nBonjour ${userName},\n\n⚠️ URGENT : Il ne reste que ${daysUntilFinal} jour${daysUntilFinal > 1 ? 's' : ''} avant la date limite du 5 mars.\n\nUne échéance de paiement est en attente pour ${studentName}.\n\n📅 Date limite : ${dueDateFormatted}\n💰 Montant de cette échéance : ${amount.toLocaleString('fr-FR')} FCFA\n📊 Montant total restant : ${totalRemaining.toLocaleString('fr-FR')} FCFA\n\n⚠️ ATTENTION : Si le paiement n'est pas effectué avant le 5 mars, votre compte sera bloqué.\n\nMerci de régulariser votre situation au plus vite.\n\nCordialement,\nL'équipe Expression d'Or`;
    } else {
      // Message normal
      subject = `Rappel de paiement - ${studentName}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rappel de Paiement</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <p>Nous vous rappelons qu'une échéance de paiement est en attente pour <strong>${studentName}</strong>.</p>
              <div class="info-box">
                <p><strong>📅 Date limite :</strong> ${dueDateFormatted}</p>
                <p><strong>💰 Montant de cette échéance :</strong> ${amount.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>📊 Montant total restant :</strong> ${totalRemaining.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <p>Merci de régulariser votre situation au plus vite.</p>
              <p>Cordialement,<br>L'équipe Expression d'Or</p>
              <div class="footer">
                <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      text = `Rappel de paiement - ${studentName}\n\nBonjour ${userName},\n\nNous vous rappelons qu'une échéance de paiement est en attente pour ${studentName}.\n\n📅 Date limite : ${dueDateFormatted}\n💰 Montant de cette échéance : ${amount.toLocaleString('fr-FR')} FCFA\n📊 Montant total restant : ${totalRemaining.toLocaleString('fr-FR')} FCFA\n\nMerci de régulariser votre situation au plus vite.\n\nCordialement,\nL'équipe Expression d'Or`;
    }

    return await this.sendEmail({
      to: normalizedEmail,
      subject,
      html,
      text,
      templateParams: {
        toName: userName,
        studentName: studentName,
        amount: amount.toLocaleString('fr-FR'),
        dueDate: dueDateFormatted,
        totalRemaining: totalRemaining.toLocaleString('fr-FR'),
        daysUntilFinal: daysUntilFinal !== undefined ? daysUntilFinal.toString() : '',
      },
      customTemplateId: templateIdToUse,
      customServiceId: serviceIdToUse,
      customPrivateKey: privateKeyToUse,
      customPublicKey: publicKeyToUse,
    });
  }
}

// Export une instance singleton
export const emailjsService = new EmailJSService();

