import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

/**
 * Récupère toutes les évaluations
 */
export const listEvaluations = async (req, res) => {
  try {
    const { classId, subjectId, date } = req.query;

    const where = {};
    if (classId) {
      where.palier = {
        academicYear: {
          isActive: true,
        },
      };
    }
    if (date) {
      where.date = {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      };
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        palier: {
          include: {
            academicYear: true,
          },
        },
        competency: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Transformer les données pour correspondre à l'interface frontend
    const transformed = evaluations.map(evaluation => ({
      id: evaluation.id,
      name: evaluation.name,
      type: evaluation.type,
      classId: evaluation.palier?.academicYearId || null, // Approximation
      subjectId: evaluation.competency?.subjectId || null,
      date: evaluation.date.toISOString().split('T')[0],
      coefficient: 1, // Par défaut, peut être ajouté au modèle plus tard
      description: null,
      notifyParents: false,
      competency: evaluation.competency,
      subject: evaluation.competency?.subject,
    }));

    res.json(transformed);
  } catch (err) {
    console.error('listEvaluations error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des évaluations' });
  }
};

/**
 * Récupère une évaluation par ID
 */
export const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: parseInt(id) },
      include: {
        palier: {
          include: {
            academicYear: true,
          },
        },
        competency: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    res.json({
      id: evaluation.id,
      name: evaluation.name,
      type: evaluation.type,
      classId: evaluation.palier?.academicYearId || null,
      subjectId: evaluation.competency?.subjectId || null,
      date: evaluation.date.toISOString().split('T')[0],
      coefficient: 1,
      description: null,
      notifyParents: false,
      competency: evaluation.competency,
      subject: evaluation.competency?.subject,
    });
  } catch (err) {
    console.error('getEvaluationById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évaluation' });
  }
};

/**
 * Crée une nouvelle évaluation
 * Note: Pour simplifier, on crée un palier et une compétence si nécessaire
 */
export const createEvaluation = async (req, res) => {
  try {
    const { name, type, classId, subjectId, date, coefficient, description, notifyParents } = req.body;

    if (!name || !type || !date) {
      return res.status(400).json({ error: 'Les champs name, type et date sont requis' });
    }

    // Récupérer ou créer une année académique active
    let academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      const currentYear = new Date().getFullYear();
      academicYear = await prisma.academicYear.create({
        data: {
          name: `${currentYear}-${currentYear + 1}`,
          startDate: new Date(currentYear, 8, 1), // 1er septembre
          endDate: new Date(currentYear + 1, 6, 30), // 30 juin
          isActive: true,
        },
      });
    }

    // Récupérer ou créer un palier pour le mois actuel
    const evalDate = new Date(date);
    const monthName = evalDate.toLocaleString('fr-FR', { month: 'long' });
    let palier = await prisma.palier.findFirst({
      where: {
        academicYearId: academicYear.id,
        name: { contains: monthName },
      },
    });

    if (!palier) {
      const startOfMonth = new Date(evalDate.getFullYear(), evalDate.getMonth(), 1);
      const endOfMonth = new Date(evalDate.getFullYear(), evalDate.getMonth() + 1, 0);
      palier = await prisma.palier.create({
        data: {
          name: `Palier - ${monthName}`,
          startDate: startOfMonth,
          endDate: endOfMonth,
          academicYearId: academicYear.id,
        },
      });
    }

    // Récupérer ou créer une matière si subjectId est fourni
    let subject = null;
    if (subjectId) {
      subject = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) },
      });
    }

    // Créer une compétence par défaut si nécessaire
    let competency;
    if (subject) {
      competency = await prisma.competency.findFirst({
        where: { subjectId: subject.id },
      });

      if (!competency) {
        competency = await prisma.competency.create({
          data: {
            name: 'Compétence générale',
            subjectId: subject.id,
          },
        });
      }
    } else {
      // Créer une compétence sans matière
      const defaultSubject = await prisma.subject.findFirst();
      if (defaultSubject) {
        competency = await prisma.competency.findFirst({
          where: { subjectId: defaultSubject.id },
        });
        if (!competency) {
          competency = await prisma.competency.create({
            data: {
              name: 'Compétence générale',
              subjectId: defaultSubject.id,
            },
          });
        }
      } else {
        return res.status(400).json({ error: 'Aucune matière disponible. Veuillez d\'abord créer des matières.' });
      }
    }

    // Convertir le type de l'évaluation
    let evaluationType = 'NUMERIC';
    if (type === 'devoir' || type === 'examen') {
      evaluationType = 'NUMERIC';
    } else if (type === 'interrogation') {
      evaluationType = 'NUMERIC';
    } else if (type === 'tp') {
      evaluationType = 'ACQUIRED';
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        name,
        palierId: palier.id,
        competencyId: competency.id,
        date: new Date(date),
        type: evaluationType,
      },
      include: {
        palier: {
          include: {
            academicYear: true,
          },
        },
        competency: {
          include: {
            subject: true,
          },
        },
      },
    });

    res.status(201).json({
      id: evaluation.id,
      name: evaluation.name,
      type: type, // Retourner le type original
      classId: classId || null,
      subjectId: evaluation.competency?.subjectId || null,
      date: evaluation.date.toISOString().split('T')[0],
      coefficient: coefficient || 1,
      description: description || null,
      notifyParents: notifyParents || false,
      subject: evaluation.competency?.subject,
    });
  } catch (err) {
    console.error('createEvaluation error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Une évaluation similaire existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de l\'évaluation' });
  }
};

/**
 * Met à jour une évaluation
 */
export const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, classId, subjectId, date, coefficient, description, notifyParents } = req.body;

    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingEvaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    // Convertir le type
    let evaluationType = existingEvaluation.type;
    if (type) {
      if (type === 'devoir' || type === 'examen' || type === 'interrogation') {
        evaluationType = 'NUMERIC';
      } else if (type === 'tp') {
        evaluationType = 'ACQUIRED';
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(date && { date: new Date(date) }),
      ...(evaluationType && { type: evaluationType }),
    };

    // Si subjectId change, mettre à jour la compétence
    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) },
      });

      if (subject) {
        let competency = await prisma.competency.findFirst({
          where: { subjectId: subject.id },
        });

        if (!competency) {
          competency = await prisma.competency.create({
            data: {
              name: 'Compétence générale',
              subjectId: subject.id,
            },
          });
        }

        updateData.competencyId = competency.id;
      }
    }

    const evaluation = await prisma.evaluation.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        palier: {
          include: {
            academicYear: true,
          },
        },
        competency: {
          include: {
            subject: true,
          },
        },
      },
    });

    res.json({
      id: evaluation.id,
      name: evaluation.name,
      type: type || 'devoir',
      classId: classId || null,
      subjectId: evaluation.competency?.subjectId || null,
      date: evaluation.date.toISOString().split('T')[0],
      coefficient: coefficient || 1,
      description: description || null,
      notifyParents: notifyParents || false,
      subject: evaluation.competency?.subject,
    });
  } catch (err) {
    console.error('updateEvaluation error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'évaluation' });
  }
};

/**
 * Supprime une évaluation
 */
export const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.evaluation.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Évaluation supprimée avec succès' });
  } catch (err) {
    console.error('deleteEvaluation error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Impossible de supprimer cette évaluation car elle contient des notes' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'évaluation' });
  }
};

