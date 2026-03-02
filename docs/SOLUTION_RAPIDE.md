# ⚡ Solution Rapide : ERR_CONNECTION_REFUSED

## Le Problème

Votre app Vercel essaie de se connecter à `localhost:3000` au lieu de Railway.

## La Solution (2 minutes)

### 1. Ajouter la Variable dans Vercel

1. [vercel.com/dashboard](https://vercel.com/dashboard) → Votre projet
2. **Settings** → **Environment Variables**
3. **Add New** :
   - Key: `VITE_API_URL`
   - Value: `https://votre-backend.up.railway.app` (votre URL Railway)
   - Environments: ✅ Production ✅ Preview ✅ Development
4. **Save**

### 2. Redéployer (OBLIGATOIRE !)

1. **Deployments** → Cliquez sur **⋯** du dernier déploiement
2. **Redeploy**
3. Attendez

### 3. Tester

Ouvrez votre app → Console (F12) → Les requêtes doivent aller vers Railway

---

## 🔍 Trouver l'URL Railway

1. [railway.app](https://railway.app) → Votre projet
2. L'URL est en haut (ex: `https://xxx.up.railway.app`)
3. Testez : `https://xxx.up.railway.app/health`

---

## ✅ C'est tout !

Si ça ne marche pas, consultez `FIX_DEPLOYMENT_ISSUE.md`

