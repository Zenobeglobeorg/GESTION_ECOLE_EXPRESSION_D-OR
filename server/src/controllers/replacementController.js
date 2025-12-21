import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère tous les remplacements
 */
export const listReplacements = async (req, res) => {
  try {
    const { status, teacherId } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (teacherId) {
      where.OR = [
        { absentTeacherId: parseInt(teacherId) },
        { replacementTeacherId: parseInt(teacherId) },
      ];
    }

    const replacements = await prisma.replacement.findMany({
      where,
      include: {
        absentTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replacementTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(replacements);
  } catch (err) {
    console.error('listReplacements error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des remplacements' });
  }
};

/**
 * Récupère un remplacement par ID
 */
export const getReplacementById = async (req, res) => {
  try {
    const { id } = req.params;

    const replacement = await prisma.replacement.findUnique({
      where: { id: parseInt(id) },
      include: {
        absentTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replacementTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!replacement) {
      return res.status(404).json({ error: 'Remplacement non trouvé' });
    }

    res.json(replacement);
  } catch (err) {
    console.error('getReplacementById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du remplacement' });
  }
};

/**
 * Crée un nouveau remplacement
 */
export const createReplacement = async (req, res) => {
  try {
    const { absentTeacherId, replacementTeacherId, startDate, endDate, reason, notes } = req.body;

    if (!absentTeacherId || !replacementTeacherId || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Tous les champs sont requis (absentTeacherId, replacementTeacherId, startDate, endDate, reason)' });
    }

    // Vérifier que les deux enseignants existent et ont le rôle TEACHER
    const [absentTeacher, replacementTeacher] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: parseInt(absentTeacherId),
          role: 'TEACHER',
        },
      }),
      prisma.user.findFirst({
        where: {
          id: parseInt(replacementTeacherId),
          role: 'TEACHER',
        },
      }),
    ]);

    if (!absentTeacher) {
      return res.status(404).json({ error: 'Enseignant absent non trouvé ou n\'a pas le rôle TEACHER' });
    }

    if (!replacementTeacher) {
      return res.status(404).json({ error: 'Enseignant remplaçant non trouvé ou n\'a pas le rôle TEACHER' });
    }

    if (absentTeacherId === replacementTeacherId) {
      return res.status(400).json({ error: 'L\'enseignant absent et le remplaçant ne peuvent pas être la même personne' });
    }

    // Vérifier que la date de fin est après la date de début
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ error: 'La date de fin doit être après la date de début' });
    }

    // Vérifier s'il y a des chevauchements avec d'autres remplacements actifs
    const overlappingReplacement = await prisma.replacement.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [
          {
            absentTeacherId: parseInt(absentTeacherId),
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } },
            ],
          },
          {
            replacementTeacherId: parseInt(replacementTeacherId),
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } },
            ],
          },
        ],
      },
    });

    if (overlappingReplacement) {
      return res.status(400).json({ 
        error: 'Un remplacement actif existe déjà pour cette période pour l\'un des enseignants' 
      });
    }

    const replacement = await prisma.replacement.create({
      data: {
        absentTeacherId: parseInt(absentTeacherId),
        replacementTeacherId: parseInt(replacementTeacherId),
        startDate: start,
        endDate: end,
        reason: reason.toUpperCase(),
        notes: notes || null,
        status: 'ACTIVE',
      },
      include: {
        absentTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replacementTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(replacement);
  } catch (err) {
    console.error('createReplacement error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Un remplacement similaire existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création du remplacement' });
  }
};

/**
 * Met à jour un remplacement
 */
export const updateReplacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { absentTeacherId, replacementTeacherId, startDate, endDate, reason, notes, status } = req.body;

    // Vérifier que le remplacement existe
    const existingReplacement = await prisma.replacement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReplacement) {
      return res.status(404).json({ error: 'Remplacement non trouvé' });
    }

    // Vérifier que les enseignants existent (si fournis)
    if (absentTeacherId) {
      const absentTeacher = await prisma.user.findFirst({
        where: {
          id: parseInt(absentTeacherId),
          role: 'TEACHER',
        },
      });

      if (!absentTeacher) {
        return res.status(404).json({ error: 'Enseignant absent non trouvé ou n\'a pas le rôle TEACHER' });
      }
    }

    if (replacementTeacherId) {
      const replacementTeacher = await prisma.user.findFirst({
        where: {
          id: parseInt(replacementTeacherId),
          role: 'TEACHER',
        },
      });

      if (!replacementTeacher) {
        return res.status(404).json({ error: 'Enseignant remplaçant non trouvé ou n\'a pas le rôle TEACHER' });
      }
    }

    // Vérifier que l'enseignant absent et le remplaçant ne sont pas la même personne
    const finalAbsentTeacherId = absentTeacherId ? parseInt(absentTeacherId) : existingReplacement.absentTeacherId;
    const finalReplacementTeacherId = replacementTeacherId ? parseInt(replacementTeacherId) : existingReplacement.replacementTeacherId;

    if (finalAbsentTeacherId === finalReplacementTeacherId) {
      return res.status(400).json({ error: 'L\'enseignant absent et le remplaçant ne peuvent pas être la même personne' });
    }

    // Vérifier les dates (si fournies)
    const finalStartDate = startDate ? new Date(startDate) : existingReplacement.startDate;
    const finalEndDate = endDate ? new Date(endDate) : existingReplacement.endDate;

    if (finalEndDate < finalStartDate) {
      return res.status(400).json({ error: 'La date de fin doit être après la date de début' });
    }

    // Vérifier les chevauchements (si les dates ou enseignants changent)
    if (absentTeacherId || replacementTeacherId || startDate || endDate) {
      const overlappingReplacement = await prisma.replacement.findFirst({
        where: {
          id: { not: parseInt(id) },
          status: 'ACTIVE',
          OR: [
            {
              absentTeacherId: finalAbsentTeacherId,
              AND: [
                { startDate: { lte: finalEndDate } },
                { endDate: { gte: finalStartDate } },
              ],
            },
            {
              replacementTeacherId: finalReplacementTeacherId,
              AND: [
                { startDate: { lte: finalEndDate } },
                { endDate: { gte: finalStartDate } },
              ],
            },
          ],
        },
      });

      if (overlappingReplacement) {
        return res.status(400).json({ 
          error: 'Un remplacement actif existe déjà pour cette période pour l\'un des enseignants' 
        });
      }
    }

    const replacement = await prisma.replacement.update({
      where: { id: parseInt(id) },
      data: {
        ...(absentTeacherId && { absentTeacherId: parseInt(absentTeacherId) }),
        ...(replacementTeacherId && { replacementTeacherId: parseInt(replacementTeacherId) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(reason && { reason: reason.toUpperCase() }),
        ...(notes !== undefined && { notes }),
        ...(status && { status: status.toUpperCase() }),
      },
      include: {
        absentTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replacementTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(replacement);
  } catch (err) {
    console.error('updateReplacement error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Remplacement non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour du remplacement' });
  }
};

/**
 * Supprime un remplacement
 */
export const deleteReplacement = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.replacement.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Remplacement supprimé avec succès' });
  } catch (err) {
    console.error('deleteReplacement error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Remplacement non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression du remplacement' });
  }
};

/**
 * Met à jour automatiquement le statut des remplacements (marquer comme COMPLETED si la date de fin est passée)
 */
export const updateReplacementStatuses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updated = await prisma.replacement.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: today },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    res.json({ 
      message: `${updated.count} remplacement(s) marqué(s) comme terminé(s)`,
      count: updated.count,
    });
  } catch (err) {
    console.error('updateReplacementStatuses error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des statuts' });
  }
};

