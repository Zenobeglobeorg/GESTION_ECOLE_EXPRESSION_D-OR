# 📦 Fichiers de Configuration Créés

## Pour Vercel (Frontend)

- ✅ `client/vercel.json` - Configuration Vercel pour le déploiement automatique

## Pour Railway (Backend)

- ✅ `server/railway.json` - Configuration Railway
- ✅ `server/Procfile` - Commande de démarrage pour Railway
- ✅ `server/railway-setup.sh` - Script d'aide pour la configuration

## Documentation

- ✅ `DEPLOYMENT_GUIDE.md` - Guide complet et détaillé
- ✅ `QUICK_DEPLOY.md` - Guide rapide en 5 minutes

## Variables d'Environnement

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=votre_secret
CORS_ORIGINS=https://votre-app.vercel.app
PORT=3000
```

### Frontend (Vercel)
```env
VITE_API_URL=https://votre-backend.up.railway.app
```

---

## 🚀 Démarrage Rapide

1. **Backend** : Suivez `DEPLOYMENT_GUIDE.md` Partie 1
2. **Frontend** : Suivez `DEPLOYMENT_GUIDE.md` Partie 2
3. **CORS** : Mettez à jour `CORS_ORIGINS` dans Railway

---

## ⚠️ Important

- Ne commitez jamais vos fichiers `.env`
- Utilisez les variables d'environnement des plateformes
- Testez toujours après chaque déploiement

