import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère les paramètres de l'école
 */
export const getSchoolSettings = async (req, res) => {
  try {
    let settings = await prisma.schoolSettings.findFirst();
    
    // Si aucun paramètre n'existe, créer des paramètres par défaut
    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: {
          name: "Expression d'Or",
          code: "EDO-2024",
          address: "",
          phone: "",
          email: "",
          director: "",
          timezone: "Europe/Paris",
          language: "fr",
          dateFormat: "DD/MM/YYYY",
        },
      });
    }

    res.json(settings);
  } catch (err) {
    console.error('getSchoolSettings error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres', details: err.message });
  }
};

/**
 * Met à jour les paramètres de l'école
 */
export const updateSchoolSettings = async (req, res) => {
  try {
    const { name, code, address, phone, email, director, timezone, language, dateFormat } = req.body;

    let settings = await prisma.schoolSettings.findFirst();

    if (!settings) {
      // Créer si n'existe pas
      settings = await prisma.schoolSettings.create({
        data: {
          name: name || "Expression d'Or",
          code: code || null,
          address: address || null,
          phone: phone || null,
          email: email || null,
          director: director || null,
          timezone: timezone || "Europe/Paris",
          language: language || "fr",
          dateFormat: dateFormat || "DD/MM/YYYY",
        },
      });
    } else {
      // Mettre à jour
      settings = await prisma.schoolSettings.update({
        where: { id: settings.id },
        data: {
          ...(name !== undefined && { name }),
          ...(code !== undefined && { code }),
          ...(address !== undefined && { address }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(director !== undefined && { director }),
          ...(timezone !== undefined && { timezone }),
          ...(language !== undefined && { language }),
          ...(dateFormat !== undefined && { dateFormat }),
        },
      });
    }

    res.json(settings);
  } catch (err) {
    console.error('updateSchoolSettings error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres', details: err.message });
  }
};

/**
 * Récupère les paramètres système
 */
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await prisma.schoolSettings.findFirst();
    
    if (!settings) {
      return res.json({
        timezone: "Europe/Paris",
        language: "fr",
        dateFormat: "DD/MM/YYYY",
      });
    }

    res.json({
      timezone: settings.timezone,
      language: settings.language,
      dateFormat: settings.dateFormat,
    });
  } catch (err) {
    console.error('getSystemSettings error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres système', details: err.message });
  }
};

/**
 * Met à jour les paramètres système
 */
export const updateSystemSettings = async (req, res) => {
  try {
    const { timezone, language, dateFormat } = req.body;

    let settings = await prisma.schoolSettings.findFirst();

    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: {
          name: "Expression d'Or",
          timezone: timezone || "Europe/Paris",
          language: language || "fr",
          dateFormat: dateFormat || "DD/MM/YYYY",
        },
      });
    } else {
      settings = await prisma.schoolSettings.update({
        where: { id: settings.id },
        data: {
          ...(timezone !== undefined && { timezone }),
          ...(language !== undefined && { language }),
          ...(dateFormat !== undefined && { dateFormat }),
        },
      });
    }

    res.json({
      timezone: settings.timezone,
      language: settings.language,
      dateFormat: settings.dateFormat,
    });
  } catch (err) {
    console.error('updateSystemSettings error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres système', details: err.message });
  }
};


