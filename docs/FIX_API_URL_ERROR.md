# 🔧 Résolution : Erreur "405 Method Not Allowed" - URL API Mal Formée

## Problème

L'URL de l'API est mal formée lors des requêtes :
```
POST https://gestion-ecole-expression-d-or.vercel.app/gestionecoleexpressiond-or-production.up.railway.app/api/auth/login
```

Au lieu de :
```
POST https://gestionecoleexpressiond-or-production.up.railway.app/api/auth/login
```

## Cause

La variable d'environnement `VITE_API_URL` dans Vercel est probablement :
- ❌ Sans le préfixe `https://`
- ❌ Avec un chemin relatif au lieu d'une URL absolue
- ❌ Vide ou mal formatée

## ✅ Solution

### Étape 1 : Vérifier l'URL de votre Backend Railway

1. Allez sur [railway.app](https://railway.app)
2. Sélectionnez votre projet backend
3. L'URL complète est affichée en haut (ex: `https://gestionecoleexpressiond-or-production.up.railway.app`)
4. **Copiez l'URL complète avec `https://`**

### Étape 2 : Corriger la Variable dans Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Trouvez `VITE_API_URL`
5. **Modifiez la valeur** pour qu'elle soit exactement :
   ```
   https://gestionecoleexpressiond-or-production.up.railway.app
   ```
   
   **⚠️ IMPORTANT :**
   - ✅ Commence par `https://`
   - ✅ Pas de slash `/` à la fin
   - ✅ Pas d'espaces
   - ✅ URL complète (pas relative)

6. **Save**

### Étape 3 : Redéployer (OBLIGATOIRE)

1. Allez dans **Deployments**
2. Cliquez sur **⋯** (3 points) du dernier déploiement
3. **Redeploy**
4. Attendez la fin du build

### Étape 4 : Vérifier

1. Ouvrez votre application déployée
2. Ouvrez la console (F12)
3. Les requêtes doivent maintenant aller vers :
   ```
   https://gestionecoleexpressiond-or-production.up.railway.app/api/auth/login
   ```
   Et non plus vers l'URL Vercel concaténée

---

## 🔍 Vérification de l'URL Railway

Testez votre backend directement dans le navigateur :
```
https://gestionecoleexpressiond-or-production.up.railway.app/health
```

Cela devrait retourner :
```json
{"status":"ok","message":"Expression d'Or API is running"}
```

Si cela ne fonctionne pas, votre backend Railway n'est pas accessible.

---

## 📝 Format Correct de VITE_API_URL

### ✅ Correct
```
https://gestionecoleexpressiond-or-production.up.railway.app
```

### ❌ Incorrect (ne fonctionnera pas)
```
gestionecoleexpressiond-or-production.up.railway.app
```
```
https://gestionecoleexpressiond-or-production.up.railway.app/
```
```
/gestionecoleexpressiond-or-production.up.railway.app
```
```
http://gestionecoleexpressiond-or-production.up.railway.app
```

---

## 🐛 Dépannage

### Le problème persiste après redéploiement ?

1. **Vérifiez les logs de build Vercel** - Regardez si la variable est bien chargée
2. **Vérifiez dans la console** - Ajoutez temporairement dans votre code :
   ```typescript
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```
   Cela vous montrera quelle URL est réellement utilisée

3. **Vérifiez CORS dans Railway** - Assurez-vous que `CORS_ORIGINS` contient :
   ```
   https://gestion-ecole-expression-d-or.vercel.app
   ```

### Comment voir la variable dans le build ?

Malheureusement, Vercel ne montre pas les valeurs des variables dans les logs (pour la sécurité), mais vous pouvez vérifier qu'elles sont présentes.

---

## 💡 Astuce : Debug Temporaire

Ajoutez temporairement dans `client/src/services/authService.ts` :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('🔍 API URL utilisée:', API_BASE_URL); // Debug
```

Cela vous permettra de voir exactement quelle URL est utilisée dans la console du navigateur.

---

## ✅ Checklist

- [ ] URL Railway testée et accessible (`/health`)
- [ ] `VITE_API_URL` dans Vercel commence par `https://`
- [ ] `VITE_API_URL` n'a pas de slash final
- [ ] `VITE_API_URL` est une URL complète (pas relative)
- [ ] Projet redéployé après modification
- [ ] CORS configuré dans Railway avec l'URL Vercel
- [ ] Requêtes dans la console vont vers Railway, pas Vercel

---

## 📞 Besoin d'aide ?

Si le problème persiste :
1. Vérifiez que votre backend Railway est bien déployé et accessible
2. Vérifiez les logs Railway pour voir si les requêtes arrivent
3. Vérifiez que CORS est correctement configuré

