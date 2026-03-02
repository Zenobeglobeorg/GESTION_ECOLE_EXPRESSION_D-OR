import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

/**
 * Génère les données d'un rapport selon le type et la plage de dates.
 * POST body: { reportType, startDate, endDate, scope? }
 * Retourne des données JSON pour affichage / export PDF côté client.
 */
export const getReportData = async (req, res) => {
  try {
    const { reportType, startDate, endDate, scope = 'all' } = req.body;

    if (!reportType) {
      return res.status(400).json({ error: 'Le type de rapport est requis.' });
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    let title = '';
    let data = [];

    switch (reportType) {
      case 'attendance': {
        title = 'Rapport des présences';
        const where = {};
        if (start && end) {
          where.date = { gte: start, lte: end };
        } else if (start) {
          where.date = { gte: start };
        } else if (end) {
          where.date = { lte: end };
        }
        const attendances = await prisma.attendance.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                class: { select: { name: true } },
              },
            },
            class: { select: { id: true, name: true } },
          },
          orderBy: [{ date: 'desc' }, { student: { lastName: 'asc' } }],
        });
        data = attendances.map((a) => ({
          date: a.date.toISOString().split('T')[0],
          élève: `${a.student?.firstName || ''} ${a.student?.lastName || ''}`.trim(),
          classe: a.class?.name || '-',
          statut: a.status,
          heureArrivée: a.arrivalTime || '-',
          commentaire: a.comment || '-',
        }));
        break;
      }

      case 'grades': {
        title = 'Rapport des notes';
        const where = {};
        if (start && end) {
          where.evaluation = { date: { gte: start, lte: end } };
        } else if (start) {
          where.evaluation = { date: { gte: start } };
        } else if (end) {
          where.evaluation = { date: { lte: end } };
        }
        const grades = await prisma.grade.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                class: { select: { name: true } },
              },
            },
            evaluation: {
              select: {
                name: true,
                date: true,
                competency: { select: { subject: { select: { name: true } } } },
              },
            },
          },
          orderBy: { evaluation: { date: 'desc' } },
        });
        data = grades.map((g) => ({
          date: g.evaluation?.date?.toISOString().split('T')[0] || '-',
          élève: `${g.student?.firstName || ''} ${g.student?.lastName || ''}`.trim(),
          classe: g.student?.class?.name || '-',
          matière: g.evaluation?.competency?.subject?.name || g.evaluation?.name || '-',
          note: g.score != null ? g.score : g.evaluationText || '-',
          statut: g.status,
        }));
        break;
      }

      case 'fees': {
        title = 'Rapport des paiements / frais';
        const where = {};
        if (start && end) {
          where.dueDate = { gte: start, lte: end };
        } else if (start) {
          where.dueDate = { gte: start };
        } else if (end) {
          where.dueDate = { lte: end };
        }
        const payments = await prisma.payment.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                parent: { select: { email: true } },
              },
            },
          },
          orderBy: [{ dueDate: 'desc' }],
        });
        data = payments.map((p) => ({
          échéance: p.dueDate.toISOString().split('T')[0],
          élève: `${p.student?.firstName || ''} ${p.student?.lastName || ''}`.trim(),
          montant: p.amount,
          payéLe: p.paidDate ? p.paidDate.toISOString().split('T')[0] : '-',
          statut: p.status,
          tranche: p.installmentNumber,
        }));
        break;
      }

      case 'teachers': {
        title = 'Rapport des enseignants';
        const where = { role: 'TEACHER' };
        if (start && end) {
          where.createdAt = { gte: start, lte: end };
        } else if (start) {
          where.createdAt = { gte: start };
        } else if (end) {
          where.createdAt = { lte: end };
        }
        const teachers = await prisma.user.findMany({
          where,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            teacherLevel: true,
            teacherStatus: true,
            employmentStartDate: true,
            createdAt: true,
          },
          orderBy: [{ lastName: 'asc' }],
        });
        data = teachers.map((t) => ({
          nom: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
          email: t.email,
          niveau: t.teacherLevel || '-',
          statut: t.teacherStatus || '-',
          début: t.employmentStartDate ? t.employmentStartDate.toISOString().split('T')[0] : '-',
        }));
        break;
      }

      case 'students': {
        title = 'Rapport des élèves (inscriptions / profils)';
        const where = {};
        if (start && end) {
          where.enrollmentDate = { gte: start, lte: end };
        } else if (start) {
          where.enrollmentDate = { gte: start };
        } else if (end) {
          where.enrollmentDate = { lte: end };
        }
        const students = await prisma.student.findMany({
          where,
          include: {
            class: { select: { name: true, level: true } },
            parent: { select: { firstName: true, lastName: true, email: true } },
          },
          orderBy: [{ lastName: 'asc' }],
        });
        data = students.map((s) => ({
          nom: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          classe: s.class?.name || '-',
          niveau: s.class?.level || '-',
          dateInscription: s.enrollmentDate?.toISOString().split('T')[0] || '-',
          parent: s.parent ? `${s.parent.firstName || ''} ${s.parent.lastName || ''}`.trim() : '-',
        }));
        break;
      }

      case 'discipline': {
        title = 'Rapport discipline';
        data = [];
        break;
      }

      default:
        return res.status(400).json({ error: 'Type de rapport non reconnu.' });
    }

    res.json({
      reportType,
      title,
      startDate: start?.toISOString().split('T')[0] || null,
      endDate: end?.toISOString().split('T')[0] || null,
      scope,
      generatedAt: new Date().toISOString(),
      count: data.length,
      data,
    });
  } catch (err) {
    console.error('getReportData error:', err);
    res.status(500).json({ error: 'Erreur lors de la génération des données du rapport.', details: err.message });
  }
};
