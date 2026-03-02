# 🚀 Guide Rapide de Déploiement

## Déploiement en 5 minutes

### Backend sur Railway

1. **Connectez-vous à Railway** : [railway.app](https://railway.app)
2. **Nouveau Projet** → **Deploy from GitHub repo**
3. **Sélectionnez votre repo** et choisissez le dossier `server`
4. **Ajoutez les variables d'environnement** :
   ```
   DATABASE_URL=votre_url_supabase
   JWT_SECRET=votre_secret_jwt
   CORS_ORIGINS=https://votre-app.vercel.app
   PORT=3000
   ```
5. **Notez l'URL Railway** : `https://votre-app.up.railway.app`

### Frontend sur Vercel

1. **Connectez-vous à Vercel** : [vercel.com](https://vercel.com)
2. **New Project** → Importez votre repo GitHub
3. **Root Directory** : `client`
4. **Environment Variable** :
   ```
   VITE_API_URL=https://votre-app.up.railway.app
   ```
5. **Deploy** → Votre app est en ligne !

### Mise à jour CORS

Retournez sur Railway et mettez à jour :
```
CORS_ORIGINS=https://votre-app.vercel.app
```

**C'est tout ! 🎉**

Pour plus de détails, consultez `DEPLOYMENT_GUIDE.md`

