# 🔐 Guide de Configuration de l'Authentification

## ✅ Ce qui a été implémenté

### Backend
- ✅ Routes d'authentification (`/api/auth/login`, `/api/auth/me`)
- ✅ Middleware JWT pour protéger les routes
- ✅ Contrôleur d'authentification avec bcrypt
- ✅ Script de seed pour créer le super-admin
- ✅ Support PostgreSQL avec Prisma

### Frontend
- ✅ Page de connexion avec design moderne
- ✅ Intégration React Router
- ✅ Routes protégées par rôle
- ✅ Dashboard Super-Administrateur
- ✅ Service d'authentification connecté au backend
- ✅ Gestion des tokens JWT

## 🚀 Instructions de Démarrage

### Étape 1 : Configuration de la Base de Données

1. **Installer PostgreSQL** (si pas déjà fait)
   - Télécharger depuis : https://www.postgresql.org/download/
   - Ou utiliser pgAdmin pour la gestion

2. **Créer la base de données**
   ```sql
   CREATE DATABASE expression_d_or;
   ```

3. **Configurer le fichier `.env` dans `server/`**
   ```env
   DATABASE_URL="postgresql://votre_utilisateur:votre_mot_de_passe@localhost:5432/expression_d_or?schema=public"
   JWT_SECRET="votre-secret-jwt-changez-en-production"
   PORT=3000
   CORS_ORIGINS="http://localhost:5173"
   ```

### Étape 2 : Installation et Migration Backend

```bash
cd server
npm install
npm run db:generate    # Génère le client Prisma
npm run db:migrate      # Crée les tables dans la base de données
npm run db:seed         # Crée le super-admin (ZENOBEGLOBE / Zenobeglobe2025)
```

### Étape 3 : Installation Frontend

```bash
cd client
npm install react-router-dom
npm install
```

### Étape 4 : Démarrer les Serveurs

**Terminal 1 - Backend :**
```bash
cd server
npm run dev
```
Le serveur démarre sur `http://localhost:3000`

**Terminal 2 - Frontend :**
```bash
cd client
npm run dev
```
L'application démarre sur `http://localhost:5173`

### Étape 5 : Se Connecter

1. Ouvrir `http://localhost:5173`
2. Utiliser les identifiants :
   - **Email :** `ZENOBEGLOBE`
   - **Mot de passe :** `Zenobeglobe2025`
3. Vous serez redirigé vers le dashboard Super-Administrateur

## 📋 Identifiants Super-Admin

- **Email :** `ZENOBEGLOBE`
- **Mot de passe :** `Zenobeglobe2025`

> ⚠️ **Important :** Changez ces identifiants en production !

## 🔧 Structure des Routes

### Routes Publiques
- `/login` - Page de connexion

### Routes Protégées
- `/dashboard` - Redirige selon le rôle
- `/superadmin` - Dashboard Super-Admin (SUPER_ADMIN uniquement)

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans `.env`
- Testez la connexion avec : `psql -U votre_utilisateur -d expression_d_or`

### Erreur CORS
- Vérifiez que `CORS_ORIGINS` dans `.env` inclut `http://localhost:5173`
- Redémarrez le serveur backend

### Token invalide
- Vérifiez que `JWT_SECRET` est défini dans `.env`
- Videz le localStorage du navigateur

### Le super-admin n'existe pas
- Exécutez : `npm run db:seed` dans le dossier `server/`

## 📝 Prochaines Étapes

- [ ] Créer les interfaces de gestion des comptes Admin
- [ ] Implémenter la gestion des rôles et permissions
- [ ] Ajouter les dashboards pour les autres rôles
- [ ] Implémenter le changement de mot de passe
- [ ] Ajouter la récupération de mot de passe


