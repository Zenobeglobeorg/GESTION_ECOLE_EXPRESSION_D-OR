import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '../services/passwordResetEmail.js';
import { generateLoginCode, verifyLoginCode } from './twoFactorController.js';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

/**
 * Connexion d'un utilisateur
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    // Rechercher l'utilisateur par email (insensible à la casse)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Si la 2FA est activée, générer et envoyer un code
    if (user.twoFactorEnabled) {
      try {
        const codeResult = await generateLoginCode(user.id);
        
        if (codeResult.success && codeResult.emailSent) {
          return res.json({
            success: true,
            requiresTwoFactor: true,
            message: 'Code de vérification envoyé par email',
            emailSent: true,
            // En développement, retourner le code pour faciliter les tests
            ...(process.env.NODE_ENV === 'development' && { devCode: codeResult.code }),
          });
        } else {
          // Si l'email n'a pas été envoyé, retourner une erreur mais permettre quand même la connexion en développement
          console.error('❌ Échec de l\'envoi du code 2FA lors de la connexion');
          if (process.env.NODE_ENV === 'development' && codeResult.code) {
            console.log(`📧 [DEV] Code 2FA pour ${user.email}: ${codeResult.code}`);
            return res.json({
              success: true,
              requiresTwoFactor: true,
              message: 'Code de vérification généré (email non envoyé - mode développement)',
              emailSent: false,
              devCode: codeResult.code,
            });
          }
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi du code de vérification. Veuillez réessayer ou contacter l\'administration.',
            requiresTwoFactor: false,
            emailSent: false,
          });
        }
      } catch (error) {
        console.error('Error generating 2FA code:', error);
        return res.status(500).json({ 
          error: 'Erreur lors de l\'envoi du code de vérification',
          requiresTwoFactor: false,
          emailSent: false,
        });
      }
    }

    // Si la 2FA n'est pas activée, générer directement le token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les informations utilisateur (sans le passwordHash)
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

/**
 * Vérifie le code 2FA et finalise la connexion
 */
export const verifyTwoFactor = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Email et code de vérification requis' 
      });
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ 
        error: 'La 2FA n\'est pas activée pour ce compte' 
      });
    }

    // Vérifier le code
    const verificationResult = await verifyLoginCode(user.id, code);

    if (!verificationResult.valid) {
      return res.status(401).json({ 
        error: verificationResult.error || 'Code invalide ou expiré' 
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les informations utilisateur (sans le passwordHash)
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du code' });
  }
};

/**
 * Récupérer l'utilisateur actuellement connecté
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

/**
 * Demander la réinitialisation du mot de passe
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });

    // Ne pas révéler si l'email existe ou non (sécurité)
    // On retourne toujours un succès même si l'utilisateur n'existe pas
    if (!user) {
      // Pour des raisons de sécurité, on retourne toujours un succès
      return res.json({ 
        success: true, 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
      });
    }

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Valide pendant 1 heure

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { lt: new Date() }
      }
    });

    // Créer un nouveau token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt
      }
    });

    // Normaliser l'email en minuscule pour l'envoi (même si stocké en majuscule)
    const normalizedEmail = user.email.toLowerCase().trim();
    
    // Envoyer l'email de réinitialisation
    console.log(`📧 Tentative d'envoi d'email de réinitialisation à ${normalizedEmail}`);
    console.log(`   Email original (DB): ${user.email}`);
    console.log(`   Email normalisé (envoi): ${normalizedEmail}`);
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '587'}`);
    console.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    
    const emailResult = await sendPasswordResetEmail(
      normalizedEmail,
      resetToken,
      `${user.firstName} ${user.lastName}`
    );

    if (emailResult.success) {
      console.log(`✅ Email de réinitialisation envoyé avec succès à ${normalizedEmail}`);
      console.log(`   Message ID: ${emailResult.messageId || 'N/A'}`);
      res.json({ 
        success: true, 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
      });
    } else {
      console.error(`❌ ÉCHEC de l'envoi de l'email de réinitialisation à ${normalizedEmail}`);
      console.error(`   Raison: ${emailResult.error || emailResult.message || 'Inconnue'}`);
      console.error(`   Code d'erreur: ${emailResult.code || 'N/A'}`);
      console.log(`📧 [FALLBACK] Token créé mais email non envoyé. Lien de réinitialisation:`);
      console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email. Veuillez contacter l\'administration.',
        message: emailResult.error || 'Impossible d\'envoyer l\'email de réinitialisation'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
  }
};

/**
 * Réinitialiser le mot de passe avec un token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token et mot de passe requis' });
    }

    // Vérifier la force du mot de passe
    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Trouver le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    if (resetToken.used) {
      return res.status(400).json({ error: 'Ce token a déjà été utilisé' });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ error: 'Token expiré. Veuillez demander un nouveau lien.' });
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash }
    });

    // Marquer le token comme utilisé
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    console.log(`✅ Mot de passe réinitialisé pour l'utilisateur ${resetToken.user.email}`);

    res.json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};

/**
 * Changer le mot de passe (utilisateur connecté)
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    console.log(`✅ Mot de passe changé pour l'utilisateur ${user.email}`);

    res.json({ 
      success: true, 
      message: 'Mot de passe changé avec succès' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
};
