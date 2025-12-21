import { PrismaClient } from '@prisma/client';
import { createNotification, createNotificationsForUsers } from './notificationController.js';

const prisma = new PrismaClient();

/**
 * Récupère tous les devoirs pour une classe
 */
export const getAssignments = async (req, res) => {
  try {
    const { classId } = req.params;

    const assignments = await prisma.assignment.findMany({
      where: {
        classId: parseInt(classId),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assignments);
  } catch (err) {
    console.error('getAssignments error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des devoirs' });
  }
};

/**
 * Récupère tous les devoirs pour un enseignant
 */
export const getTeacherAssignments = async (req, res) => {
  try {
    const user = req.user;

    const assignments = await prisma.assignment.findMany({
      where: {
        teacherId: user.id,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assignments);
  } catch (err) {
    console.error('getTeacherAssignments error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des devoirs' });
  }
};

/**
 * Récupère tous les devoirs pour un parent (devoirs de ses enfants)
 */
export const getParentAssignments = async (req, res) => {
  try {
    const user = req.user;

    // Récupérer les enfants du parent
    const students = await prisma.student.findMany({
      where: {
        parentId: user.id,
      },
      select: {
        id: true,
        classId: true,
      },
    });

    const classIds = students.map(s => s.classId);

    if (classIds.length === 0) {
      return res.json([]);
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        classId: {
          in: classIds,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assignments);
  } catch (err) {
    console.error('getParentAssignments error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des devoirs' });
  }
};

/**
 * Crée un nouveau devoir
 */
export const createAssignment = async (req, res) => {
  try {
    const user = req.user;
    const { classId, subjectId, title, description, documentUrl, dueDate } = req.body;

    if (!classId || !title) {
      return res.status(400).json({ error: 'classId et title sont requis' });
    }

    // Vérifier que l'enseignant enseigne dans cette classe
    if (user.role === 'TEACHER') {
      const classSubject = await prisma.classSubject.findFirst({
        where: {
          classId: parseInt(classId),
          teacherId: user.id,
          ...(subjectId && { subjectId: parseInt(subjectId) }),
        },
      });

      if (!classSubject) {
        return res.status(403).json({ error: 'Vous n\'enseignez pas dans cette classe' });
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        classId: parseInt(classId),
        subjectId: subjectId ? parseInt(subjectId) : null,
        teacherId: user.id,
        title,
        description: description || null,
        documentUrl: documentUrl || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
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
          },
        },
      },
    });

    // Créer des notifications pour les parents des élèves de cette classe
    const students = await prisma.student.findMany({
      where: {
        classId: parseInt(classId),
      },
      select: {
        parentId: true,
      },
    });

    const parentIds = [...new Set(students.map(s => s.parentId))];

    if (parentIds.length > 0) {
      await createNotificationsForUsers(
        parentIds,
        'ASSIGNMENT',
        'Nouveau devoir',
        `Un nouveau devoir "${title}" a été ajouté pour la classe ${assignment.class.name}.`,
        assignment.id,
        {
          classId: assignment.classId,
          className: assignment.class.name,
          subjectId: assignment.subjectId,
          subjectName: assignment.subject?.name,
        }
      );
    }

    res.status(201).json(assignment);
  } catch (err) {
    console.error('createAssignment error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du devoir' });
  }
};

/**
 * Met à jour un devoir
 */
export const updateAssignment = async (req, res) => {
  try {
    const user = req.user;
    const { assignmentId } = req.params;
    const { title, description, documentUrl, dueDate } = req.body;

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Devoir non trouvé' });
    }

    if (assignment.teacherId !== user.id && user.role !== 'ADMINISTRATION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const updated = await prisma.assignment.update({
      where: { id: parseInt(assignmentId) },
      data: {
        title,
        description,
        documentUrl,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
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
          },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('updateAssignment error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du devoir' });
  }
};

/**
 * Supprime un devoir
 */
export const deleteAssignment = async (req, res) => {
  try {
    const user = req.user;
    const { assignmentId } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Devoir non trouvé' });
    }

    if (assignment.teacherId !== user.id && user.role !== 'ADMINISTRATION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await prisma.assignment.delete({
      where: { id: parseInt(assignmentId) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('deleteAssignment error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du devoir' });
  }
};

