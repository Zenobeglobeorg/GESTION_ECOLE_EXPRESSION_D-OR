import { PrismaClient } from '@prisma/client';
import { createNotificationsForUsers } from './notificationController.js';

const prisma = new PrismaClient();

/**
 * Récupère tous les événements avec filtres optionnels
 */
export const getEvents = async (req, res) => {
  try {
    const { startDate, endDate, type, month, year } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = {
        gte: start,
        lte: end,
      };
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });

    res.json(events);
  } catch (err) {
    console.error('getEvents error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements', details: err.message });
  }
};

/**
 * Récupère un événement par ID
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    res.json(event);
  } catch (err) {
    console.error('getEventById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'événement', details: err.message });
  }
};

/**
 * Crée un nouvel événement
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, type, location } = req.body;
    const userId = req.user?.id; // Depuis le middleware d'authentification

    if (!title || !date || !type) {
      return res.status(400).json({ error: 'title, date et type sont requis' });
    }

    // Vérifier que le type est valide
    const validTypes = ['REUNION', 'EXAMEN', 'ACTIVITE', 'FERIE', 'AUTRE'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ error: `type invalide. Doit être l'un de: ${validTypes.join(', ')}` });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        time: time || null,
        type: type.toUpperCase(),
        location: location || null,
        createdById: userId || null,
      },
    });

    // Créer des notifications pour tous les parents, enseignants, administrateurs et super administrateurs
    const parents = await prisma.user.findMany({
      where: { role: 'PARENT' },
      select: { id: true },
    });

    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: { id: true },
    });

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMINISTRATION', 'SUPER_ADMIN'],
        },
      },
      select: { id: true },
    });

    const allUserIds = [...parents.map(p => p.id), ...teachers.map(t => t.id), ...admins.map(a => a.id)];

    if (allUserIds.length > 0) {
      const eventDate = new Date(date).toLocaleDateString('fr-FR');
      const eventTime = time ? ` à ${time}` : '';
      
      await createNotificationsForUsers(
        allUserIds,
        'CALENDAR_EVENT',
        'Nouvel événement au calendrier',
        `Un nouvel événement "${title}" a été ajouté au calendrier pour le ${eventDate}${eventTime}.`,
        event.id,
        {
          eventType: type.toUpperCase(),
          location: location || null,
        }
      );
    }

    res.status(201).json(event);
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement', details: err.message });
  }
};

/**
 * Met à jour un événement
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, type, location } = req.body;

    const event = await prisma.calendarEvent.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Vérifier que le type est valide si fourni
    if (type) {
      const validTypes = ['REUNION', 'EXAMEN', 'ACTIVITE', 'FERIE', 'AUTRE'];
      if (!validTypes.includes(type.toUpperCase())) {
        return res.status(400).json({ error: `type invalide. Doit être l'un de: ${validTypes.join(', ')}` });
      }
    }

    const updated = await prisma.calendarEvent.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(time !== undefined && { time }),
        ...(type && { type: type.toUpperCase() }),
        ...(location !== undefined && { location }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement', details: err.message });
  }
};

/**
 * Supprime un événement
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    await prisma.calendarEvent.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Événement supprimé avec succès' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement', details: err.message });
  }
};


