import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';
import bcrypt from 'bcrypt';

const prisma = getPrisma();

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
        function: true,
        userToPermissions: {
          select: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
              },
            },
          },
        },
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
      employmentEndDate,
      function: adminFunction
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
        function: adminFunction || null,
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
        function: true,
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
        function: true,
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
      employmentEndDate,
      function: adminFunction
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
        function: adminFunction !== undefined ? (adminFunction || null) : undefined,
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
        function: true,
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
        function: true,
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

/**
 * Récupère les permissions d'un utilisateur (directes + via customRole)
 */
export const getUserPermissions = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        customRole: {
          select: {
            permissions: {
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                category: true,
              },
            },
          },
        },
        userToPermissions: {
          select: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Super-Admin a toutes les permissions
    if (user.role === 'SUPER_ADMIN') {
      const allPermissions = await prisma.permission.findMany({
        select: {
          id: true,
          key: true,
          name: true,
          description: true,
          category: true,
        },
      });
      return res.json({ permissions: allPermissions, isSuperAdmin: true });
    }

    // Combiner les permissions du customRole et les permissions directes
    const rolePermissions = user.customRole?.permissions || [];
    const directPerms = (user.userToPermissions || []).map(utp => utp.permission);
    
    // Créer un Set pour éviter les doublons
    const permissionMap = new Map();
    
    [...rolePermissions, ...directPerms].forEach(perm => {
      permissionMap.set(perm.key, perm);
    });

    const allPermissions = Array.from(permissionMap.values());

    res.json({ permissions: allPermissions, isSuperAdmin: false });
  } catch (err) {
    console.error('getUserPermissions error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des permissions' });
  }
};

/**
 * Met à jour les permissions directes d'un utilisateur
 */
export const updateUserPermissions = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { permissions } = req.body; // Array de permission keys

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'permissions doit être un tableau' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Super-Admin ne peut pas avoir ses permissions modifiées
    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Les permissions du Super-Admin ne peuvent pas être modifiées' });
    }

    // Récupérer les IDs des permissions à partir des keys
    const permissionRecords = await prisma.permission.findMany({
      where: {
        key: { in: permissions },
      },
      select: { id: true },
    });

    const permissionIds = permissionRecords.map(p => p.id);

    // Supprimer toutes les permissions directes existantes et les remplacer
    await prisma.userToPermission.deleteMany({
      where: { userId },
    });

    // Ajouter les nouvelles permissions
    if (permissionIds.length > 0) {
      await prisma.userToPermission.createMany({
        data: permissionIds.map(permissionId => ({
          userId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    // Récupérer les permissions mises à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userToPermissions: {
          select: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({ 
      success: true, 
      message: 'Permissions mises à jour avec succès',
      permissions: (updatedUser?.userToPermissions || []).map(utp => utp.permission),
    });
  } catch (err) {
    console.error('updateUserPermissions error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des permissions' });
  }
};


