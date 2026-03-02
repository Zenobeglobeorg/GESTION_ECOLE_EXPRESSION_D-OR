# 📝 Guide d'Inscription des Élèves

## 🎯 Processus d'Inscription

### Workflow Complet

1. **L'Administration crée l'élève** avec toutes les informations de la fiche d'inscription
2. **Association à un Parent** :
   - Si le parent existe déjà (recherche par email) → Association directe
   - Si le parent n'existe pas → Création automatique d'un compte Parent avec l'email fourni
3. **Le Parent peut avoir plusieurs enfants** :
   - Un parent peut être associé à plusieurs élèves
   - Quand le parent se connecte, il voit tous ses enfants dans son dashboard
   - Il peut sélectionner un enfant et voir toutes ses informations

## 📋 Fiche d'Inscription Complète

La page `StudentRegistrationPage.tsx` contient tous les champs de la fiche :

### Informations de l'Élève
- ✅ Noms et Prénoms
- ✅ Date de naissance
- ✅ Classe
- ✅ École de provenance
- ✅ Handicap (Oui/Non)
- ✅ Orphelin (Oui/Non, avec type : Père/Mère)

### Informations sur les Parents
- ✅ Nom du Père + Domicile + Contact
- ✅ Nom de la Mère + Domicile + Contact
- ✅ Nom du Tuteur/Tutrice + Contact

### Personnes Autorisées
- ✅ Personne 1 : Nom + Téléphone
- ✅ Personne 2 : Nom + Téléphone

### Option de Paiement
- ✅ Option 1 : Mensuel (le 5 du mois)
- ✅ Option 2 : Trimestriel
- ✅ Option 3 : Annuel (1 ou 2 tranches)
- ✅ Date limite : 05 MARS 2026

### Association au Parent
- ✅ Recherche du parent par email
- ✅ Création automatique si inexistant

## 🔄 Logique Backend à Implémenter

### 1. Création d'un Élève

```javascript
// Pseudo-code du processus
async function registerStudent(studentData, parentEmail) {
  // 1. Vérifier ou créer le parent
  let parent = await prisma.user.findUnique({
    where: { email: parentEmail, role: 'PARENT' }
  });
  
  if (!parent) {
    // Créer le parent automatiquement
    parent = await prisma.user.create({
      data: {
        email: parentEmail,
        passwordHash: await generateTemporaryPassword(), // Mot de passe temporaire
        firstName: studentData.fatherName || studentData.motherName || 'Parent',
        lastName: studentData.lastName,
        role: 'PARENT',
        phone: studentData.fatherContact || studentData.motherContact
      }
    });
    
    // Envoyer email avec identifiants de connexion
    await sendWelcomeEmail(parent.email, temporaryPassword);
  }
  
  // 2. Créer l'élève
  const student = await prisma.student.create({
    data: {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      dateOfBirth: new Date(studentData.dateOfBirth),
      // ... tous les autres champs
      parentId: parent.id,
      paymentOption: studentData.paymentOption,
      lastPaymentDate: new Date('2026-03-05') // Date limite fixe
    }
  });
  
  return { student, parent };
}
```

### 2. Un Parent, Plusieurs Enfants

Dans le modèle Prisma :
- Un `Student` a un seul `parentId` (un parent principal)
- Un `User` (avec role PARENT) peut avoir plusieurs `Student[]` via la relation

Quand le parent se connecte :
- Récupérer tous ses enfants : `await prisma.student.findMany({ where: { parentId: parent.id } })`
- Afficher la liste dans le dashboard
- Permettre la sélection d'un enfant pour voir ses détails

## 📝 Concernant les Formulaires d'Inscription

### Pour les Enseignants et Administrateurs

**Le formulaire actuel est suffisant pour commencer**, mais vous pourriez ajouter :

**Pour les Enseignants :**
- Matières enseignées (multi-sélection)
- Classes assignées (au moment de la création ou après)
- Niveau d'expérience (optionnel)
- Diplômes/Qualifications (optionnel)

**Pour les Administrateurs :**
- Poste occupé (Directeur, Secrétaire, Comptable, etc.)
- Département/Section (optionnel)
- Permissions spécifiques (sera géré par le système de rôles)

Ces informations peuvent être ajoutées progressivement selon vos besoins réels.

## 🚀 Comptes de Test Créés

Après avoir exécuté `npm run db:seed` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super-Admin | ZENOBEGLOBE | Zenobeglobe2025 |
| Administrateur | ADMINISTRATEUR | Administrateur@2025 |
| Enseignant | ENSEIGNANT | Enseignant@2025 |
| Parent | PARENT | Parent@2025 |

## ✅ Ce qui est Prêt

- ✅ Schéma Prisma complet avec tous les champs de la fiche
- ✅ Page d'inscription d'élève avec tous les champs
- ✅ Dashboards de base pour tous les rôles
- ✅ Routes configurées et protégées
- ✅ Comptes de test créés automatiquement

## ✅ Ce qui a été Implémenté

### 1. ✅ Routes API Créées
- ✅ `POST /api/students` - Crée un élève (avec création automatique du parent si nécessaire)
- ✅ `GET /api/students` - Liste tous les élèves
- ✅ `GET /api/students/:id` - Récupère un élève
- ✅ `PUT /api/students/:id` - Met à jour un élève
- ✅ `DELETE /api/students/:id` - Supprime un élève
- ✅ `GET /api/parents/search?email=...` - Recherche un parent par email
- ✅ `GET /api/parents/:id/students` - Récupère tous les enfants d'un parent
- ✅ `GET /api/parents/:id` - Récupère un parent par ID

### 2. ✅ Logique de Création Automatique du Parent
- ✅ Si le parent n'existe pas → Création automatique
- ✅ Génération de mot de passe temporaire (12 caractères aléatoires)
- ✅ Hash du mot de passe avec bcrypt
- ✅ Utilisation des informations de l'élève pour créer le parent (nom, prénom, téléphone)
- ✅ Rôle PARENT assigné automatiquement

### 3. ✅ Gestion des Mots de Passe Temporaires
- ✅ Génération automatique lors de la création d'un parent
- ✅ Affichage dans la console (mode développement)
- ✅ Structure prête pour l'envoi d'email (commentaire dans le code)

### 4. ✅ Page d'Inscription Connectée
- ✅ Formulaire complet avec tous les champs
- ✅ Recherche de parent par email fonctionnelle
- ✅ Création d'élève avec association au parent
- ✅ Messages d'erreur et de succès
- ✅ Redirection après création

## 🔄 Prochaines Étapes (Optionnelles)

1. **Envoi d'Emails** : Implémenter l'envoi d'emails avec les identifiants (voir `BACKEND_STUDENTS_IMPLEMENTATION.md`)
2. **Routes Classes** : Créer `/api/classes` pour remplir le dropdown avec les vraies classes
3. **Validation** : Validation côté serveur plus stricte
4. **Upload Photos** : Upload de photos d'élèves
5. **Notifications** : Notifier le parent par SMS ou email quand un enfant est inscrit

**Voir `BACKEND_STUDENTS_IMPLEMENTATION.md` pour les détails complets et les instructions d'envoi d'email.**

