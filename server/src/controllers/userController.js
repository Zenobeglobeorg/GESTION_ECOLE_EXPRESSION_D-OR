import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true,
        customRole: { select: { id: true, name: true } },
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
    const { email, password, firstName, lastName, phone, role, customRoleId } = req.body;
    
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
        customRoleId: customRoleId || null 
      },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        role: true, 
        customRoleId: true, 
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
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
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
    const { firstName, lastName, phone, role, customRoleId } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, phone, role, customRoleId: customRoleId ?? null },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, customRoleId: true, updatedAt: true },
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


