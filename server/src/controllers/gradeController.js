import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';
import { createNotification } from './notificationController.js';

const prisma = getPrisma();

/**
 * Récupère les notes des enfants du parent connecté (pour les parents)
 */
export const getMyChildrenGrades = async (req, res) => {
  try {
    const user = req.user;
    
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

    // Récupérer uniquement les notes validées (visibles par les parents)
    const grades = await prisma.grade.findMany({
      where: {
        studentId: {
          in: childrenIds,
        },
        status: 'VALIDATED',
      },
      include: {
        student: {
          include: {
            class: true,
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        evaluation: {
          include: {
            competency: {
              include: {
                subject: true,
              },
            },
            palier: {
              include: {
                academicYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformer les données pour correspondre à l'interface frontend (notes sur 10)
    const transformed = grades.map(grade => ({
      id: grade.id,
      studentId: grade.studentId,
      subjectId: grade.evaluation?.competency?.subjectId || null,
      evaluationId: grade.evaluationId,
      grade: grade.score,
      score: grade.score,
      evaluationText: grade.evaluationText,
      teacherComments: grade.teacherComments,
      status: grade.status?.toLowerCase() || 'pending',
      date: grade.evaluation?.date ? grade.evaluation.date.toISOString().split('T')[0] : grade.createdAt.toISOString().split('T')[0],
      student: {
        id: grade.student.id,
        firstName: grade.student.firstName,
        lastName: grade.student.lastName,
        class: grade.student.class ? {
          id: grade.student.class.id,
          name: grade.student.class.name,
        } : null,
      },
      subject: grade.evaluation?.competency?.subject ? {
        id: grade.evaluation.competency.subject.id,
        name: grade.evaluation.competency.subject.name,
      } : null,
      evaluation: grade.evaluation ? {
        id: grade.evaluation.id,
        name: grade.evaluation.name,
        type: grade.evaluation.type,
      } : null,
    }));

    res.json(transformed);
  } catch (err) {
    console.error('getMyChildrenGrades error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
  }
};

/**
 * Récupère toutes les notes avec filtres optionnels
 */
export const listGrades = async (req, res) => {
  try {
    const { classId, subjectId, evaluationId, studentId, status } = req.query;

    const where = {};
    
    if (studentId) {
      where.studentId = parseInt(studentId);
    }
    
    if (evaluationId) {
      where.evaluationId = parseInt(evaluationId);
    }

    // Filtre par classe via l'élève
    if (classId) {
      where.student = {
        classId: parseInt(classId),
      };
    }

    // Filtre par matière via l'évaluation
    if (subjectId) {
      where.evaluation = {
        competency: {
          subjectId: parseInt(subjectId),
        },
      };
    }

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        evaluation: {
          include: {
            competency: {
              include: {
                subject: true,
              },
            },
            palier: {
              include: {
                academicYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformer les données pour correspondre à l'interface frontend (notes sur 10)
    let transformed = grades.map(grade => ({
      id: grade.id,
      studentId: grade.studentId,
      subjectId: grade.evaluation?.competency?.subjectId || null,
      evaluationId: grade.evaluationId,
      grade: grade.score,
      score: grade.score,
      evaluationText: grade.evaluationText,
      teacherComments: grade.teacherComments,
      status: grade.status?.toLowerCase() || 'pending',
      date: grade.evaluation?.date ? grade.evaluation.date.toISOString().split('T')[0] : grade.createdAt.toISOString().split('T')[0],
      student: {
        id: grade.student.id,
        firstName: grade.student.firstName,
        lastName: grade.student.lastName,
        class: grade.student.class ? {
          id: grade.student.class.id,
          name: grade.student.class.name,
        } : null,
      },
      subject: grade.evaluation?.competency?.subject ? {
        id: grade.evaluation.competency.subject.id,
        name: grade.evaluation.competency.subject.name,
      } : null,
      evaluation: grade.evaluation ? {
        id: grade.evaluation.id,
        name: grade.evaluation.name,
        type: grade.evaluation.type,
      } : null,
    }));

    if (status) {
      const statusLower = status.toLowerCase();
      transformed = transformed.filter(g => g.status === statusLower);
    }

    res.json(transformed);
  } catch (err) {
    console.error('listGrades error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
  }
};

/**
 * Récupère une note par ID
 */
export const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: {
            class: true,
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        evaluation: {
          include: {
            competency: {
              include: {
                subject: true,
              },
            },
            palier: {
              include: {
                academicYear: true,
              },
            },
          },
        },
      },
    });

    if (!grade) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }

    res.json({
      id: grade.id,
      studentId: grade.studentId,
      subjectId: grade.evaluation?.competency?.subjectId || null,
      evaluationId: grade.evaluationId,
      grade: grade.score,
      score: grade.score,
      evaluationText: grade.evaluationText,
      teacherComments: grade.teacherComments,
      status: grade.status?.toLowerCase() || 'pending',
      date: grade.evaluation?.date ? grade.evaluation.date.toISOString().split('T')[0] : grade.createdAt.toISOString().split('T')[0],
      student: {
        id: grade.student.id,
        firstName: grade.student.firstName,
        lastName: grade.student.lastName,
        class: grade.student.class ? {
          id: grade.student.class.id,
          name: grade.student.class.name,
        } : null,
      },
      subject: grade.evaluation?.competency?.subject ? {
        id: grade.evaluation.competency.subject.id,
        name: grade.evaluation.competency.subject.name,
      } : null,
      evaluation: grade.evaluation ? {
        id: grade.evaluation.id,
        name: grade.evaluation.name,
        type: grade.evaluation.type,
      } : null,
    });
  } catch (err) {
    console.error('getGradeById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la note' });
  }
};

/**
 * Crée une nouvelle note
 */
export const createGrade = async (req, res) => {
  try {
    const { studentId, evaluationId, score, evaluationText, teacherComments } = req.body;

    if (!studentId || !evaluationId) {
      return res.status(400).json({ error: 'Les champs studentId et evaluationId sont requis' });
    }

    // Vérifier que l'élève existe
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    // Vérifier que l'évaluation existe
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: parseInt(evaluationId) },
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    // Vérifier si une note existe déjà pour cet élève et cette évaluation
    const existingGrade = await prisma.grade.findFirst({
      where: {
        studentId: parseInt(studentId),
        evaluationId: parseInt(evaluationId),
      },
    });

    if (existingGrade) {
      return res.status(400).json({ error: 'Une note existe déjà pour cet élève et cette évaluation' });
    }

    // Score sur 10 (saisie enseignant)
    let scoreValue = null;
    if (score !== undefined && score !== null) {
      scoreValue = parseFloat(score);
      if (scoreValue < 0 || scoreValue > 10) {
        return res.status(400).json({ error: 'La note doit être entre 0 et 10' });
      }
    }

    const grade = await prisma.grade.create({
      data: {
        studentId: parseInt(studentId),
        evaluationId: parseInt(evaluationId),
        score: scoreValue,
        evaluationText: evaluationText || null,
        teacherComments: teacherComments || null,
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        evaluation: {
          include: {
            competency: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      id: grade.id,
      studentId: grade.studentId,
      subjectId: grade.evaluation?.competency?.subjectId || null,
      evaluationId: grade.evaluationId,
      grade: grade.score,
      score: grade.score,
      evaluationText: grade.evaluationText,
      teacherComments: grade.teacherComments,
      status: grade.status?.toLowerCase() || 'pending',
      date: grade.evaluation?.date ? grade.evaluation.date.toISOString().split('T')[0] : grade.createdAt.toISOString().split('T')[0],
      student: {
        id: grade.student.id,
        firstName: grade.student.firstName,
        lastName: grade.student.lastName,
        class: grade.student.class ? {
          id: grade.student.class.id,
          name: grade.student.class.name,
        } : null,
      },
      subject: grade.evaluation?.competency?.subject ? {
        id: grade.evaluation.competency.subject.id,
        name: grade.evaluation.competency.subject.name,
      } : null,
    });
  } catch (err) {
    console.error('createGrade error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Une note similaire existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la note' });
  }
};

/**
 * Met à jour une note
 */
export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, evaluationText, teacherComments, coefficient } = req.body;

    const existingGrade = await prisma.grade.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingGrade) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }

    const updateData = {};

    // Score sur 10
    if (score !== undefined && score !== null) {
      const scoreValue = parseFloat(score);
      if (scoreValue < 0 || scoreValue > 10) {
        return res.status(400).json({ error: 'La note doit être entre 0 et 10' });
      }
      updateData.score = scoreValue;
    }

    if (evaluationText !== undefined) {
      updateData.evaluationText = evaluationText;
    }

    if (teacherComments !== undefined) {
      updateData.teacherComments = teacherComments;
    }

    const grade = await prisma.grade.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        student: {
          include: {
            class: true,
          },
        },
        evaluation: {
          include: {
            competency: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    res.json({
      id: grade.id,
      studentId: grade.studentId,
      subjectId: grade.evaluation?.competency?.subjectId || null,
      evaluationId: grade.evaluationId,
      grade: grade.score,
      score: grade.score,
      evaluationText: grade.evaluationText,
      teacherComments: grade.teacherComments,
      coefficient: coefficient || 1,
      status: grade.status?.toLowerCase() || 'pending',
      date: grade.evaluation?.date ? grade.evaluation.date.toISOString().split('T')[0] : grade.createdAt.toISOString().split('T')[0],
      student: {
        id: grade.student.id,
        firstName: grade.student.firstName,
        lastName: grade.student.lastName,
        class: grade.student.class ? {
          id: grade.student.class.id,
          name: grade.student.class.name,
        } : null,
      },
      subject: grade.evaluation?.competency?.subject ? {
        id: grade.evaluation.competency.subject.id,
        name: grade.evaluation.competency.subject.name,
      } : null,
    });
  } catch (err) {
    console.error('updateGrade error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la note' });
  }
};

/**
 * Supprime une note
 */
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.grade.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Note supprimée avec succès' });
  } catch (err) {
    console.error('deleteGrade error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression de la note' });
  }
};

/**
 * Valide une note (status → VALIDATED, visible par les parents)
 */
export const validateGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.update({
      where: { id: parseInt(id) },
      data: { status: 'VALIDATED' },
    });

    res.json({ message: 'Note validée avec succès', grade });
  } catch (err) {
    console.error('validateGrade error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors de la validation de la note' });
  }
};

/**
 * Rejette une note (status → REJECTED)
 */
export const rejectGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' },
    });

    res.json({ message: 'Note rejetée', grade });
  } catch (err) {
    console.error('rejectGrade error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors du rejet de la note' });
  }
};

/**
 * Enregistre les notes en masse depuis la structure Domaines/Compétences
 */
export const createBulkGrades = async (req, res) => {
  try {
    const { classId, domainsConfig, studentsData, palierName, academicYearName } = req.body;

    if (!classId || !domainsConfig || !studentsData || !palierName || !academicYearName) {
      return res.status(400).json({ 
        error: 'Les champs classId, domainsConfig, studentsData, palierName et academicYearName sont requis' 
      });
    }

    // Récupérer ou créer l'année académique
    let academicYear = await prisma.academicYear.findFirst({
      where: { name: academicYearName },
    });

    if (!academicYear) {
      const now = new Date();
      academicYear = await prisma.academicYear.create({
        data: {
          name: academicYearName,
          startDate: new Date(now.getFullYear(), 8, 1), // 1er septembre
          endDate: new Date(now.getFullYear() + 1, 5, 30), // 30 juin
          isActive: true,
        },
      });
    }

    // Récupérer ou créer le palier
    const now = new Date();
    let palier = await prisma.palier.findFirst({
      where: {
        name: palierName,
        academicYearId: academicYear.id,
      },
    });

    if (!palier) {
      palier = await prisma.palier.create({
        data: {
          name: palierName,
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          academicYearId: academicYear.id,
        },
      });
    }

    const createdGrades = [];
    const errors = [];

    // Parcourir chaque domaine
    for (const domain of domainsConfig) {
      // Créer ou récupérer la matière (subject) pour ce domaine
      let subject = await prisma.subject.findFirst({
        where: { name: domain.label.toUpperCase() },
      });

      if (!subject) {
        subject = await prisma.subject.create({
          data: { name: domain.label.toUpperCase() },
        });
      }

      // Parcourir chaque bloc de compétences
      for (const cb of domain.competencyBlocks) {
        // Créer ou récupérer la compétence
        const competencyName = `${domain.code} - ${cb.name}`;
        let competency = await prisma.competency.findFirst({
          where: {
            name: competencyName,
            subjectId: subject.id,
          },
        });

        if (!competency) {
          competency = await prisma.competency.create({
            data: {
              name: competencyName,
              subjectId: subject.id,
            },
          });
        }

        // Parcourir chaque activité
        for (const activity of cb.activities) {
          // Créer ou récupérer l'évaluation pour cette activité
          const evaluationName = `${activity} - ${cb.name} - ${domain.label}`;
          let evaluation = await prisma.evaluation.findFirst({
            where: {
              name: evaluationName,
              competencyId: competency.id,
              palierId: palier.id,
            },
          });

          if (!evaluation) {
            evaluation = await prisma.evaluation.create({
              data: {
                name: evaluationName,
                palierId: palier.id,
                competencyId: competency.id,
                date: new Date(),
                type: 'NUMERIC', // Notes numériques sur 10
              },
            });
          }

          // Parcourir chaque élève et créer/mettre à jour sa note
          for (const studentData of studentsData) {
            const noteKey = `${domain.code}-${cb.name}-${activity}`;
            const noteValue = studentData.notes[noteKey];

            if (noteValue !== null && noteValue !== undefined) {
              try {
                // Vérifier si une note existe déjà
                const existingGrade = await prisma.grade.findFirst({
                  where: {
                    studentId: studentData.id,
                    evaluationId: evaluation.id,
                  },
                });

                if (existingGrade) {
                  // Mettre à jour la note existante
                  const updatedGrade = await prisma.grade.update({
                    where: { id: existingGrade.id },
                    data: {
                      score: parseFloat(noteValue), // Déjà sur 10 dans RemplitNote
                    },
                  });
                  createdGrades.push(updatedGrade);
                } else {
                  // Créer une nouvelle note
                  const newGrade = await prisma.grade.create({
                    data: {
                      studentId: studentData.id,
                      evaluationId: evaluation.id,
                      score: parseFloat(noteValue), // Déjà sur 10 dans RemplitNote
                    },
                  });
                  createdGrades.push(newGrade);
                }
              } catch (err) {
                errors.push({
                  student: `${studentData.firstName} ${studentData.lastName}`,
                  activity,
                  error: err.message,
                });
              }
            }
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdGrades.length} note(s) enregistrée(s) avec succès`,
      created: createdGrades.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('createBulkGrades error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement des notes' });
  }
};

/**
 * Valide toutes les notes en attente (status PENDING → VALIDATED)
 */
export const validateAllPendingGrades = async (req, res) => {
  try {
    const result = await prisma.grade.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'VALIDATED' },
    });
    res.json({
      message: 'Toutes les notes en attente ont été validées',
      count: result.count,
    });
  } catch (err) {
    console.error('validateAllPendingGrades error:', err);
    res.status(500).json({ error: 'Erreur lors de la validation des notes' });
  }
};

/**
 * Notifie l'enseignant de la classe (titulaire) pour lui demander de corriger une note.
 * Utilise Class.teacherId car les notes sont saisies par l'enseignant de la classe sur RemplitNote,
 * sans lien matière en base (domaines/compétences/activités).
 */
export const notifyTeacherForGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: { class: true },
        },
        evaluation: {
          include: {
            competency: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!grade) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }

    const classId = grade.student?.classId;
    const teacherId = grade.student?.class?.teacherId;

    if (!classId) {
      return res.status(400).json({
        error: 'Impossible de déterminer la classe de l\'élève pour cette note.',
      });
    }

    if (!teacherId) {
      return res.status(404).json({
        error: 'Aucun enseignant assigné à cette classe.',
      });
    }

    const studentName = grade.student
      ? `${grade.student.firstName} ${grade.student.lastName}`
      : 'l\'élève';
    const className = grade.student?.class?.name || 'cette classe';
    const subjectName = grade.evaluation?.competency?.subject?.name || null;
    const detail = subjectName ? `${studentName} (${subjectName})` : `${studentName} - ${className}`;
    const customMessage =
      message && String(message).trim()
        ? String(message).trim()
        : `Veuillez vérifier ou corriger la note de ${detail}.`;

    await createNotification(
      teacherId,
      'GRADE',
      'Correction de note demandée',
      customMessage,
      grade.id,
      {
        gradeId: grade.id,
        studentId: grade.studentId,
        classId,
      }
    );

    res.json({
      message: 'Notification envoyée à l\'enseignant de la classe avec succès',
      teacherId,
    });
  } catch (err) {
    console.error('notifyTeacherForGrade error:', err);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de la notification à l\'enseignant',
    });
  }
};



