# 🚨 Résolution du Problème : ERR_CONNECTION_REFUSED

## Problème

Votre frontend déployé sur Vercel essaie de se connecter à `localhost:3000` au lieu de votre backend Railway.

**Erreur typique :**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
POST http://localhost:3000/api/auth/login
```

## Cause

La variable d'environnement `VITE_API_URL` n'est pas configurée dans Vercel, ou le projet n'a pas été redéployé après l'ajout de la variable.

## ✅ Solution Rapide (3 étapes)

### 1. Configurer la Variable dans Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Ajoutez :
   - **Key** : `VITE_API_URL`
   - **Value** : `https://votre-backend.up.railway.app` (remplacez par votre URL Railway)
   - **Environments** : Cochez tout (Production, Preview, Development)
5. **Save**

### 2. Redéployer (OBLIGATOIRE)

1. Allez dans **Deployments**
2. Cliquez sur **⋯** (3 points) du dernier déploiement
3. **Redeploy**
4. Attendez la fin du build

### 3. Vérifier

1. Ouvrez votre app déployée
2. Ouvrez la console (F12)
3. Les requêtes doivent aller vers votre URL Railway, pas `localhost:3000`

---

## 🔍 Comment Vérifier l'URL du Backend Railway

1. Allez sur [railway.app](https://railway.app)
2. Sélectionnez votre projet backend
3. L'URL est affichée en haut (ex: `https://votre-app.up.railway.app`)
4. Testez : `https://votre-app.up.railway.app/health`

---

## 📋 Checklist

- [ ] Variable `VITE_API_URL` ajoutée dans Vercel
- [ ] Valeur = URL complète du backend Railway (avec `https://`)
- [ ] Tous les environnements cochés (Production, Preview, Development)
- [ ] Projet redéployé après l'ajout de la variable
- [ ] Backend Railway accessible (test `/health`)
- [ ] CORS configuré dans Railway avec l'URL Vercel

---

## 🐛 Si ça ne fonctionne toujours pas

### Vérification 1 : URL du Backend
```bash
# Testez dans votre navigateur
https://votre-backend.up.railway.app/health
# Doit retourner : {"status":"ok","message":"Expression d'Or API is running"}
```

### Vérification 2 : CORS dans Railway
Dans Railway, vérifiez que `CORS_ORIGINS` contient :
```
https://votre-app.vercel.app,http://localhost:5173
```

### Vérification 3 : Logs Vercel
Dans Vercel → Deployments → Votre déploiement → Build Logs
Vérifiez qu'il n'y a pas d'erreurs de build.

### Vérification 4 : Console Navigateur
Ouvrez la console (F12) et vérifiez :
- Les requêtes doivent aller vers Railway, pas localhost
- Pas d'erreurs CORS
- Pas d'erreurs 404

---

## 💡 Astuce : Debug Temporaire

Ajoutez temporairement dans `client/src/services/authService.ts` :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('🔍 API URL:', API_BASE_URL); // Debug
```

Cela vous permettra de voir quelle URL est utilisée dans la console du navigateur.

---

## 📞 Besoin d'aide ?

1. Vérifiez les logs Railway et Vercel
2. Vérifiez que toutes les variables sont correctes
3. Consultez `VERCEL_ENV_SETUP.md` pour plus de détails

