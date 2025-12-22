import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

/**
 * Recherche un parent par email
 */
export const searchParent = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email requis pour la recherche' });
    }

    const parent = await prisma.user.findFirst({
      where: {
        email: email.toUpperCase(),
        role: 'PARENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            fatherName: true,
            fatherAddress: true,
            fatherContact: true,
            motherName: true,
            motherAddress: true,
            motherContact: true,
            guardianName: true,
            guardianContact: true,
            authorizedPerson1Name: true,
            authorizedPerson1Tel: true,
            authorizedPerson2Name: true,
            authorizedPerson2Tel: true,
            class: {
              select: {
                name: true,
                level: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc', // Le plus récent en premier
          },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent non trouvé' });
    }

    // Extraire les informations du parent depuis le premier enfant (si disponible)
    // pour pré-remplir le formulaire
    const firstStudent = parent.students && parent.students.length > 0 ? parent.students[0] : null;
    const parentInfo = {
      ...parent,
      // Informations extraites du premier enfant pour pré-remplissage
      parentInfo: firstStudent ? {
        fatherName: firstStudent.fatherName,
        fatherAddress: firstStudent.fatherAddress,
        fatherContact: firstStudent.fatherContact,
        motherName: firstStudent.motherName,
        motherAddress: firstStudent.motherAddress,
        motherContact: firstStudent.motherContact,
        guardianName: firstStudent.guardianName,
        guardianContact: firstStudent.guardianContact,
        authorizedPerson1Name: firstStudent.authorizedPerson1Name,
        authorizedPerson1Tel: firstStudent.authorizedPerson1Tel,
        authorizedPerson2Name: firstStudent.authorizedPerson2Name,
        authorizedPerson2Tel: firstStudent.authorizedPerson2Tel,
      } : null,
    };

    res.json(parentInfo);
  } catch (err) {
    console.error('searchParent error:', err);
    res.status(500).json({ error: 'Erreur lors de la recherche du parent' });
  }
};

/**
 * Récupère tous les enfants d'un parent
 */
export const getParentChildren = async (req, res) => {
  try {
    const parentId = Number(req.params.id);

    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        students: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent non trouvé' });
    }

    res.json(parent);
  } catch (err) {
    console.error('getParentChildren error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des enfants' });
  }
};

/**
 * Récupère un parent par ID
 */
export const getParentById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const parent = await prisma.user.findUnique({
      where: { id, role: 'PARENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        students: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent non trouvé' });
    }

    res.json(parent);
  } catch (err) {
    console.error('getParentById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du parent' });
  }
};

