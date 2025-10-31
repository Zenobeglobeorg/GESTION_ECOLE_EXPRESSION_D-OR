# Expression d'Or - Backend Server

API backend pour le système de gestion de l'école Expression d'Or.

## 🚀 Installation

```bash
npm install
```

## 📝 Configuration

1. Copiez `.env.example` vers `.env`
2. Configurez votre `DATABASE_URL` PostgreSQL
3. Configurez votre `JWT_SECRET`

## 🛠️ Développement

```bash
# Démarrer le serveur en mode développement
npm run dev

# Générer le client Prisma après modification du schema
npm run db:generate

# Créer une nouvelle migration
npm run db:migrate

# Ouvrir Prisma Studio (interface graphique pour la DB)
npm run db:studio
```

## 📁 Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Définition de la base de données
│   └── migrations/        # Migrations Prisma
├── src/
│   ├── api/               # Routes API
│   ├── controllers/       # Contrôleurs
│   ├── services/          # Logique métier
│   ├── middlewares/       # Middlewares (auth, validation...)
│   └── server.js         # Point d'entrée
└── package.json
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

## 📚 API Endpoints (À implémenter)

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur courant

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Élèves
- `GET /api/students` - Liste des élèves
- `POST /api/students` - Créer un élève
- `GET /api/students/:id` - Détails d'un élève

### Notes
- `GET /api/grades` - Liste des notes
- `POST /api/grades` - Créer une note
- `GET /api/students/:id/grades` - Notes d'un élève

