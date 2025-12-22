import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Statistiques pour le dashboard Admin
 */
export const getAdminStats = async (req, res) => {
  try {
    const [students, classes, teachers, payments] = await Promise.all([
      prisma.student.count(),
      prisma.class.count(),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.payment.findMany({
        where: { status: 'PENDING' },
      }),
    ]);

    const pendingPaymentsCount = payments.length;
    const pendingPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      students,
      classes,
      teachers,
      pendingPayments: {
        count: pendingPaymentsCount,
        amount: Math.round(pendingPaymentsAmount),
      },
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

/**
 * Statistiques pour le dashboard Super Admin
 */
export const getSuperAdminStats = async (req, res) => {
  try {
    const [admins, teachers, parents, students] = await Promise.all([
      prisma.user.count({
        where: {
          role: { in: ['ADMINISTRATION', 'SUPER_ADMIN'] },
        },
      }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.student.count(),
    ]);

    res.json({
      admins,
      teachers,
      parents,
      students,
    });
  } catch (err) {
    console.error('getSuperAdminStats error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

/**
 * Statistiques pour le dashboard Teacher
 */
export const getTeacherStats = async (req, res) => {
  try {
    const user = req.user;

    // Récupérer les classes de l'enseignant
    const classes = await prisma.class.findMany({
      where: {
        OR: [
          { teacherId: user.id },
          {
            classSubjects: {
              some: {
                teacherId: user.id,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    const totalStudents = classes.reduce((sum, c) => sum + (c._count?.students || 0), 0);

    // Récupérer les devoirs récents
    const recentAssignments = await prisma.assignment.findMany({
      where: {
        teacherId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        class: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      classes: classes.length,
      students: totalStudents,
      recentAssignments,
    });
  } catch (err) {
    console.error('getTeacherStats error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

