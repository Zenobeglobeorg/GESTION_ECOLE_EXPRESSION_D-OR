import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

export const listPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({ orderBy: { key: 'asc' } });
    res.json(permissions);
  } catch (err) {
    console.error('listPermissions error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des permissions' });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { key, name, description, category } = req.body;
    const permission = await prisma.permission.create({ data: { key, name, description, category } });
    res.status(201).json(permission);
  } catch (err) {
    console.error('createPermission error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la permission' });
  }
};

export const getPermissionById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) return res.status(404).json({ error: 'Permission non trouvée' });
    res.json(permission);
  } catch (err) {
    console.error('getPermissionById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la permission' });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, category } = req.body;
    const permission = await prisma.permission.update({ where: { id }, data: { name, description, category } });
    res.json(permission);
  } catch (err) {
    console.error('updatePermission error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la permission' });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.permission.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('deletePermission error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la permission' });
  }
};


