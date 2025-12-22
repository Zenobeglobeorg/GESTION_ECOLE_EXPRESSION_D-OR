import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

export const listRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(roles);
  } catch (err) {
    console.error('listRoles error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des rôles' });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Le nom du rôle est requis' });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissionIds && permissionIds.length > 0 
          ? { connect: permissionIds.map((id) => ({ id })) } 
          : undefined,
      },
      include: { permissions: true },
    });
    res.status(201).json(role);
  } catch (err) {
    console.error('createRole error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Un rôle avec ce nom existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création du rôle' });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const role = await prisma.role.findUnique({ where: { id }, include: { permissions: true } });
    if (!role) return res.status(404).json({ error: 'Rôle non trouvé' });
    res.json(role);
  } catch (err) {
    console.error('getRoleById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du rôle' });
  }
};

export const updateRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    const role = await prisma.role.update({ where: { id }, data: { name, description }, include: { permissions: true } });
    res.json(role);
  } catch (err) {
    console.error('updateRole error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.role.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteRole error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du rôle' });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { permissionIds } = req.body; // tableau d'IDs

    // Récupérer le rôle actuel pour obtenir les permissions existantes
    const currentRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!currentRole) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }

    // Convertir permissionIds en array si ce n'est pas déjà le cas
    const newPermissionIds = Array.isArray(permissionIds) ? permissionIds : [];

    // Mettre à jour les permissions
    const role = await prisma.role.update({
      where: { id },
      data: {
        permissions: {
          set: newPermissionIds.map((pid) => ({ id: pid })),
        },
      },
      include: { permissions: true },
    });
    res.json(role);
  } catch (err) {
    console.error('updateRolePermissions error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des permissions du rôle' });
  }
};


