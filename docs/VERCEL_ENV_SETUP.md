# 🔧 Configuration des Variables d'Environnement sur Vercel

## Problème : `ERR_CONNECTION_REFUSED` sur `localhost:3000`

Si vous voyez cette erreur, c'est que la variable d'environnement `VITE_API_URL` n'est pas configurée dans Vercel.

## ✅ Solution : Configurer VITE_API_URL dans Vercel

### Étape 1 : Accéder aux Variables d'Environnement

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**

### Étape 2 : Ajouter la Variable

1. Cliquez sur **"Add New"**
2. **Key** : `VITE_API_URL`
3. **Value** : L'URL de votre backend Railway (ex: `https://votre-app.up.railway.app`)
4. **Environments** : Cochez **Production**, **Preview**, et **Development**
5. Cliquez sur **Save**

### Étape 3 : Redéployer

**IMPORTANT** : Après avoir ajouté/modifié une variable d'environnement, vous **DEVEZ** redéployer :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Attendez que le déploiement se termine

### Étape 4 : Vérifier

1. Ouvrez votre application déployée
2. Ouvrez la console du navigateur (F12)
3. Vérifiez que les requêtes vont vers votre URL Railway et non `localhost:3000`

---

## 🔍 Vérification dans le Code

Pour vérifier que la variable est bien chargée, vous pouvez temporairement ajouter dans votre code :

```typescript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

Cela devrait afficher l'URL de votre backend Railway, pas `localhost:3000`.

---

## ⚠️ Points Importants

1. **Les variables Vite doivent commencer par `VITE_`** - C'est obligatoire
2. **Redéployez après chaque modification** - Les variables sont intégrées au moment du build
3. **Pas d'espaces dans la valeur** - L'URL doit être exacte
4. **Pas de slash final** - `https://api.example.com` et non `https://api.example.com/`

---

## 🐛 Dépannage

### Le problème persiste après redéploiement ?

1. **Vérifiez l'orthographe** : `VITE_API_URL` (en majuscules)
2. **Vérifiez l'URL** : Elle doit être accessible (testez dans votre navigateur)
3. **Vérifiez les logs de build** : Dans Vercel, regardez les logs du build
4. **Videz le cache** : Essayez en navigation privée

### Comment voir les variables dans le build ?

Dans les logs de build Vercel, vous ne verrez pas les valeurs (pour la sécurité), mais vous verrez si elles sont présentes.

---

## 📝 Exemple de Configuration

```
Key: VITE_API_URL
Value: https://expression-or-backend.up.railway.app
Environments: ✅ Production, ✅ Preview, ✅ Development
```

---

## 🔗 Liens Utiles

- [Documentation Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentation Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

