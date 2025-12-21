import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère toutes les matières assignées aux classes (ClassSubject)
 */
export const listSubjects = async (req, res) => {
  try {
    const classSubjects = await prisma.classSubject.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { class: { name: 'asc' } },
        { subject: { name: 'asc' } },
      ],
    });

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedSubjects = classSubjects.map(cs => ({
      id: cs.id,
      name: cs.subject.name,
      classId: cs.classId,
      teacherId: cs.teacherId,
      hours: cs.hoursPerWeek,
      class: cs.class,
      subject: cs.subject,
      teacher: cs.teacher,
    }));

    res.json(formattedSubjects);
  } catch (err) {
    console.error('listSubjects error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des matières' });
  }
};

/**
 * Crée une nouvelle matière assignée à une classe
 */
export const createSubject = async (req, res) => {
  try {
    const { name, classId, teacherId, hours } = req.body;

    if (!name || !classId) {
      return res.status(400).json({ error: 'Le nom de la matière et l\'ID de la classe sont requis' });
    }

    // Vérifier que la classe existe
    const classExists = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
    });

    if (!classExists) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Vérifier que l'enseignant existe (si fourni)
    if (teacherId) {
      const teacherExists = await prisma.user.findFirst({
        where: {
          id: parseInt(teacherId),
          role: 'TEACHER',
        },
      });

      if (!teacherExists) {
        return res.status(404).json({ error: 'Enseignant non trouvé ou n\'a pas le rôle TEACHER' });
      }
    }

    // Trouver ou créer la matière (Subject)
    let subject = await prisma.subject.findUnique({
      where: { name: name.toUpperCase() },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: name.toUpperCase() },
      });
    }

    // Vérifier si cette matière n'est pas déjà assignée à cette classe
    const existingClassSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId: parseInt(classId),
          subjectId: subject.id,
        },
      },
    });

    if (existingClassSubject) {
      return res.status(400).json({ error: 'Cette matière est déjà assignée à cette classe' });
    }

    // Créer l'assignation classe-matière
    const classSubject = await prisma.classSubject.create({
      data: {
        classId: parseInt(classId),
        subjectId: subject.id,
        teacherId: teacherId ? parseInt(teacherId) : null,
        hoursPerWeek: hours ? parseInt(hours) : 4,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Formater la réponse pour correspondre au format attendu par le frontend
    res.status(201).json({
      id: classSubject.id,
      name: classSubject.subject.name,
      classId: classSubject.classId,
      teacherId: classSubject.teacherId,
      hours: classSubject.hoursPerWeek,
      class: classSubject.class,
      subject: classSubject.subject,
      teacher: classSubject.teacher,
    });
  } catch (err) {
    console.error('createSubject error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Cette matière est déjà assignée à cette classe' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la matière' });
  }
};

/**
 * Met à jour une matière assignée à une classe
 */
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId, hours } = req.body;

    // Vérifier que l'enseignant existe (si fourni)
    if (teacherId !== undefined && teacherId !== null) {
      const teacherExists = await prisma.user.findFirst({
        where: {
          id: parseInt(teacherId),
          role: 'TEACHER',
        },
      });

      if (teacherId && !teacherExists) {
        return res.status(404).json({ error: 'Enseignant non trouvé ou n\'a pas le rôle TEACHER' });
      }
    }

    const classSubject = await prisma.classSubject.update({
      where: { id: parseInt(id) },
      data: {
        ...(teacherId !== undefined && { teacherId: teacherId ? parseInt(teacherId) : null }),
        ...(hours !== undefined && { hoursPerWeek: parseInt(hours) }),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Formater la réponse
    res.json({
      id: classSubject.id,
      name: classSubject.subject.name,
      classId: classSubject.classId,
      teacherId: classSubject.teacherId,
      hours: classSubject.hoursPerWeek,
      class: classSubject.class,
      subject: classSubject.subject,
      teacher: classSubject.teacher,
    });
  } catch (err) {
    console.error('updateSubject error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Matière non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la matière' });
  }
};

/**
 * Supprime une matière assignée à une classe
 */
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.classSubject.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Matière supprimée avec succès' });
  } catch (err) {
    console.error('deleteSubject error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Matière non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression de la matière' });
  }
};

/**
 * Récupère toutes les matières disponibles (Subject) - pour les listes déroulantes
 */
export const listAvailableSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(subjects);
  } catch (err) {
    console.error('listAvailableSubjects error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des matières disponibles' });
  }
};
