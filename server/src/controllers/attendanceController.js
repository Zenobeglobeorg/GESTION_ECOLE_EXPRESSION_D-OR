import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère toutes les présences avec filtres optionnels
 */
export const getAttendances = async (req, res) => {
  try {
    const { classId, studentId, date, startDate, endDate, status } = req.query;

    const where = {};

    if (classId) {
      where.classId = parseInt(classId);
    }

    if (studentId) {
      where.studentId = parseInt(studentId);
    }

    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(attendances);
  } catch (err) {
    console.error('getAttendances error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des présences', details: err.message });
  }
};

/**
 * Récupère une présence par ID
 */
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Présence non trouvée' });
    }

    res.json(attendance);
  } catch (err) {
    console.error('getAttendanceById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la présence', details: err.message });
  }
};

/**
 * Enregistre les présences pour une classe à une date donnée
 */
export const markAttendances = async (req, res) => {
  try {
    const { date, classId, attendances } = req.body;

    if (!date || !classId || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ error: 'Données invalides. date, classId et attendances (array) sont requis' });
    }

    // Vérifier que la classe existe
    const classExists = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
    });

    if (!classExists) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    const dateObj = new Date(date);
    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    // Traiter chaque présence
    for (const att of attendances) {
      try {
        const { studentId, status, arrivalTime, comment } = att;

        if (!studentId || !status) {
          results.errors.push({
            studentId,
            message: 'studentId et status sont requis',
          });
          continue;
        }

        // Vérifier que l'élève existe et appartient à la classe
        const student = await prisma.student.findUnique({
          where: { id: parseInt(studentId) },
          include: { class: true },
        });

        if (!student) {
          results.errors.push({
            studentId,
            message: `Élève avec ID ${studentId} non trouvé`,
          });
          continue;
        }

        if (student.classId !== parseInt(classId)) {
          results.errors.push({
            studentId,
            message: `L'élève n'appartient pas à la classe ${classId}`,
          });
          continue;
        }

        // Normaliser le statut
        const normalizedStatus = status.toUpperCase();
        if (!['PRESENT', 'ABSENT', 'LATE'].includes(normalizedStatus)) {
          results.errors.push({
            studentId,
            message: `Statut invalide: ${status}. Doit être PRESENT, ABSENT ou LATE`,
          });
          continue;
        }

        // Vérifier si une présence existe déjà pour cet élève, cette classe et cette date
        const existingAttendance = await prisma.attendance.findUnique({
          where: {
            studentId_classId_date: {
              studentId: parseInt(studentId),
              classId: parseInt(classId),
              date: dateObj,
            },
          },
        });

        if (existingAttendance) {
          // Mettre à jour la présence existante
          await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              status: normalizedStatus,
              arrivalTime: normalizedStatus === 'LATE' ? arrivalTime || null : null,
              comment: comment || null,
            },
          });
          results.updated++;
        } else {
          // Créer une nouvelle présence
          await prisma.attendance.create({
            data: {
              studentId: parseInt(studentId),
              classId: parseInt(classId),
              date: dateObj,
              status: normalizedStatus,
              arrivalTime: normalizedStatus === 'LATE' ? arrivalTime || null : null,
              comment: comment || null,
            },
          });
          results.created++;
        }
      } catch (err) {
        console.error(`Error processing attendance for student ${att.studentId}:`, err);
        results.errors.push({
          studentId: att.studentId,
          message: err.message || 'Erreur lors du traitement',
        });
      }
    }

    res.json({
      success: true,
      message: `${results.created} présence(s) créée(s), ${results.updated} présence(s) mise(s) à jour`,
      results,
    });
  } catch (err) {
    console.error('markAttendances error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement des présences', details: err.message });
  }
};

/**
 * Met à jour une présence
 */
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, arrivalTime, comment } = req.body;

    const attendance = await prisma.attendance.findUnique({
      where: { id: parseInt(id) },
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Présence non trouvée' });
    }

    // Normaliser le statut si fourni
    let normalizedStatus = attendance.status;
    if (status) {
      normalizedStatus = status.toUpperCase();
      if (!['PRESENT', 'ABSENT', 'LATE'].includes(normalizedStatus)) {
        return res.status(400).json({ error: 'Statut invalide. Doit être PRESENT, ABSENT ou LATE' });
      }
    }

    const updated = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data: {
        status: normalizedStatus,
        arrivalTime: normalizedStatus === 'LATE' ? (arrivalTime || null) : null,
        comment: comment !== undefined ? comment : attendance.comment,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('updateAttendance error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la présence', details: err.message });
  }
};

/**
 * Supprime une présence
 */
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id: parseInt(id) },
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Présence non trouvée' });
    }

    await prisma.attendance.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Présence supprimée avec succès' });
  } catch (err) {
    console.error('deleteAttendance error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la présence', details: err.message });
  }
};

/**
 * Récupère les statistiques de présence
 */
export const getAttendanceStats = async (req, res) => {
  try {
    const { classId, date, startDate, endDate } = req.query;

    const where = {};

    if (classId) {
      where.classId = parseInt(classId);
    }

    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      select: {
        status: true,
      },
    });

    const stats = {
      present: attendances.filter(a => a.status === 'PRESENT').length,
      absent: attendances.filter(a => a.status === 'ABSENT').length,
      late: attendances.filter(a => a.status === 'LATE').length,
      total: attendances.length,
    };

    res.json(stats);
  } catch (err) {
    console.error('getAttendanceStats error:', err);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques', details: err.message });
  }
};

/**
 * Récupère les alertes d'absentéisme (élèves avec absences répétées)
 */
export const getAbsenteeismAlerts = async (req, res) => {
  try {
    const { days = 30, minAbsences = 5 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Récupérer les absences des 30 derniers jours
    const absences = await prisma.attendance.findMany({
      where: {
        status: 'ABSENT',
        date: {
          gte: startDate,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    // Compter les absences par élève
    const studentAbsences = {};
    absences.forEach(att => {
      const studentId = att.studentId;
      if (!studentAbsences[studentId]) {
        studentAbsences[studentId] = {
          student: att.student,
          count: 0,
        };
      }
      studentAbsences[studentId].count++;
    });

    // Filtrer les élèves avec au moins minAbsences absences
    const alerts = Object.values(studentAbsences)
      .filter(item => item.count >= parseInt(minAbsences))
      .map(item => ({
        student: item.student,
        absencesCount: item.count,
        period: `${days} derniers jours`,
      }))
      .sort((a, b) => b.absencesCount - a.absencesCount);

    res.json(alerts);
  } catch (err) {
    console.error('getAbsenteeismAlerts error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des alertes', details: err.message });
  }
};

/**
 * Récupère les présences des enfants du parent connecté (pour les parents)
 */
export const getMyChildrenAttendances = async (req, res) => {
  try {
    const user = req.user;
    const { studentId, startDate, endDate, status } = req.query;

    // Vérifier que l'utilisateur est un parent
    if (user.role !== 'PARENT') {
      return res.status(403).json({ error: 'Accès refusé. Cette route est réservée aux parents.' });
    }

    // Récupérer tous les enfants du parent
    const children = await prisma.student.findMany({
      where: {
        parentId: user.id,
      },
      select: {
        id: true,
      },
    });

    const childrenIds = children.map(child => child.id);

    if (childrenIds.length === 0) {
      return res.json([]);
    }

    // Construire la condition where
    const where = {
      studentId: {
        in: childrenIds,
      },
    };

    // Filtrer par élève spécifique si fourni
    if (studentId) {
      const studentIdInt = parseInt(studentId);
      // Vérifier que l'élève appartient bien au parent
      if (childrenIds.includes(studentIdInt)) {
        where.studentId = studentIdInt;
      } else {
        return res.status(403).json({ error: 'Accès non autorisé à cet élève' });
      }
    }

    // Filtrer par date
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Filtrer par statut
    if (status) {
      where.status = status.toUpperCase();
    }

    // Récupérer les présences
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(attendances);
  } catch (err) {
    console.error('getMyChildrenAttendances error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des présences', details: err.message });
  }
};

/**
 * Récupère les statistiques de présence des enfants du parent connecté
 */
export const getMyChildrenAttendanceStats = async (req, res) => {
  try {
    const user = req.user;
    const { studentId, startDate, endDate } = req.query;

    // Vérifier que l'utilisateur est un parent
    if (user.role !== 'PARENT') {
      return res.status(403).json({ error: 'Accès refusé. Cette route est réservée aux parents.' });
    }

    // Récupérer tous les enfants du parent
    const children = await prisma.student.findMany({
      where: {
        parentId: user.id,
      },
      select: {
        id: true,
      },
    });

    const childrenIds = children.map(child => child.id);

    if (childrenIds.length === 0) {
      return res.json({
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      });
    }

    // Construire la condition where
    const where = {
      studentId: {
        in: childrenIds,
      },
    };

    // Filtrer par élève spécifique si fourni
    if (studentId) {
      const studentIdInt = parseInt(studentId);
      if (childrenIds.includes(studentIdInt)) {
        where.studentId = studentIdInt;
      } else {
        return res.status(403).json({ error: 'Accès non autorisé à cet élève' });
      }
    }

    // Filtrer par date
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Récupérer les présences
    const attendances = await prisma.attendance.findMany({
      where,
      select: {
        status: true,
      },
    });

    const stats = {
      present: attendances.filter(a => a.status === 'PRESENT').length,
      absent: attendances.filter(a => a.status === 'ABSENT').length,
      late: attendances.filter(a => a.status === 'LATE').length,
      total: attendances.length,
    };

    res.json(stats);
  } catch (err) {
    console.error('getMyChildrenAttendanceStats error:', err);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques', details: err.message });
  }
};


