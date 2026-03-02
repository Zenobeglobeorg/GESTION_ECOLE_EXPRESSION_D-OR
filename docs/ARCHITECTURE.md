# Architecture Technique - Expression d'Or

## ✅ État d'Implémentation

L'architecture technique de base a été mise en place selon les spécifications fournies. Ce document récapitule ce qui a été fait et ce qui reste à implémenter.

## 📁 Structure du Projet

### Frontend (`client/`)

```
client/src/
├── components/
│   ├── ui/              ✅ Composants de base créés
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/          ⏳ À implémenter (Navbar, Sidebar)
│   ├── shared/          ⏳ À implémenter (composants partagés)
│   ├── admin/           ⏳ À implémenter (composants Admin)
│   ├── parent/          ⏳ À implémenter (composants Parent)
│   ├── teacher/         ⏳ À implémenter (composants Enseignant)
│   └── superadmin/      ⏳ À implémenter (composants Super-Admin)
│
├── pages/
│   ├── public/
│   │   └── LoginPage.tsx ✅ Page de connexion créée
│   ├── admin/           ⏳ À implémenter
│   ├── parent/          ⏳ À implémenter
│   ├── teacher/         ⏳ À implémenter
│   └── superadmin/       ⏳ À implémenter
│
├── contexts/
│   └── AuthContext.tsx   ✅ Contexte d'authentification créé
│
├── hooks/
│   └── useAuth.ts       ✅ Hook d'authentification créé
│
├── services/            ✅ Services créés avec mock data
│   ├── authService.ts
│   ├── studentService.ts
│   └── gradeService.ts
│
└── utils/               ✅ Utilitaires créés
    ├── dateFormatter.ts
    └── validators.ts
```

### Backend (`server/`)

```
server/
├── prisma/
│   └── schema.prisma    ✅ Schéma de base créé (à compléter)
├── src/
│   └── server.js        ✅ Serveur Express de base créé
├── package.json         ✅ Configuration créée
└── README.md            ✅ Documentation créée
```

## 🔧 Composants Créés

### Composants UI de Base
- **Button** : Bouton avec variantes (primary, secondary, danger, outline) et états de chargement
- **Input** : Champ de saisie avec label, erreur et texte d'aide
- **Card** : Carte avec titre optionnel et actions dans l'en-tête
- **Modal** : Modale avec différentes tailles et gestion du scroll

### Services avec Mock Data
Tous les services sont prêts à être connectés au backend :
- `authService.ts` : Authentification (login, logout, getCurrentUser)
- `studentService.ts` : Gestion des élèves (getStudentsByClass, getStudentById, getStudentsByParent)
- `gradeService.ts` : Gestion des notes et calcul des niveaux de maîtrise

### Utilitaires
- `dateFormatter.ts` : Formatage des dates en français
- `validators.ts` : Validation des formulaires (email, téléphone, mot de passe, date)

## 🎯 Prochaines Étapes de Développement

### Priorité 1 : Routing et Navigation
- [ ] Installer React Router
- [ ] Créer les routes protégées par rôle
- [ ] Implémenter la navigation entre les pages

### Priorité 2 : Layout et Navigation
- [ ] Créer `components/layout/Navbar.tsx`
- [ ] Créer `components/layout/Sidebar.tsx`
- [ ] Créer un layout spécifique par rôle

### Priorité 3 : Interfaces par Rôle

#### Super-Administrateur
- [ ] Page de gestion des comptes Administration
- [ ] Page de gestion des rôles et permissions

#### Administration
- [ ] Dashboard Administration
- [ ] Gestion des utilisateurs (CRUD)
- [ ] Gestion des dossiers élèves
- [ ] Gestion des classes et matières
- [ ] Interface de validation des notes
- [ ] Génération des bulletins

#### Enseignant
- [ ] Dashboard Enseignant
- [ ] Carnet de notes (grille de saisie)
- [ ] Suivi des présences
- [ ] Liste des classes

#### Parent
- [ ] Dashboard Parent avec sélection d'enfant
- [ ] Consultation des notes et niveaux de maîtrise
- [ ] Consultation des présences
- [ ] Consultation des frais de scolarité
- [ ] Demande de rendez-vous

### Priorité 4 : Backend
- [ ] Compléter le schéma Prisma avec toutes les entités
- [ ] Implémenter les routes d'authentification
- [ ] Implémenter les routes CRUD pour les utilisateurs
- [ ] Implémenter les routes pour les élèves
- [ ] Implémenter les routes pour les notes
- [ ] Implémenter le calcul des niveaux de maîtrise côté backend

### Priorité 5 : Intégration
- [ ] Connecter les services frontend au backend réel
- [ ] Implémenter la gestion des tokens JWT
- [ ] Ajouter la gestion des erreurs et le loading states

## 🔐 Système de Paliers et Compétences

Le système pédagogique unique d'Expression d'Or est modélisé dans `gradeService.ts` :

- **Paliers** : Périodes mensuelles (5 semaines d'apprentissage + 1 semaine d'intégration)
- **Compétences** : Groupements de disciplines (EDM&EAS, MATHÉMATIQUES, FRANÇAIS)
- **Niveaux de Maîtrise** :
  - Non Maîtrise (0-2)
  - Maîtrise Partielle (3-4)
  - Maîtrise Minimale (5-7)
  - Maîtrise Maximale (8-9)
  - Excellent (10)

## 📝 Notes pour l'Équipe

1. **Données Mockées** : Tous les services utilisent des données fictives. Pour tester avec de vraies données, il faudra d'abord implémenter le backend.

2. **Composants Réutilisables** : Toujours vérifier si un composant existe déjà dans `components/ui/` ou `components/shared/` avant d'en créer un nouveau.

3. **Workflow Git** : Suivre la convention de branches :
   - `feature/nom-fonctionnalite` pour les nouvelles fonctionnalités
   - `fix/description` pour les corrections de bugs
   - Toujours créer une Pull Request avant de merger dans `main`

4. **Style** : Utiliser TailwindCSS pour tous les styles. Les composants UI de base sont déjà stylisés et peuvent être personnalisés via les props `className`.

5. **Types TypeScript** : Tous les types sont définis dans les fichiers de services ou contexts. Réutiliser ces types plutôt que d'en créer de nouveaux.

## 🚀 Commandes Utiles

### Frontend
```bash
cd client
npm install      # Installer les dépendances
npm run dev      # Démarrer le serveur de développement
npm run build    # Build de production
npm run lint     # Vérifier le code
```

### Backend
```bash
cd server
npm install              # Installer les dépendances
npm run dev             # Démarrer le serveur
npm run db:generate     # Générer le client Prisma
npm run db:migrate      # Créer une migration
npm run db:studio       # Ouvrir Prisma Studio
```

## 📚 Ressources

- [Documentation React](https://react.dev)
- [Documentation TailwindCSS](https://tailwindcss.com)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Vite](https://vite.dev)

