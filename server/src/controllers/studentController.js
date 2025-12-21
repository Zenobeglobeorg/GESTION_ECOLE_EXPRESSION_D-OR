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
 * Liste tous les élèves (réservé aux admins)
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
 * Récupère les enfants du parent connecté (pour les parents)
 */
export const getMyChildren = async (req, res) => {
  try {
    const user = req.user;
    
    // Vérifier que l'utilisateur est un parent
    if (user.role !== 'PARENT') {
      return res.status(403).json({ error: 'Accès refusé. Cette route est réservée aux parents.' });
    }

    const students = await prisma.student.findMany({
      where: {
        parentId: user.id,
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
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(students);
  } catch (err) {
    console.error('getMyChildren error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des enfants' });
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
      disabilityDescription,
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

    // Récupérer la classe pour obtenir le niveau (pour calculer les montants)
    let classLevel = null;
    if (classId) {
      const studentClass = await prisma.class.findUnique({
        where: { id: parseInt(classId) },
        select: { level: true },
      }).catch(() => null);
      classLevel = studentClass?.level;
    }

    // Créer l'élève
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        classId: classId ? parseInt(classId) : null,
        schoolOfOrigin: schoolOfOrigin || null,
        hasDisability: hasDisability || false,
        disabilityDescription: disabilityDescription || null,
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
            level: true,
          },
        },
      },
    });

    // Créer les paiements pour l'élève (première tranche payée automatiquement)
    const { createPaymentsForStudent } = await import('./paymentController.js');
    try {
      await createPaymentsForStudent(
        student.id,
        paymentOption || 'MONTHLY',
        student.enrollmentDate,
        classLevel || student.class?.level
      );
    } catch (paymentErr) {
      console.error('Erreur lors de la création des paiements:', paymentErr);
      // On continue quand même, l'élève est créé
    }

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

/**
 * Associe un élève à un parent
 */
export const associateStudentToParent = async (req, res) => {
  try {
    const { studentId, parentId } = req.body;

    if (!studentId || !parentId) {
      return res.status(400).json({ error: 'studentId et parentId sont requis' });
    }

    // Vérifier que l'élève existe
    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
    });

    if (!student) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    // Vérifier que le parent existe et a le rôle PARENT
    const parent = await prisma.user.findFirst({
      where: {
        id: Number(parentId),
        role: 'PARENT',
      },
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent non trouvé ou n\'a pas le rôle PARENT' });
    }

    // Mettre à jour l'élève avec le nouveau parentId
    const updatedStudent = await prisma.student.update({
      where: { id: Number(studentId) },
      data: { parentId: Number(parentId) },
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
    });

    res.json({
      success: true,
      message: 'Élève associé au parent avec succès',
      student: updatedStudent,
    });
  } catch (err) {
    console.error('associateStudentToParent error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'association de l\'élève au parent' });
  }
};

/**
 * Importe plusieurs élèves depuis un fichier CSV
 */
export const importStudents = async (req, res) => {
  try {
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à importer' });
    }

    const results = {
      success: [],
      errors: [],
      total: rows.length,
    };

    // Traiter chaque ligne
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 car ligne 1 = headers, ligne 2 = première donnée

      try {
        // Mapping des colonnes CSV aux champs de la base de données
        // On accepte plusieurs variantes de noms de colonnes
        const firstName = row.firstName || row.prenom || row['Prénom'] || row['First Name'] || '';
        const lastName = row.lastName || row.nom || row['Nom'] || row['Last Name'] || '';
        const dateOfBirth = row.dateOfBirth || row.dateNaissance || row['Date de naissance'] || row['Date of Birth'] || row['Date Naissance'] || '';
        const parentEmail = row.parentEmail || row.emailParent || row['Email Parent'] || row['Email du parent'] || row['Parent Email'] || '';
        const className = row.class || row.classe || row['Classe'] || row['Class'] || '';
        const schoolOfOrigin = row.schoolOfOrigin || row.ecoleProvenance || row['École de provenance'] || row['School of Origin'] || '';
        const hasDisability = row.hasDisability === 'true' || row.hasDisability === '1' || row.handicap === 'Oui' || row.handicap === 'oui' || row['Handicap'] === 'Oui' || false;
        const disabilityDescription = row.disabilityDescription || row.descriptionHandicap || row['Description handicap'] || row['Disability Description'] || '';
        const isOrphan = row.isOrphan === 'true' || row.isOrphan === '1' || row.orphelin === 'Oui' || row.orphelin === 'oui' || row['Orphelin'] === 'Oui' || false;
        const orphanType = row.orphanType || row.typeOrphelin || row['Type orphelin'] || row['Orphan Type'] || '';
        const fatherName = row.fatherName || row.nomPere || row['Nom père'] || row['Father Name'] || '';
        const fatherContact = row.fatherContact || row.contactPere || row['Contact père'] || row['Father Contact'] || '';
        const motherName = row.motherName || row.nomMere || row['Nom mère'] || row['Mother Name'] || '';
        const motherContact = row.motherContact || row.contactMere || row['Contact mère'] || row['Mother Contact'] || '';
        const guardianName = row.guardianName || row.nomTuteur || row['Nom tuteur'] || row['Guardian Name'] || '';
        const guardianContact = row.guardianContact || row.contactTuteur || row['Contact tuteur'] || row['Guardian Contact'] || '';
        const paymentOption = row.paymentOption || row.optionPaiement || row['Option paiement'] || row['Payment Option'] || 'MONTHLY';

        // Validation des champs requis
        if (!firstName || !lastName || !dateOfBirth || !parentEmail) {
          results.errors.push({
            row: rowNumber,
            student: `${firstName} ${lastName}`.trim() || 'Inconnu',
            error: 'Champs requis manquants: firstName, lastName, dateOfBirth, ou parentEmail',
          });
          continue;
        }

        // Vérifier et trouver ou créer la classe si nécessaire
        let classId = null;
        if (className) {
          try {
            const existingClass = await prisma.class.findFirst({
              where: {
                name: { equals: className, mode: 'insensitive' },
              },
            });

            if (existingClass) {
              classId = existingClass.id;
            } else {
              // Créer la classe si elle n'existe pas
              const newClass = await prisma.class.create({
                data: {
                  name: className,
                  level: 'Primaire', // Par défaut, peut être ajusté
                  academicYear: new Date().getFullYear().toString(),
                },
              });
              classId = newClass.id;
            }
          } catch (classError) {
            console.error(`Erreur lors de la création/recherche de la classe pour la ligne ${rowNumber}:`, classError);
          }
        }

        // Créer ou trouver le parent
        const parent = await findOrCreateParent(parentEmail, {
          fatherName,
          motherName,
          lastName,
          fatherContact,
          motherContact,
        });

        // Créer l'élève
        const student = await prisma.student.create({
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: new Date(dateOfBirth),
            classId: classId,
            schoolOfOrigin: schoolOfOrigin || null,
            hasDisability: hasDisability || false,
            disabilityDescription: disabilityDescription || null,
            isOrphan: isOrphan || false,
            orphanType: orphanType || null,
            fatherName: fatherName || null,
            fatherContact: fatherContact || null,
            motherName: motherName || null,
            motherContact: motherContact || null,
            guardianName: guardianName || null,
            guardianContact: guardianContact || null,
            paymentOption: paymentOption.toUpperCase() === 'QUARTERLY' ? 'QUARTERLY' : paymentOption.toUpperCase() === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY',
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

        results.success.push({
          row: rowNumber,
          student: `${student.firstName} ${student.lastName}`,
          parent: `${parent.firstName} ${parent.lastName}`,
          parentWasCreated: parent._wasCreated || false,
        });
      } catch (err) {
        console.error(`Erreur lors de l'import de la ligne ${rowNumber}:`, err);
        results.errors.push({
          row: rowNumber,
          student: `${row.firstName || row.prenom || ''} ${row.lastName || row.nom || ''}`.trim() || 'Inconnu',
          error: err.message || 'Erreur lors de la création de l\'élève',
        });
      }
    }

    res.json({
      success: true,
      message: `Import terminé: ${results.success.length} élève(s) importé(s) avec succès, ${results.errors.length} erreur(s)`,
      results,
    });
  } catch (err) {
    console.error('importStudents error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'import des élèves' });
  }
};

