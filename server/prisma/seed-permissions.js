import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // Users
  { key: 'users.create', name: 'Créer des utilisateurs', category: 'users', description: 'Créer des comptes Enseignants et Parents' },
  { key: 'users.read', name: 'Lire les utilisateurs', category: 'users', description: 'Consulter la liste des utilisateurs' },
  { key: 'users.update', name: 'Modifier les utilisateurs', category: 'users', description: 'Modifier les informations des utilisateurs' },
  { key: 'users.delete', name: 'Supprimer des utilisateurs', category: 'users', description: 'Supprimer ou suspendre des utilisateurs' },
  
  // Students
  { key: 'students.create', name: 'Créer des dossiers élèves', category: 'students', description: 'Créer de nouveaux dossiers élèves' },
  { key: 'students.read', name: 'Consulter les dossiers', category: 'students', description: 'Voir les informations des élèves' },
  { key: 'students.update', name: 'Modifier les dossiers', category: 'students', description: 'Modifier les dossiers élèves' },
  { key: 'students.delete', name: 'Archiver des dossiers', category: 'students', description: 'Archiver des dossiers élèves' },
  
  // Academic
  { key: 'classes.create', name: 'Créer des classes', category: 'academic', description: 'Créer de nouvelles classes' },
  { key: 'classes.manage', name: 'Gérer les classes', category: 'academic', description: 'Gérer les classes et matières' },
  { key: 'grades.validate', name: 'Valider les notes', category: 'academic', description: 'Valider les notes saisies par les enseignants' },
  { key: 'grades.modify', name: 'Modifier les notes', category: 'academic', description: 'Modifier les notes après validation' },
  { key: 'reports.generate', name: 'Générer les bulletins', category: 'academic', description: 'Générer les bulletins de notes' },
  
  // Administration
  { key: 'attendance.manage', name: 'Gérer les présences', category: 'administration', description: 'Gérer les présences et absences' },
  { key: 'fees.manage', name: 'Gérer les frais', category: 'administration', description: 'Gérer les frais de scolarité' },
  { key: 'schedule.manage', name: 'Gérer les emplois du temps', category: 'administration', description: 'Créer et modifier les emplois du temps' },
  { key: 'announcements.create', name: 'Créer des annonces', category: 'administration', description: 'Créer des annonces générales' },
  
  // System
  { key: 'system.settings', name: 'Paramètres système', category: 'system', description: 'Accéder aux paramètres système' },
];

async function main() {
  console.log('🌱 Création des permissions...');
  
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }
  
  console.log(`✅ ${permissions.length} permissions créées/mises à jour`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

