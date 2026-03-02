# 🔧 Résolution : Erreur CORS "No 'Access-Control-Allow-Origin' header"

## Problème

L'erreur CORS indique que votre backend Railway n'autorise pas les requêtes depuis votre frontend Vercel :

```
Access to fetch at 'https://gestionecoleexpressiond-or-production.up.railway.app/api/auth/login' 
from origin 'https://gestion-ecole-expression-d-or.vercel.app' 
has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

## Cause

La variable d'environnement `CORS_ORIGINS` dans Railway ne contient pas l'URL de votre frontend Vercel, ou elle est mal formatée.

## ✅ Solution

### Étape 1 : Trouver l'URL de votre Frontend Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. L'URL de production est affichée (ex: `https://gestion-ecole-expression-d-or.vercel.app`)
4. **Copiez cette URL exacte**

### Étape 2 : Configurer CORS dans Railway

1. Allez sur [railway.app](https://railway.app)
2. Sélectionnez votre projet backend
3. Allez dans l'onglet **"Variables"** (ou **"Environment Variables"**)
4. Trouvez la variable `CORS_ORIGINS`
5. **Modifiez sa valeur** pour inclure votre URL Vercel :

```
https://gestion-ecole-expression-d-or.vercel.app,http://localhost:5173
```

**⚠️ IMPORTANT :**
- ✅ Séparer les URLs par des **virgules** (pas d'espaces)
- ✅ Inclure `https://` pour l'URL Vercel
- ✅ Inclure `http://localhost:5173` pour le développement local
- ✅ Pas de slash `/` à la fin des URLs
- ✅ Pas d'espaces autour des virgules

6. **Save**

### Étape 3 : Redéployer Railway (OBLIGATOIRE)

Après avoir modifié les variables d'environnement, Railway doit redéployer :

1. Railway redéploie automatiquement après la modification des variables
2. **OU** allez dans l'onglet **"Deployments"**
3. Cliquez sur **"Redeploy"** si nécessaire
4. Attendez que le déploiement se termine

### Étape 4 : Vérifier

1. Testez votre application Vercel
2. Ouvrez la console (F12)
3. Les requêtes doivent maintenant passer sans erreur CORS

---

## 📝 Format Correct de CORS_ORIGINS

### ✅ Correct
```
https://gestion-ecole-expression-d-or.vercel.app,http://localhost:5173
```

### ✅ Correct (avec plusieurs environnements)
```
https://gestion-ecole-expression-d-or.vercel.app,https://gestion-ecole-expression-d-or-git-main.vercel.app,http://localhost:5173
```

### ❌ Incorrect (ne fonctionnera pas)
```
gestion-ecole-expression-d-or.vercel.app,localhost:5173
```
```
https://gestion-ecole-expression-d-or.vercel.app/,http://localhost:5173/
```
```
https://gestion-ecole-expression-d-or.vercel.app , http://localhost:5173
```
```
https://gestion-ecole-expression-d-or.vercel.app
http://localhost:5173
```

---

## 🔍 Vérification de la Configuration CORS

### Option 1 : Vérifier dans les Logs Railway

1. Allez dans Railway → Votre projet → **Logs**
2. Redémarrez le service si nécessaire
3. Vérifiez que le serveur démarre sans erreur
4. Les logs devraient montrer les origines CORS configurées

### Option 2 : Tester avec curl

Testez depuis votre terminal :

```bash
curl -H "Origin: https://gestion-ecole-expression-d-or.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://gestionecoleexpressiond-or-production.up.railway.app/api/auth/login \
     -v
```

Vous devriez voir dans les headers de réponse :
```
Access-Control-Allow-Origin: https://gestion-ecole-expression-d-or.vercel.app
```

---

## 🐛 Dépannage

### Le problème persiste après redéploiement ?

1. **Vérifiez l'orthographe de l'URL** - Elle doit être exactement la même que dans Vercel
2. **Vérifiez qu'il n'y a pas d'espaces** - Les URLs doivent être séparées par des virgules sans espaces
3. **Vérifiez que Railway a bien redéployé** - Regardez les logs pour confirmer
4. **Vérifiez le code CORS** - Assurez-vous que le serveur utilise bien `CORS_ORIGINS`

### Comment voir la configuration CORS actuelle ?

Dans Railway, allez dans **Variables** et vérifiez la valeur de `CORS_ORIGINS`. Elle doit contenir votre URL Vercel.

---

## 📋 Checklist

- [ ] URL Vercel copiée exactement (avec `https://`)
- [ ] `CORS_ORIGINS` dans Railway contient l'URL Vercel
- [ ] URLs séparées par des virgules (pas d'espaces)
- [ ] Pas de slash `/` à la fin des URLs
- [ ] Railway redéployé après modification
- [ ] Backend accessible (test `/health`)
- [ ] Requêtes passent sans erreur CORS

---

## 💡 Configuration Recommandée

Pour un environnement de production avec plusieurs environnements Vercel :

```
https://gestion-ecole-expression-d-or.vercel.app,https://gestion-ecole-expression-d-or-git-main.vercel.app,https://gestion-ecole-expression-d-or-git-*.vercel.app,http://localhost:5173
```

Cela autorise :
- ✅ Production Vercel
- ✅ Preview deployments Vercel
- ✅ Développement local

---

## 🔗 Vérification du Code CORS

Assurez-vous que votre `server/src/server.js` utilise bien `CORS_ORIGINS` :

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
```

Si ce n'est pas le cas, vous devrez peut-être mettre à jour le code.

---

## 📞 Besoin d'aide ?

Si le problème persiste :
1. Vérifiez les logs Railway pour voir les erreurs
2. Vérifiez que le serveur démarre correctement
3. Testez l'endpoint `/health` pour confirmer que le backend est accessible
4. Vérifiez que la variable `CORS_ORIGINS` est bien lue par le serveur

