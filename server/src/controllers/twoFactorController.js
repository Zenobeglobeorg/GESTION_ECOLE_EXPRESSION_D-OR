import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';
import crypto from 'crypto';
import { sendTwoFactorCode, sendTwoFactorActivationEmail } from '../services/twoFactorEmailService.js';

const prisma = getPrisma();

/**
 * Génère un code 2FA à 6 chiffres
 */
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Active la 2FA pour un utilisateur
 */
export const enableTwoFactor = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, twoFactorEnabled: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: 'La 2FA est déjà activée' });
    }

    // Générer un code de vérification pour confirmer l'activation
    const verificationCode = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Valide 10 minutes

    // Supprimer les anciens codes non utilisés
    await prisma.twoFactorCode.deleteMany({
      where: {
        userId,
        used: false,
        expiresAt: { lt: new Date() },
      },
    });

    // Créer le nouveau code
    await prisma.twoFactorCode.create({
      data: {
        userId,
        code: verificationCode,
        expiresAt,
      },
    });

    // Envoyer le code par email
    const emailResult = await sendTwoFactorCode(
      user.email,
      verificationCode,
      `${user.firstName} ${user.lastName}`
    );

    res.json({
      success: true,
      message: 'Code de vérification envoyé par email. Entrez ce code pour activer la 2FA.',
      emailSent: emailResult.success,
    });
  } catch (err) {
    console.error('enableTwoFactor error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'activation de la 2FA', details: err.message });
  }
};

/**
 * Vérifie le code et active définitivement la 2FA
 */
export const verifyAndEnableTwoFactor = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code de vérification requis' });
    }

    // Trouver le code non utilisé et non expiré
    const twoFactorCode = await prisma.twoFactorCode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!twoFactorCode) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    // Marquer le code comme utilisé
    await prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: { used: true },
    });

    // Activer la 2FA
    const user = await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
      select: { email: true, firstName: true, lastName: true },
    });

    // Envoyer un email de confirmation
    await sendTwoFactorActivationEmail(user.email, `${user.firstName} ${user.lastName}`);

    res.json({
      success: true,
      message: 'Double authentification activée avec succès',
    });
  } catch (err) {
    console.error('verifyAndEnableTwoFactor error:', err);
    res.status(500).json({ error: 'Erreur lors de la vérification du code', details: err.message });
  }
};

/**
 * Désactive la 2FA
 */
export const disableTwoFactor = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: 'La 2FA n\'est pas activée' });
    }

    // Désactiver la 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });

    // Supprimer tous les codes non utilisés
    await prisma.twoFactorCode.deleteMany({
      where: {
        userId,
        used: false,
      },
    });

    res.json({
      success: true,
      message: 'Double authentification désactivée avec succès',
    });
  } catch (err) {
    console.error('disableTwoFactor error:', err);
    res.status(500).json({ error: 'Erreur lors de la désactivation de la 2FA', details: err.message });
  }
};

/**
 * Vérifie le statut de la 2FA pour l'utilisateur
 */
export const getTwoFactorStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      enabled: user.twoFactorEnabled || false,
    });
  } catch (err) {
    console.error('getTwoFactorStatus error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut 2FA', details: err.message });
  }
};

/**
 * Génère et envoie un code 2FA pour la connexion
 * (Utilisé par le contrôleur d'authentification)
 */
export const generateLoginCode = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Générer un nouveau code
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Valide 10 minutes

    // Supprimer les anciens codes non utilisés
    await prisma.twoFactorCode.deleteMany({
      where: {
        userId,
        used: false,
        expiresAt: { lt: new Date() },
      },
    });

    // Créer le nouveau code
    await prisma.twoFactorCode.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });

    // Envoyer le code par email
    const emailResult = await sendTwoFactorCode(
      user.email,
      code,
      `${user.firstName} ${user.lastName}`
    );

    return {
      success: true,
      code, // Retourner le code pour les tests (en production, ne pas le retourner)
      emailSent: emailResult.success,
    };
  } catch (err) {
    console.error('generateLoginCode error:', err);
    throw err;
  }
};

/**
 * Vérifie un code 2FA pour la connexion
 * (Utilisé par le contrôleur d'authentification)
 */
export const verifyLoginCode = async (userId, code) => {
  try {
    // Trouver le code non utilisé et non expiré
    const twoFactorCode = await prisma.twoFactorCode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!twoFactorCode) {
      return { valid: false, error: 'Code invalide ou expiré' };
    }

    // Marquer le code comme utilisé
    await prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: { used: true },
    });

    return { valid: true };
  } catch (err) {
    console.error('verifyLoginCode error:', err);
    return { valid: false, error: 'Erreur lors de la vérification du code' };
  }
};
