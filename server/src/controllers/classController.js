import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère toutes les classes
 */
export const listClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
    res.json(classes);
  } catch (err) {
    console.error('listClasses error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des classes' });
  }
};

/**
 * Récupère une classe par ID
 */
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classItem = await prisma.class.findUnique({
      where: { id: parseInt(id) },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    res.json(classItem);
  } catch (err) {
    console.error('getClassById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la classe' });
  }
};

/**
 * Crée une nouvelle classe ou retourne une classe existante
 */
export const findOrCreateClass = async (req, res) => {
  try {
    const { name, level, academicYear, teacherId } = req.body;

    if (!name || !level) {
      return res.status(400).json({ error: 'Le nom et le niveau de la classe sont requis' });
    }

    // Chercher une classe existante
    let classItem = await prisma.class.findUnique({
      where: { name },
    });

    // Si elle n'existe pas, la créer
    if (!classItem) {
      const currentYear = academicYear || new Date().getFullYear().toString();
      classItem = await prisma.class.create({
        data: {
          name,
          level,
          academicYear: `${currentYear}-${parseInt(currentYear) + 1}`,
          teacherId: teacherId ? parseInt(teacherId) : null,
        },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    res.json(classItem);
  } catch (err) {
    console.error('findOrCreateClass error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Une classe avec ce nom existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la classe' });
  }
};

/**
 * Crée une nouvelle classe
 */
export const createClass = async (req, res) => {
  try {
    const { name, level, academicYear, teacherId } = req.body;

    if (!name || !level) {
      return res.status(400).json({ error: 'Le nom et le niveau de la classe sont requis' });
    }

    const currentYear = academicYear || new Date().getFullYear().toString();
    const classItem = await prisma.class.create({
      data: {
        name,
        level,
        academicYear: `${currentYear}-${parseInt(currentYear) + 1}`,
        teacherId: teacherId ? parseInt(teacherId) : null,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(classItem);
  } catch (err) {
    console.error('createClass error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Une classe avec ce nom existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la classe' });
  }
};

/**
 * Met à jour une classe
 */
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, academicYear, teacherId } = req.body;

    const classItem = await prisma.class.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(level && { level }),
        ...(academicYear && { academicYear }),
        ...(teacherId !== undefined && { teacherId: teacherId ? parseInt(teacherId) : null }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(classItem);
  } catch (err) {
    console.error('updateClass error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Une classe avec ce nom existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la classe' });
  }
};

/**
 * Supprime une classe
 */
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Classe supprimée avec succès' });
  } catch (err) {
    console.error('deleteClass error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la classe' });
  }
};

/**
 * Récupère les classes de l'enseignant connecté avec leurs élèves
 */
export const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer les classes assignées à cet enseignant
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
          },
          orderBy: {
            lastName: 'asc',
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json(classes);
  } catch (err) {
    console.error('getMyClasses error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des classes' });
  }
};

