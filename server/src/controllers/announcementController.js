import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';
import { createNotificationsForUsers } from './notificationController.js';

const prisma = getPrisma();

/**
 * Récupère toutes les annonces avec filtres optionnels
 */
export const getAnnouncements = async (req, res) => {
  try {
    const { target, priority, status } = req.query;

    const where = {};

    if (target) {
      where.target = target.toUpperCase();
    }

    if (priority) {
      where.priority = priority.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(announcements);
  } catch (err) {
    console.error('getAnnouncements error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces', details: err.message });
  }
};

/**
 * Récupère une annonce par ID
 */
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    res.json(announcement);
  } catch (err) {
    console.error('getAnnouncementById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'annonce', details: err.message });
  }
};

/**
 * Crée une nouvelle annonce
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target, priority, classIds } = req.body;
    const userId = req.user?.id;

    if (!title || !content || !target) {
      return res.status(400).json({ error: 'title, content et target sont requis' });
    }

    // Vérifier que le target est valide
    const validTargets = ['ALL_PARENTS', 'ALL_TEACHERS', 'ALL_USERS', 'SPECIFIC_CLASS'];
    if (!validTargets.includes(target.toUpperCase())) {
      return res.status(400).json({ error: `target invalide. Doit être l'un de: ${validTargets.join(', ')}` });
    }

    // Si target est SPECIFIC_CLASS, classIds est requis
    if (target.toUpperCase() === 'SPECIFIC_CLASS' && (!classIds || !Array.isArray(classIds) || classIds.length === 0)) {
      return res.status(400).json({ error: 'classIds est requis lorsque target est SPECIFIC_CLASS' });
    }

    // Vérifier que la priorité est valide si fournie
    if (priority) {
      const validPriorities = ['NORMAL', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(priority.toUpperCase())) {
        return res.status(400).json({ error: `priority invalide. Doit être l'un de: ${validPriorities.join(', ')}` });
      }
    }

    // Créer l'annonce
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        target: target.toUpperCase(),
        priority: priority ? priority.toUpperCase() : 'NORMAL',
        status: 'SENT',
        createdById: userId || null,
        sentAt: new Date(),
        ...(target.toUpperCase() === 'SPECIFIC_CLASS' && {
          classes: {
            create: classIds.map(classId => ({
              classId: parseInt(classId),
            })),
          },
        }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        classes: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Créer des notifications pour les utilisateurs concernés
    let userIdsToNotify = [];

    if (target.toUpperCase() === 'ALL_PARENTS') {
      const parents = await prisma.user.findMany({
        where: { role: 'PARENT' },
        select: { id: true },
      });
      userIdsToNotify = parents.map(p => p.id);
    } else if (target.toUpperCase() === 'ALL_TEACHERS') {
      const teachers = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        select: { id: true },
      });
      userIdsToNotify = teachers.map(t => t.id);
    } else if (target.toUpperCase() === 'ALL_USERS') {
      const users = await prisma.user.findMany({
        where: {
          role: {
            in: ['PARENT', 'TEACHER', 'ADMINISTRATION', 'SUPER_ADMIN'],
          },
        },
        select: { id: true },
      });
      userIdsToNotify = users.map(u => u.id);
    } else if (target.toUpperCase() === 'SPECIFIC_CLASS') {
      // Récupérer les parents des élèves de ces classes
      const students = await prisma.student.findMany({
        where: {
          classId: {
            in: classIds.map(id => parseInt(id)),
          },
        },
        select: {
          parentId: true,
        },
      });

      const parentIds = [...new Set(students.map(s => s.parentId))];

      // Récupérer les enseignants responsables de ces classes
      const classSubjects = await prisma.classSubject.findMany({
        where: {
          classId: {
            in: classIds.map(id => parseInt(id)),
          },
        },
        select: {
          teacherId: true,
        },
      });

      const teacherIds = [...new Set(classSubjects.map(cs => cs.teacherId).filter(id => id !== null))];

      // Récupérer aussi les enseignants principaux de ces classes
      const classes = await prisma.class.findMany({
        where: {
          id: {
            in: classIds.map(id => parseInt(id)),
          },
        },
        select: {
          teacherId: true,
        },
      });

      const classTeacherIds = [...new Set(classes.map(c => c.teacherId).filter(id => id !== null))];

      userIdsToNotify = [...new Set([...parentIds, ...teacherIds, ...classTeacherIds])];
    }

    if (userIdsToNotify.length > 0) {
      await createNotificationsForUsers(
        userIdsToNotify,
        'ANNOUNCEMENT',
        `Nouvelle annonce: ${title}`,
        content,
        announcement.id,
        {
          priority: announcement.priority,
          target: announcement.target,
        }
      );
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error('createAnnouncement error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'annonce', details: err.message });
  }
};

/**
 * Met à jour une annonce
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, target, priority, status } = req.body;

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    // Vérifier que le target est valide si fourni
    if (target) {
      const validTargets = ['ALL_PARENTS', 'ALL_TEACHERS', 'ALL_USERS'];
      if (!validTargets.includes(target.toUpperCase())) {
        return res.status(400).json({ error: `target invalide. Doit être l'un de: ${validTargets.join(', ')}` });
      }
    }

    // Vérifier que la priorité est valide si fournie
    if (priority) {
      const validPriorities = ['NORMAL', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(priority.toUpperCase())) {
        return res.status(400).json({ error: `priority invalide. Doit être l'un de: ${validPriorities.join(', ')}` });
      }
    }

    // Vérifier que le statut est valide si fourni
    if (status) {
      const validStatuses = ['DRAFT', 'SENT', 'ARCHIVED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({ error: `status invalide. Doit être l'un de: ${validStatuses.join(', ')}` });
      }
    }

    const updated = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(target && { target: target.toUpperCase() }),
        ...(priority && { priority: priority.toUpperCase() }),
        ...(status && { status: status.toUpperCase() }),
        ...(status === 'SENT' && !announcement.sentAt && { sentAt: new Date() }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('updateAnnouncement error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'annonce', details: err.message });
  }
};

/**
 * Supprime une annonce
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Annonce supprimée avec succès' });
  } catch (err) {
    console.error('deleteAnnouncement error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'annonce', details: err.message });
  }
};

/**
 * Relance une annonce (crée une copie avec une nouvelle date d'envoi)
 */
export const resendAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const originalAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!originalAnnouncement) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: originalAnnouncement.title,
        content: originalAnnouncement.content,
        target: originalAnnouncement.target,
        priority: originalAnnouncement.priority,
        status: 'SENT',
        createdById: userId || originalAnnouncement.createdById,
        sentAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error('resendAnnouncement error:', err);
    res.status(500).json({ error: 'Erreur lors de la relance de l\'annonce', details: err.message });
  }
};

