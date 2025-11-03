# 🚀 Accès Rapide - Expression d'Or

## 🔐 Identifiants de Connexion

### Comptes de Test (après `npm run db:seed`)

| Rôle | Email | Mot de passe | Route après connexion |
|------|-------|--------------|------------------------|
| **Super-Administrateur** | `ZENOBEGLOBE` | `Zenobeglobe2025` | `/superadmin` |
| **Administrateur** | `ADMINISTRATEUR` | `Administrateur@2025` | `/admin` |
| **Enseignant** | `ENSEIGNANT` | `Enseignant@2025` | `/teacher` |
| **Parent** | `PARENT` | `Parent@2025` | `/parent` |

## 📋 Fonctionnalités Disponibles

### Super-Administrateur (`/superadmin`)
- ✅ Dashboard avec statistiques
- ✅ Gestion de tous les utilisateurs (Admin, Enseignants, Parents)
- ✅ Gestion des rôles et permissions
- ✅ Création de rôles personnalisés

### Administrateur (`/admin`)
- ✅ Dashboard avec statistiques
- ✅ Page d'inscription d'élève complète
- ✅ Accès aux fonctionnalités d'administration (à développer)

### Enseignant (`/teacher`)
- ✅ Dashboard avec classes assignées
- ✅ Emploi du temps du jour
- ✅ Actions rapides (Saisir notes, Présences)

### Parent (`/parent`)
- ✅ Dashboard avec sélection d'enfant (si plusieurs)
- ✅ Statistiques de l'enfant (Notes, Présences, Frais)
- ✅ Accès rapide aux différentes sections

## 📝 Page d'Inscription Élève

Route : `/admin/students/new`

**Fonctionnalités :**
- Formulaire complet avec tous les champs de la fiche d'inscription
- Gestion du handicap et orphelin
- Informations parents/tuteurs
- Personnes autorisées
- Options de paiement
- Association à un compte parent (création automatique si inexistant)

## 🔄 Workflow d'Inscription

1. **Administration** va sur `/admin/students/new`
2. Remplit le formulaire complet
3. Recherche ou crée le parent par email
4. L'élève est créé et associé au parent
5. Le parent reçoit (ou recevra) les identifiants de connexion
6. Le parent peut se connecter et voir tous ses enfants

## 📚 Structure de Base de Données

### Modèles Principaux
- `User` : Tous les utilisateurs (Super-Admin, Admin, Enseignant, Parent)
- `Student` : Élèves avec toutes les informations de la fiche
- `Role` & `Permission` : Système de rôles personnalisés
- `Class`, `Subject`, `Competency` : Structure académique
- `Grade`, `Evaluation`, `Palier` : Système d'évaluation

## 🛠️ Prochaines Étapes

### Frontend (votre équipe)
- Les dashboards de base sont prêts
- Les routes sont configurées
- Commencez à développer les pages spécifiques de chaque rôle

### Backend (à développer)
- Routes API pour CRUD des élèves
- Logique de création automatique des parents
- Routes pour récupérer les enfants d'un parent
- Système d'envoi d'emails avec identifiants

## 💡 Notes Importantes

1. **Un parent peut avoir plusieurs enfants** : Le dashboard parent permet de sélectionner l'enfant
2. **Création automatique du parent** : Si le parent n'existe pas lors de l'inscription, il sera créé automatiquement
3. **Les formulaires sont extensibles** : Vous pouvez ajouter des champs pour Enseignants/Admins si nécessaire
4. **Le système de rôles** permet de créer des sous-rôles pour l'administration avec des permissions spécifiques

