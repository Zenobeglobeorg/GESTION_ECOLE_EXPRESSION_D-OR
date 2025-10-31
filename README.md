# Expression d'Or - Système de Gestion Scolaire

Application de gestion complète pour l'école primaire "Expression d'Or".

## 📁 Architecture du Projet

Ce projet suit une architecture **monorepo** avec séparation frontend/backend :

```
expression-d-or/
├── client/          # Application React (Frontend)
│   ├── src/
│   │   ├── components/    # Composants React
│   │   │   ├── ui/        # Composants de base (Button, Input, Card...)
│   │   │   ├── layout/    # Structure (Navbar, Sidebar...)
│   │   │   ├── shared/    # Composants partagés
│   │   │   ├── admin/     # Composants Admin
│   │   │   ├── parent/    # Composants Parent
│   │   │   ├── teacher/   # Composants Enseignant
│   │   │   └── superadmin/ # Composants Super-Admin
│   │   ├── pages/         # Pages de l'application
│   │   │   ├── public/    # Pages publiques (Login...)
│   │   │   ├── admin/     # Pages Admin
│   │   │   ├── parent/    # Pages Parent
│   │   │   ├── teacher/   # Pages Enseignant
│   │   │   └── superadmin/ # Pages Super-Admin
│   │   ├── contexts/      # Context API (AuthContext...)
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── services/      # Communication avec l'API (mock data pour le moment)
│   │   └── utils/         # Fonctions utilitaires
│   └── package.json
│
└── server/          # Application Node.js (Backend) - À venir
    ├── prisma/      # Schema et migrations Prisma
    ├── src/
    │   ├── api/     # Routes API
    │   ├── controllers/
    │   ├── services/
    │   └── middlewares/
    └── package.json
```

## 🚀 Technologies Utilisées

### Frontend
- **React 19** avec **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **Context API** (state management)

### Backend (À venir)
- **Node.js**
- **Prisma** (ORM)
- **PostgreSQL** (base de données)

## 👥 Rôles Utilisateurs

1. **Super-Administrateur** : Contrôle total du système, gestion des comptes Admin
2. **Administration** : Gestion des élèves, classes, validation des notes, etc.
3. **Enseignant** : Saisie des notes, suivi des présences, communication
4. **Parent** : Consultation des résultats, présences, frais de scolarité

## 📋 Fonctionnalités Principales

### Module 1 : Authentification & Gestion Utilisateurs
- Authentification (Login/Logout, SSO)
- Gestion des rôles et permissions
- Gestion des comptes utilisateurs

### Module 2 : Gestion Académique
- Système de **Paliers** (périodes mensuelles)
- Saisie des notes et évaluations
- Calcul automatique des **Niveaux de Maîtrise** par compétences
- Génération des bulletins
- Suivi des présences

### Module 3 : Communication & Administration
- Chat interne
- Annonces générales
- Gestion des frais de scolarité
- Suivi disciplinaire
- Demandes de rendez-vous

## 🛠️ Démarrage du Projet

### Prérequis
- Node.js (v18+)
- npm ou yarn

### Installation Frontend

```bash
cd client
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Installation Backend (À venir)

```bash
cd server
npm install
npm run dev
```

## 📝 Conventions de Code

### Branches Git
- `main` : Version stable (NE JAMAIS COMMITTER DIRECTEMENT)
- `feature/nom-fonctionnalite` : Nouvelles fonctionnalités
- `fix/description-bug` : Corrections de bugs

### Structure des Commits
Format : `type: description`
- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `refactor:` : Refactorisation
- `docs:` : Documentation

## 👨‍💻 Workflow de Développement

1. Créer une branche depuis `main` : `git checkout -b feature/nom-fonctionnalite`
2. Développer et commiter localement
3. Mettre à jour avec `main` : `git pull origin main`
4. Pousser la branche et créer une Pull Request
5. Code review par un autre développeur
6. Merge dans `main` après approbation

## 📚 Documentation

Pour plus de détails sur :
- L'analyse fonctionnelle UML
- Le plan de développement technique
- Les spécifications pédagogiques

Consultez la documentation complète dans les fichiers du projet.

## 🎯 Prochaines Étapes

- [ ] Implémenter l'authentification complète
- [ ] Créer les composants UI de base
- [ ] Développer les services backend
- [ ] Mettre en place la base de données Prisma
- [ ] Implémenter le système de paliers et compétences
