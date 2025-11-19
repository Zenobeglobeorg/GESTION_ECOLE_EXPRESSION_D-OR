# Guide de Déploiement - Expression d'Or

Ce guide vous explique comment déployer votre application sur **Vercel** (frontend) et **Railway** (backend).

## 📋 Prérequis

- Un compte GitHub avec votre projet
- Un compte [Vercel](https://vercel.com) (gratuit)
- Un compte [Railway](https://railway.app) (gratuit avec crédits)
- Une base de données PostgreSQL (Supabase recommandé)

---

## 🚀 Partie 1 : Déploiement du Backend sur Railway

### Étape 1.1 : Préparer Railway

1. Allez sur [railway.app](https://railway.app) et connectez-vous avec GitHub
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Choisissez votre repository `Expression_or`

### Étape 1.2 : Configurer le Service Backend

1. Railway va détecter automatiquement votre projet
2. Cliquez sur **"Add Service"** → **"GitHub Repo"**
3. Sélectionnez votre repo et choisissez le dossier **`server`** comme **Root Directory**
4. Railway va automatiquement détecter que c'est un projet Node.js

### Étape 1.3 : Configurer les Variables d'Environnement

Dans Railway, allez dans l'onglet **"Variables"** et ajoutez :

```env
# Port (Railway le définit automatiquement, mais on peut le garder)
PORT=3000

# Base de données PostgreSQL (Supabase)
DATABASE_URL=votre_url_supabase_ici

# JWT Secret (générez un secret fort)
JWT_SECRET=votre_secret_jwt_super_securise_ici

# CORS Origins (URL de votre frontend Vercel - à mettre à jour après déploiement)
CORS_ORIGINS=https://votre-app.vercel.app,http://localhost:5173

# Email Configuration (si vous utilisez l'envoi d'emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
EMAIL_FROM=noreply@expressiondor.com
```

**⚠️ Important :** 
- Remplacez `votre_url_supabase_ici` par votre vraie URL Supabase
- Générez un `JWT_SECRET` fort (vous pouvez utiliser : `openssl rand -base64 32`)
- Pour `CORS_ORIGINS`, vous devrez mettre à jour après avoir déployé le frontend

### Étape 1.4 : Configurer la Base de Données

1. Dans Railway, cliquez sur **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway créera automatiquement une base de données
3. Copiez l'URL de connexion (elle ressemble à : `postgresql://user:password@host:port/dbname`)
4. Ajoutez-la dans les variables d'environnement comme `DATABASE_URL`

**OU** utilisez Supabase (recommandé) :
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un projet
3. Copiez la connection string depuis Settings → Database
4. Ajoutez-la dans Railway comme `DATABASE_URL`

### Étape 1.5 : Exécuter les Migrations

1. Dans Railway, allez dans l'onglet **"Deployments"**
2. Cliquez sur le dernier déploiement
3. Ouvrez le **"View Logs"**
4. Dans l'onglet **"Variables"**, ajoutez une variable temporaire pour exécuter les migrations :

```env
RAILWAY_ENVIRONMENT=production
```

5. Dans l'onglet **"Settings"** → **"Deploy"**, ajoutez un **"Deploy Hook"**
6. Utilisez Railway CLI ou créez un script de déploiement :

**Option A : Via Railway CLI**
```bash
# Installez Railway CLI
npm i -g @railway/cli

# Connectez-vous
railway login

# Liez votre projet
railway link

# Exécutez les migrations
railway run npx prisma migrate deploy
```

**Option B : Via Script de Build**
Modifiez `server/package.json` pour ajouter :
```json
"scripts": {
  "postinstall": "prisma generate",
  "deploy": "prisma migrate deploy && npm start"
}
```

### Étape 1.6 : Obtenir l'URL du Backend

1. Une fois déployé, Railway vous donnera une URL comme : `https://votre-app.up.railway.app`
2. **Notez cette URL** - vous en aurez besoin pour le frontend
3. Testez l'endpoint de santé : `https://votre-app.up.railway.app/health`

---

## 🎨 Partie 2 : Déploiement du Frontend sur Vercel

### Étape 2.1 : Préparer Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous avec GitHub
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre repository `Expression_or`

### Étape 2.2 : Configurer le Projet

1. Dans **"Root Directory"**, sélectionnez **`client`**
2. Vercel détectera automatiquement Vite
3. Les paramètres suivants seront automatiquement configurés :
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Étape 2.3 : Configurer les Variables d'Environnement

Dans **"Environment Variables"**, ajoutez :

```env
VITE_API_URL=https://votre-app.up.railway.app
```

**⚠️ Important :** Remplacez `https://votre-app.up.railway.app` par l'URL réelle de votre backend Railway.

### Étape 2.4 : Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va construire et déployer votre application
3. Une fois terminé, vous obtiendrez une URL comme : `https://votre-app.vercel.app`

### Étape 2.5 : Mettre à jour CORS dans Railway

1. Retournez sur Railway
2. Dans les **Variables d'environnement**, mettez à jour `CORS_ORIGINS` :
```env
CORS_ORIGINS=https://votre-app.vercel.app,https://votre-app.vercel.app,http://localhost:5173
```
3. Railway redéploiera automatiquement avec la nouvelle configuration

---

## 🔄 Partie 3 : Déploiements Automatiques

### GitHub Actions (Optionnel mais Recommandé)

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches: [main, master]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Railway se connecte automatiquement via GitHub
          echo "Backend déployé automatiquement sur Railway"
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client
```

---

## ✅ Vérification Post-Déploiement

### Backend (Railway)
- [ ] Testez : `https://votre-backend.railway.app/health`
- [ ] Vérifiez les logs dans Railway
- [ ] Vérifiez que les migrations ont été exécutées

### Frontend (Vercel)
- [ ] Testez : `https://votre-app.vercel.app`
- [ ] Vérifiez que les appels API fonctionnent
- [ ] Testez la connexion utilisateur

### Base de Données
- [ ] Vérifiez la connexion dans Railway
- [ ] Testez une requête depuis l'API

---

## 🐛 Dépannage

### Problème : CORS Error
**Solution :** Vérifiez que `CORS_ORIGINS` dans Railway contient l'URL exacte de Vercel (avec `https://`)

### Problème : API ne répond pas
**Solution :** 
1. Vérifiez les logs Railway
2. Vérifiez que `PORT` est bien défini
3. Vérifiez que `DATABASE_URL` est correct

### Problème : Build échoue sur Vercel
**Solution :**
1. Vérifiez que `Root Directory` est bien `client`
2. Vérifiez les logs de build dans Vercel
3. Assurez-vous que toutes les dépendances sont dans `package.json`

### Problème : Migrations non exécutées
**Solution :**
1. Connectez-vous à Railway CLI
2. Exécutez : `railway run npx prisma migrate deploy`
3. Ou ajoutez un script postinstall dans `package.json`

---

## 📝 Notes Importantes

1. **Sécurité :** Ne commitez jamais vos fichiers `.env` dans Git
2. **Variables d'environnement :** Utilisez toujours les variables d'environnement des plateformes
3. **Base de données :** Railway peut créer une DB PostgreSQL, mais Supabase est recommandé pour la production
4. **Domaine personnalisé :** Vous pouvez ajouter un domaine personnalisé dans Vercel et Railway

---

## 🔗 Liens Utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Railway](https://docs.railway.app)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Supabase](https://supabase.com/docs)

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Railway et Vercel
2. Consultez la documentation des plateformes
3. Vérifiez que toutes les variables d'environnement sont correctement configurées

Bon déploiement ! 🚀

