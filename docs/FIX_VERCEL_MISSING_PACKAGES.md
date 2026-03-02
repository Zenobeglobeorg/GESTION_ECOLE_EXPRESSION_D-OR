# 🔧 Résolution : Erreur "Cannot find package '@vitejs/plugin-react'" sur Vercel

## Problème

Lors du déploiement sur Vercel, vous obtenez l'erreur :
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@vitejs/plugin-react'
```

## Cause

Les packages `vite` et `@vitejs/plugin-react` étaient dans `devDependencies`, mais Vercel n'installe pas toujours les `devDependencies` lors du build, même si elles sont nécessaires pour construire l'application.

## ✅ Solution Appliquée

### Déplacement des packages de build vers `dependencies`

Les packages nécessaires pour le build ont été déplacés de `devDependencies` vers `dependencies` :

**Packages déplacés :**
- `vite` - Le bundler principal
- `@vitejs/plugin-react` - Plugin React pour Vite

**Pourquoi ?**
- Ces packages sont **nécessaires pour le build de production**
- Vercel installe toujours les `dependencies`, garantissant leur disponibilité
- C'est une pratique recommandée pour les outils de build

### Modification de la commande d'installation

La commande d'installation dans `vercel.json` a été changée de `npm ci` à `npm install` pour s'assurer que tous les packages sont correctement installés.

## 📝 Structure Finale

### `dependencies` (installées en production)
- Packages nécessaires au runtime ET au build
- `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, etc.

### `devDependencies` (installées seulement en développement)
- Outils de développement uniquement
- `typescript`, `eslint`, `@types/*`, etc.

## 🚀 Prochaines Étapes

1. **Commitez les changements** :
   ```bash
   git add client/package.json client/vercel.json
   git commit -m "Fix: Move vite and plugin-react to dependencies for Vercel build"
   git push
   ```

2. **Vercel redéploiera automatiquement**

3. **Vérifiez le build** - Il devrait maintenant réussir

## ✅ Vérification

Après le redéploiement, le build devrait :
- ✅ Installer tous les packages nécessaires
- ✅ Trouver `@vitejs/plugin-react`
- ✅ Construire l'application avec succès

## 💡 Bonnes Pratiques

Pour les projets Vercel/Vite :
- **dependencies** : Packages nécessaires au runtime ET au build (vite, plugins, etc.)
- **devDependencies** : Outils de développement uniquement (typescript, eslint, etc.)

Cela garantit que tous les packages nécessaires au build sont disponibles lors du déploiement.

---

## 🔍 Alternative (si le problème persiste)

Si vous préférez garder ces packages en `devDependencies`, vous pouvez forcer l'installation en modifiant `vercel.json` :

```json
{
  "installCommand": "npm install --include=dev"
}
```

Mais la solution recommandée est de les mettre dans `dependencies` car ils sont nécessaires pour le build.

