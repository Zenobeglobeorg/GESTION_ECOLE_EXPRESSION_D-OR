import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère un bulletin par ID
 */
export const getBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    const bulletin = await prisma.bulletin.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: {
            class: true,
            parent: true,
          },
        },
      },
    });

    if (!bulletin) {
      return res.status(404).json({ error: 'Bulletin non trouvé' });
    }

    // Vérifier les permissions
    const user = req.user;
    if (user.role === 'PARENT' && bulletin.student.parentId !== user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(bulletin);
  } catch (error) {
    console.error('Erreur lors de la récupération du bulletin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Récupère les bulletins d'un élève
 */
export const getStudentBulletins = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;
    const user = req.user;

    console.log(`[BulletinController] Récupération des bulletins pour l'élève ${studentId} par l'utilisateur ${user.id} (rôle: ${user.role})`);

    const where = {
      studentId: parseInt(studentId),
    };

    if (academicYear) {
      where.academicYear = academicYear;
    }

    // Vérifier les permissions pour les parents AVANT de récupérer les bulletins
    if (user.role === 'PARENT') {
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
      });
      
      console.log(`[BulletinController] Vérification parent - Élève trouvé:`, student ? `Oui (parentId: ${student.parentId}, userId: ${user.id})` : 'Non');
      
      if (!student) {
        console.log(`[BulletinController] Élève ${studentId} non trouvé`);
        return res.status(404).json({ error: 'Élève non trouvé' });
      }
      
      if (student.parentId !== user.id) {
        console.log(`[BulletinController] Accès refusé - parentId (${student.parentId}) !== userId (${user.id})`);
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
    }

    console.log(`[BulletinController] Recherche des bulletins avec where:`, JSON.stringify(where));

    const bulletins = await prisma.bulletin.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[BulletinController] Bulletins trouvés en base: ${bulletins.length}`);
    if (bulletins.length > 0) {
      bulletins.forEach((b, index) => {
        console.log(`[BulletinController] Bulletin ${index + 1}: id=${b.id}, studentId=${b.studentId}, isPublished=${b.isPublished}, type=${b.type}, academicYear=${b.academicYear}`);
      });
    } else {
      // Vérifier si des bulletins existent pour cet élève sans filtre
      const allBulletinsForStudent = await prisma.bulletin.findMany({
        where: { studentId: parseInt(studentId) },
      });
      console.log(`[BulletinController] Vérification: Total bulletins pour cet élève (sans filtre): ${allBulletinsForStudent.length}`);
      if (allBulletinsForStudent.length > 0) {
        allBulletinsForStudent.forEach((b, index) => {
          console.log(`[BulletinController] Bulletin non filtré ${index + 1}: id=${b.id}, studentId=${b.studentId}, isPublished=${b.isPublished}, type=${b.type}, academicYear=${b.academicYear}`);
        });
      }
    }

    // Vérifier les permissions
    if (user.role === 'PARENT') {
      // Filtrer pour ne montrer que les bulletins publiés
      const publishedBulletins = bulletins.filter((b) => b.isPublished);
      console.log(`[BulletinController] Parent ${user.id} - Total bulletins trouvés: ${bulletins.length}, Publiés: ${publishedBulletins.length}`);
      return res.json(publishedBulletins);
    }

    res.json(bulletins);
  } catch (error) {
    console.error('Erreur lors de la récupération des bulletins:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Crée un nouveau bulletin
 */
export const createBulletin = async (req, res) => {
  try {
    const { studentId, academicYear, type, data, isPublished } = req.body;
    const user = req.user;

    // Vérifier que l'utilisateur a les droits (ADMINISTRATION ou SUPER_ADMIN)
    if (user.role !== 'ADMINISTRATION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Vérifier que l'élève existe
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    // Créer ou mettre à jour le bulletin
    const bulletin = await prisma.bulletin.upsert({
      where: {
        studentId_academicYear_type: {
          studentId: parseInt(studentId),
          academicYear,
          type,
        },
      },
      update: {
        data,
        isPublished: isPublished || false,
        updatedAt: new Date(),
      },
      create: {
        studentId: parseInt(studentId),
        academicYear,
        type,
        data,
        isPublished: isPublished || false,
        createdById: user.id,
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });

    res.status(201).json(bulletin);
  } catch (error) {
    console.error('Erreur lors de la création du bulletin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Met à jour un bulletin
 */
export const updateBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, isPublished } = req.body;
    const user = req.user;

    // Vérifier que l'utilisateur a les droits
    if (user.role !== 'ADMINISTRATION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const bulletin = await prisma.bulletin.findUnique({
      where: { id: parseInt(id) },
    });

    if (!bulletin) {
      return res.status(404).json({ error: 'Bulletin non trouvé' });
    }

    const updated = await prisma.bulletin.update({
      where: { id: parseInt(id) },
      data: {
        ...(data !== undefined && { data }),
        ...(isPublished !== undefined && { isPublished }),
        updatedAt: new Date(),
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bulletin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Supprime un bulletin
 */
export const deleteBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Vérifier que l'utilisateur a les droits
    if (user.role !== 'ADMINISTRATION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const bulletin = await prisma.bulletin.findUnique({
      where: { id: parseInt(id) },
    });

    if (!bulletin) {
      return res.status(404).json({ error: 'Bulletin non trouvé' });
    }

    await prisma.bulletin.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du bulletin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Publie un bulletin (le rend visible aux parents)
 */
export const publishBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Vérifier que l'utilisateur a les droits
    if (user.role !== 'ADMINISTRATION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const bulletin = await prisma.bulletin.update({
      where: { id: parseInt(id) },
      data: {
        isPublished: true,
        updatedAt: new Date(),
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });

    console.log(`[BulletinController] Bulletin ${id} publié par l'utilisateur ${user.id}`);
    res.json(bulletin);
  } catch (error) {
    console.error('Erreur lors de la publication du bulletin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Dépublie un bulletin (le rend invisible aux parents)
 */
export const unpublishBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Vérifier que l'utilisateur a les droits
    if (user.role !== 'ADMINISTRATION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const bulletin = await prisma.bulletin.update({
      where: { id: parseInt(id) },
      data: {
        isPublished: false,
        updatedAt: new Date(),
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });

    console.log(`[BulletinController] Bulletin ${id} dépublié par l'utilisateur ${user.id}`);
    res.json(bulletin);
  } catch (error) {
    console.error('Erreur lors de la dépublication du bulletin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
