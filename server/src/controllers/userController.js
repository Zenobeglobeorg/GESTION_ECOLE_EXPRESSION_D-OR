import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        role: true, 
        createdAt: true,
        customRole: { select: { id: true, name: true } },
        teacherLevel: true,
        teacherStatus: true,
        employmentStartDate: true,
        employmentEndDate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error('listUsers error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      role, 
      customRoleId,
      teacherLevel,
      teacherStatus,
      employmentStartDate,
      employmentEndDate
    } = req.body;
    
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toUpperCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email: email.toUpperCase(), 
        passwordHash, 
        firstName, 
        lastName, 
        phone, 
        role, 
        customRoleId: customRoleId || null,
        teacherLevel: teacherLevel || null,
        teacherStatus: teacherStatus || null,
        employmentStartDate: employmentStartDate ? new Date(employmentStartDate) : null,
        employmentEndDate: employmentEndDate ? new Date(employmentEndDate) : null,
      },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        role: true, 
        customRoleId: true,
        teacherLevel: true,
        teacherStatus: true,
        employmentStartDate: true,
        employmentEndDate: true,
        createdAt: true 
      },
    });
    res.status(201).json(user);
  } catch (err) {
    console.error('createUser error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        role: true, 
        createdAt: true,
        teacherLevel: true,
        teacherStatus: true,
        employmentStartDate: true,
        employmentEndDate: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error('getUserById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { 
      firstName, 
      lastName, 
      phone, 
      role, 
      customRoleId,
      teacherLevel,
      teacherStatus,
      employmentStartDate,
      employmentEndDate
    } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { 
        firstName, 
        lastName, 
        phone, 
        role, 
        customRoleId: customRoleId ?? null,
        teacherLevel: teacherLevel ?? null,
        teacherStatus: teacherStatus ?? null,
        employmentStartDate: employmentStartDate ? new Date(employmentStartDate) : null,
        employmentEndDate: employmentEndDate ? new Date(employmentEndDate) : null,
      },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        role: true, 
        customRoleId: true,
        teacherLevel: true,
        teacherStatus: true,
        employmentStartDate: true,
        employmentEndDate: true,
        updatedAt: true 
      },
    });
    res.json(user);
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

/**
 * Récupère le profil de l'utilisateur connecté
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        theme: true,
        language: true,
        emailNotifications: true,
        adminThemeColor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (err) {
    console.error('getCurrentUser error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        theme: true,
        language: true,
        emailNotifications: true,
        adminThemeColor: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
};

/**
 * Change le mot de passe de l'utilisateur connecté
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Ancien mot de passe et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Récupérer l'utilisateur avec le mot de passe hashé
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
};

/**
 * Met à jour les préférences de l'utilisateur connecté
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { theme, language, emailNotifications, adminThemeColor } = req.body;

    const updateData = {};
    if (theme !== undefined) {
      if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ error: 'theme doit être "light" ou "dark"' });
      }
      updateData.theme = theme;
    }
    if (language !== undefined) {
      if (!['fr', 'en'].includes(language)) {
        return res.status(400).json({ error: 'language doit être "fr" ou "en"' });
      }
      updateData.language = language;
    }
    if (emailNotifications !== undefined) {
      updateData.emailNotifications = Boolean(emailNotifications);
    }
    if (adminThemeColor !== undefined) {
      const validColors = ['blue-yellow', 'green-teal', 'purple-pink', 'orange-red', 'indigo-blue'];
      if (!validColors.includes(adminThemeColor)) {
        return res.status(400).json({ error: `adminThemeColor doit être l'un de: ${validColors.join(', ')}` });
      }
      updateData.adminThemeColor = adminThemeColor;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        theme: true,
        language: true,
        emailNotifications: true,
        adminThemeColor: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (err) {
    console.error('updatePreferences error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des préférences' });
  }
};


