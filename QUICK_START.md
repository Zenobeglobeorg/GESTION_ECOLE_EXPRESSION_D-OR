# 🚀 Démarrage Rapide - Expression d'Or

## ⚡ Installation Express (5 minutes)

### 1. Base de données PostgreSQL

```bash
# Créer la base de données dans pgAdmin ou via psql :
CREATE DATABASE expression_d_or;
```

### 2. Configuration Backend

```bash
cd server

# Créer le fichier .env
# Copiez ce contenu :
DATABASE_URL="postgresql://votre_user:votre_password@localhost:5432/expression_d_or?schema=public"
JWT_SECRET="changez-moi-en-production-2025"
PORT=3000
CORS_ORIGINS="http://localhost:5173"

# Installer et configurer
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3. Configuration Frontend

```bash
cd client

# Installer React Router
npm install react-router-dom

# Installer les dépendances
npm install
```

### 4. Démarrer l'Application

**Terminal 1 :**
```bash
cd server
npm run dev
```

**Terminal 2 :**
```bash
cd client
npm run dev
```

### 5. Se Connecter

1. Ouvrir : http://localhost:5173
2. Email : `ZENOBEGLOBE`
3. Mot de passe : `Zenobeglobe2025`

## ✅ Vérification

- ✅ Backend accessible : http://localhost:3000/health
- ✅ Frontend accessible : http://localhost:5173
- ✅ Connexion fonctionnelle avec redirection vers `/superadmin`

## 🔧 Problèmes Courants

**Erreur : "Cannot find module 'react-router-dom'"**
```bash
cd client && npm install react-router-dom
```

**Erreur : "Prisma Client not generated"**
```bash
cd server && npm run db:generate
```

**Erreur de connexion PostgreSQL**
- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans `.env`
- Testez : `psql -U votre_user -d expression_d_or`

## 📚 Documentation Complète

- `SETUP_AUTH.md` - Guide détaillé de l'authentification
- `ARCHITECTURE.md` - Architecture technique
- `README.md` - Vue d'ensemble du projet


