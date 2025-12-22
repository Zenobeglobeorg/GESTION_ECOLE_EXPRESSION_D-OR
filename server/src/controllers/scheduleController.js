import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

/**
 * Récupère tous les emplois du temps pour une classe
 */
export const listSchedules = async (req, res) => {
  try {
    const { classId } = req.query;
    const user = req.user;

    const where = {};
    if (classId) {
      where.classId = parseInt(classId);
    }

    const schedules = await prisma.schedule.findMany({
      where,
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
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    // Si l'utilisateur est un enseignant, enrichir avec les informations du ClassSubject
    if (user && user.role === 'TEACHER' && schedules.length > 0) {
      const classIds = [...new Set(schedules.map(s => s.classId))];
      const classSubjects = await prisma.classSubject.findMany({
        where: {
          classId: { in: classIds },
          teacherId: user.id,
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Créer un map pour accès rapide
      const classSubjectMap = new Map();
      classSubjects.forEach(cs => {
        const key = `${cs.classId}-${cs.subjectId}`;
        classSubjectMap.set(key, cs);
      });

      // Enrichir les schedules avec teacherId
      const enrichedSchedules = schedules.map(schedule => {
        if (schedule.type === 'SUBJECT' && schedule.subjectId) {
          const key = `${schedule.classId}-${schedule.subjectId}`;
          const classSubject = classSubjectMap.get(key);
          return {
            ...schedule,
            teacherId: classSubject?.teacherId || null,
          };
        }
        return schedule;
      });

      return res.json(enrichedSchedules);
    }

    res.json(schedules);
  } catch (err) {
    console.error('listSchedules error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des emplois du temps' });
  }
};

/**
 * Récupère un emploi du temps par ID
 */
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
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
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Emploi du temps non trouvé' });
    }

    res.json(schedule);
  } catch (err) {
    console.error('getScheduleById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'emploi du temps' });
  }
};

/**
 * Crée un nouveau créneau horaire
 */
export const createSchedule = async (req, res) => {
  try {
    const { classId, dayOfWeek, startTime, endTime, type, subjectId, eventName } = req.body;

    if (!classId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ error: 'classId, dayOfWeek, startTime et endTime sont requis' });
    }

    // Déterminer le type (par défaut SUBJECT)
    const scheduleType = type || 'SUBJECT';

    // Validation selon le type
    if (scheduleType === 'SUBJECT' && !subjectId) {
      return res.status(400).json({ error: 'subjectId est requis pour un créneau de type SUBJECT' });
    }

    if (scheduleType === 'EVENT' && !eventName) {
      return res.status(400).json({ error: 'eventName est requis pour un créneau de type EVENT' });
    }

    // Vérifier que la classe existe
    const classExists = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
    });

    if (!classExists) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Vérifier que la matière existe (si type SUBJECT)
    if (scheduleType === 'SUBJECT' && subjectId) {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) },
      });

      if (!subjectExists) {
        return res.status(404).json({ error: 'Matière non trouvée' });
      }
    }

    // Vérifier que dayOfWeek est valide (1-5 pour Lundi-Vendredi)
    if (dayOfWeek < 1 || dayOfWeek > 5) {
      return res.status(400).json({ error: 'dayOfWeek doit être entre 1 (Lundi) et 5 (Vendredi)' });
    }

    // Vérifier qu'il n'y a pas de chevauchement avec un autre créneau
    const overlappingSchedule = await prisma.schedule.findFirst({
      where: {
        classId: parseInt(classId),
        dayOfWeek: parseInt(dayOfWeek),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (overlappingSchedule) {
      return res.status(400).json({ 
        error: 'Ce créneau horaire chevauche avec un autre créneau existant pour cette classe' 
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId: parseInt(classId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        type: scheduleType,
        subjectId: scheduleType === 'SUBJECT' && subjectId ? parseInt(subjectId) : null,
        eventName: scheduleType === 'EVENT' && eventName ? eventName.trim() : null,
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
      },
    });

    res.status(201).json(schedule);
  } catch (err) {
    console.error('createSchedule error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du créneau horaire' });
  }
};

/**
 * Met à jour un créneau horaire
 */
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, dayOfWeek, startTime, endTime, type, subjectId, eventName } = req.body;

    // Vérifier que le schedule existe
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSchedule) {
      return res.status(404).json({ error: 'Créneau horaire non trouvé' });
    }

    // Déterminer le type (utiliser celui existant si non fourni)
    const scheduleType = type || existingSchedule.type;

    // Validation selon le type
    if (scheduleType === 'SUBJECT') {
      // Si on change vers SUBJECT ou si c'est déjà SUBJECT, vérifier qu'on a un subjectId
      if (type === 'SUBJECT' && !subjectId && !existingSchedule.subjectId) {
        return res.status(400).json({ error: 'subjectId est requis pour un créneau de type SUBJECT' });
      }
    }

    if (scheduleType === 'EVENT') {
      // Si on change vers EVENT ou si c'est déjà EVENT, vérifier qu'on a un eventName
      if (type === 'EVENT' && !eventName && !existingSchedule.eventName) {
        return res.status(400).json({ error: 'eventName est requis pour un créneau de type EVENT' });
      }
    }

    // Vérifier que la classe existe (si fournie)
    if (classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: parseInt(classId) },
      });

      if (!classExists) {
        return res.status(404).json({ error: 'Classe non trouvée' });
      }
    }

    // Vérifier que la matière existe (si type SUBJECT et subjectId fourni)
    if (scheduleType === 'SUBJECT' && subjectId !== undefined) {
      if (subjectId) {
        const subjectExists = await prisma.subject.findUnique({
          where: { id: parseInt(subjectId) },
        });

        if (!subjectExists) {
          return res.status(404).json({ error: 'Matière non trouvée' });
        }
      }
    }

    // Vérifier que dayOfWeek est valide (si fourni)
    if (dayOfWeek !== undefined && (dayOfWeek < 1 || dayOfWeek > 5)) {
      return res.status(400).json({ error: 'dayOfWeek doit être entre 1 (Lundi) et 5 (Vendredi)' });
    }

    // Vérifier les chevauchements (si les horaires changent)
    const finalClassId = classId ? parseInt(classId) : existingSchedule.classId;
    const finalDayOfWeek = dayOfWeek !== undefined ? parseInt(dayOfWeek) : existingSchedule.dayOfWeek;
    const finalStartTime = startTime || existingSchedule.startTime;
    const finalEndTime = endTime || existingSchedule.endTime;

    if (classId || dayOfWeek || startTime || endTime) {
      const overlappingSchedule = await prisma.schedule.findFirst({
        where: {
          id: { not: parseInt(id) },
          classId: finalClassId,
          dayOfWeek: finalDayOfWeek,
          OR: [
            {
              AND: [
                { startTime: { lte: finalStartTime } },
                { endTime: { gt: finalStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: finalEndTime } },
                { endTime: { gte: finalEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: finalStartTime } },
                { endTime: { lte: finalEndTime } },
              ],
            },
          ],
        },
      });

      if (overlappingSchedule) {
        return res.status(400).json({ 
          error: 'Ce créneau horaire chevauche avec un autre créneau existant pour cette classe' 
        });
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      ...(classId && { classId: parseInt(classId) }),
      ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(dayOfWeek) }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    };

    // Si le type change, mettre à jour le type et nettoyer les champs appropriés
    if (type && type !== existingSchedule.type) {
      updateData.type = type;
      if (type === 'SUBJECT') {
        // Passer à SUBJECT : effacer eventName, utiliser subjectId fourni ou existant
        updateData.eventName = null;
        updateData.subjectId = subjectId !== undefined ? (subjectId ? parseInt(subjectId) : null) : existingSchedule.subjectId;
      } else if (type === 'EVENT') {
        // Passer à EVENT : effacer subjectId, utiliser eventName fourni ou existant
        updateData.subjectId = null;
        updateData.eventName = eventName !== undefined ? (eventName ? eventName.trim() : null) : existingSchedule.eventName;
      }
    } else {
      // Le type ne change pas, mettre à jour seulement les champs fournis
      if (scheduleType === 'SUBJECT') {
        if (subjectId !== undefined) {
          updateData.subjectId = subjectId ? parseInt(subjectId) : null;
        }
        // S'assurer que eventName reste null pour SUBJECT
        if (eventName !== undefined || existingSchedule.eventName) {
          updateData.eventName = null;
        }
      } else if (scheduleType === 'EVENT') {
        if (eventName !== undefined) {
          updateData.eventName = eventName ? eventName.trim() : null;
        }
        // S'assurer que subjectId reste null pour EVENT
        if (subjectId !== undefined || existingSchedule.subjectId) {
          updateData.subjectId = null;
        }
      }
    }

    const schedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: updateData,
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
      },
    });

    res.json(schedule);
  } catch (err) {
    console.error('updateSchedule error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Créneau horaire non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour du créneau horaire' });
  }
};

/**
 * Supprime un créneau horaire
 */
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Créneau horaire supprimé avec succès' });
  } catch (err) {
    console.error('deleteSchedule error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Créneau horaire non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression du créneau horaire' });
  }
};

/**
 * Crée plusieurs créneaux horaires en une fois (pour générer un emploi du temps)
 */
export const createBulkSchedules = async (req, res) => {
  try {
    const { classId, schedules } = req.body;

    if (!classId || !Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ error: 'classId et un tableau de schedules sont requis' });
    }

    // Vérifier que la classe existe
    const classExists = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
    });

    if (!classExists) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Valider tous les schedules avant de les créer
    const validatedSchedules = schedules.map(s => ({
      classId: parseInt(classId),
      dayOfWeek: parseInt(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime,
      type: s.type || 'SUBJECT',
      subjectId: s.type === 'SUBJECT' && s.subjectId ? parseInt(s.subjectId) : null,
      eventName: s.type === 'EVENT' && s.eventName ? s.eventName.trim() : null,
    }));

    // Vérifier les chevauchements
    for (const schedule of validatedSchedules) {
      if (schedule.dayOfWeek < 1 || schedule.dayOfWeek > 5) {
        return res.status(400).json({ 
          error: `dayOfWeek invalide: ${schedule.dayOfWeek}. Doit être entre 1 et 5.` 
        });
      }

      const overlapping = await prisma.schedule.findFirst({
        where: {
          classId: schedule.classId,
          dayOfWeek: schedule.dayOfWeek,
          OR: [
            {
              AND: [
                { startTime: { lte: schedule.startTime } },
                { endTime: { gt: schedule.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: schedule.endTime } },
                { endTime: { gte: schedule.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: schedule.startTime } },
                { endTime: { lte: schedule.endTime } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        return res.status(400).json({ 
          error: `Chevauchement détecté pour le jour ${schedule.dayOfWeek} entre ${schedule.startTime} et ${schedule.endTime}` 
        });
      }
    }

    // Créer tous les schedules
    const createdSchedules = await prisma.schedule.createMany({
      data: validatedSchedules,
      skipDuplicates: true,
    });

    // Récupérer les schedules créés avec leurs relations
    const allSchedules = await prisma.schedule.findMany({
      where: { classId: parseInt(classId) },
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
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.status(201).json({
      message: `${createdSchedules.count} créneau(x) horaire(s) créé(s) avec succès`,
      schedules: allSchedules,
    });
  } catch (err) {
    console.error('createBulkSchedules error:', err);
    res.status(500).json({ error: 'Erreur lors de la création des créneaux horaires' });
  }
};

/**
 * Récupère les créneaux horaires personnalisés d'une classe
 * Accessible aux enseignants, parents et administrateurs
 */
export const getClassTimeSlots = async (req, res) => {
  try {
    const { classId } = req.params;
    const user = req.user;

    // Vérifier que la classe existe
    const classData = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
      include: {
        students: {
          select: {
            parentId: true,
          },
        },
      },
    });

    if (!classData) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Vérifier les permissions d'accès
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMINISTRATION';
    const isTeacherOfClass = user.role === 'TEACHER' && classData.teacherId === user.id;
    const isParentOfStudent = user.role === 'PARENT' && classData.students?.some(s => s.parentId === user.id) || false;

    // Vérifier si l'enseignant enseigne dans cette classe (via ClassSubject)
    let isTeacherAssignedToClass = false;
    if (user.role === 'TEACHER' && !isTeacherOfClass) {
      const classSubject = await prisma.classSubject.findFirst({
        where: {
          classId: parseInt(classId),
          teacherId: user.id,
        },
      });
      isTeacherAssignedToClass = !!classSubject;
    }

    if (!isAdmin && !isTeacherOfClass && !isTeacherAssignedToClass && !isParentOfStudent) {
      return res.status(403).json({ error: 'Accès non autorisé à cette classe' });
    }

    // Si des créneaux horaires sont sauvegardés, les retourner, sinon null
    res.json({ timeSlots: classData.timeSlots || null });
  } catch (err) {
    console.error('getClassTimeSlots error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des créneaux horaires' });
  }
};

/**
 * Sauvegarde les créneaux horaires personnalisés d'une classe
 */
export const saveClassTimeSlots = async (req, res) => {
  try {
    const { classId } = req.params;
    const { timeSlots } = req.body;

    if (!timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ error: 'timeSlots doit être un tableau' });
    }

    // Valider la structure des créneaux horaires
    for (const slot of timeSlots) {
      if (!slot.id || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ 
          error: 'Chaque créneau horaire doit avoir un id, startTime et endTime' 
        });
      }
    }

    // Vérifier que la classe existe
    const classExists = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
    });

    if (!classExists) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Sauvegarder les créneaux horaires
    const updatedClass = await prisma.class.update({
      where: { id: parseInt(classId) },
      data: {
        timeSlots: timeSlots,
      },
      select: {
        id: true,
        name: true,
        timeSlots: true,
      },
    });

    res.json({ 
      message: 'Créneaux horaires sauvegardés avec succès',
      timeSlots: updatedClass.timeSlots 
    });
  } catch (err) {
    console.error('saveClassTimeSlots error:', err);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde des créneaux horaires' });
  }
};

