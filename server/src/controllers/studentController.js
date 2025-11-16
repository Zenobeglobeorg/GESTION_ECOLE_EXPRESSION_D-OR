import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendWelcomeEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

/**
 * Génère un mot de passe temporaire aléatoire
 */
function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Crée ou trouve un parent par email
 */
async function findOrCreateParent(email, studentData) {
  // Chercher un parent existant
  let parent = await prisma.user.findFirst({
    where: {
      email: email.toUpperCase(),
      role: 'PARENT',
    },
  });

  const parentExistedBefore = !!parent;

  if (!parent) {
    // Créer un nouveau parent
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Utiliser le nom du père ou de la mère comme nom par défaut
    const firstName = studentData.fatherName?.split(' ')[0] || 
                     studentData.motherName?.split(' ')[0] || 
                     'Parent';
    const lastName = studentData.lastName || '';

    parent = await prisma.user.create({
      data: {
        email: email.toUpperCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'PARENT',
        phone: studentData.fatherContact || studentData.motherContact || null,
      },
    });

    // Envoyer un email avec les identifiants de connexion
    const emailResult = await sendWelcomeEmail(
      email,
      temporaryPassword,
      `${firstName} ${lastName}`
    );

    if (emailResult.success) {
      console.log(`✅ Email de bienvenue envoyé à ${email}`);
    } else {
      console.log(`⚠️ Email non envoyé (${emailResult.error || emailResult.message}).`);
      console.log(`📧 [IMPORTANT] Nouveau parent créé: ${email}`);
      console.log(`   Mot de passe temporaire: ${temporaryPassword}`);
      console.log(`   ⚠️ Veuillez envoyer ces identifiants manuellement au parent !`);
    }
  }

  // Ajouter un flag pour savoir si le parent était nouveau
  parent._wasCreated = !parentExistedBefore;
  return parent;
}

/**
 * Liste tous les élèves
 */
export const listStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        parent: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (err) {
    console.error('listStudents error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des élèves' });
  }
};

/**
 * Crée un nouvel élève
 */
export const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      classId,
      schoolOfOrigin,
      hasDisability,
      isOrphan,
      orphanType,
      fatherName,
      fatherAddress,
      fatherContact,
      motherName,
      motherAddress,
      motherContact,
      guardianName,
      guardianContact,
      authorizedPerson1Name,
      authorizedPerson1Tel,
      authorizedPerson2Name,
      authorizedPerson2Tel,
      paymentOption,
      lastPaymentDate,
      parentEmail,
    } = req.body;

    // Validation des champs requis
    if (!firstName || !lastName || !dateOfBirth || !parentEmail) {
      return res.status(400).json({ error: 'Champs requis manquants: firstName, lastName, dateOfBirth, parentEmail' });
    }

    // Créer ou trouver le parent
    const parent = await findOrCreateParent(parentEmail, {
      fatherName,
      motherName,
      lastName,
      fatherContact,
      motherContact,
    });
    const wasCreated = parent._wasCreated ?? false;

    // Créer l'élève
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        classId: classId ? parseInt(classId) : null,
        schoolOfOrigin: schoolOfOrigin || null,
        hasDisability: hasDisability || false,
        isOrphan: isOrphan || false,
        orphanType: orphanType || null,
        fatherName: fatherName || null,
        fatherAddress: fatherAddress || null,
        fatherContact: fatherContact || null,
        motherName: motherName || null,
        motherAddress: motherAddress || null,
        motherContact: motherContact || null,
        guardianName: guardianName || null,
        guardianContact: guardianContact || null,
        authorizedPerson1Name: authorizedPerson1Name || null,
        authorizedPerson1Tel: authorizedPerson1Tel || null,
        authorizedPerson2Name: authorizedPerson2Name || null,
        authorizedPerson2Tel: authorizedPerson2Tel || null,
        paymentOption: paymentOption || 'MONTHLY',
        lastPaymentDate: lastPaymentDate ? new Date(lastPaymentDate) : null,
        parentId: parent.id,
      },
      include: {
        parent: {
          select: {
            id: true,
            email: true,
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

    res.status(201).json({
      student,
      parent: {
        id: parent.id,
        email: parent.email,
        firstName: parent.firstName,
        lastName: parent.lastName,
        wasCreated,
      },
    });
  } catch (err) {
    console.error('createStudent error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'élève' });
  }
};

/**
 * Récupère un élève par ID
 */
export const getStudentById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    res.json(student);
  } catch (err) {
    console.error('getStudentById error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'élève' });
  }
};

/**
 * Met à jour un élève
 */
export const updateStudent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = { ...req.body };

    // Convertir les dates si présentes
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.lastPaymentDate) {
      updateData.lastPaymentDate = new Date(updateData.lastPaymentDate);
    }
    if (updateData.classId) {
      updateData.classId = parseInt(updateData.classId);
    }

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(student);
  } catch (err) {
    console.error('updateStudent error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'élève' });
  }
};

/**
 * Supprime un élève
 */
export const deleteStudent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.student.delete({ where: { id } });
    res.json({ success: true, message: 'Élève supprimé avec succès' });
  } catch (err) {
    console.error('deleteStudent error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'élève' });
  }
};

