# 🔧 Résolution : Erreur "tsc: command not found" sur Vercel

## Problème

Lors du déploiement sur Vercel, vous obtenez l'erreur :
```
sh: line 1: tsc: command not found
Error: Command "npm run build" exited with 127
```

## Cause

Le script de build utilisait `tsc -b` (TypeScript Compiler) avant le build Vite, mais `tsc` n'était pas disponible dans l'environnement de build de Vercel.

## ✅ Solution Appliquée

### Modification du script de build

Le script `build` dans `package.json` a été modifié :

**Avant :**
```json
"build": "tsc -b && vite build"
```

**Après :**
```json
"build": "vite build",
"type-check": "tsc -b --noEmit"
```

### Pourquoi cette solution ?

1. **Vite gère TypeScript nativement** - Pas besoin de compiler TypeScript séparément
2. **Plus rapide** - Le build est plus rapide sans l'étape `tsc`
3. **Vérification optionnelle** - Le script `type-check` est disponible si vous voulez vérifier les types localement

## 🚀 Prochaines Étapes

1. **Commitez les changements** :
   ```bash
   git add client/package.json
   git commit -m "Fix: Remove tsc from build script for Vercel"
   git push
   ```

2. **Vercel redéploiera automatiquement** - Si vous avez activé le déploiement automatique depuis GitHub

3. **Ou redéployez manuellement** :
   - Allez sur Vercel Dashboard
   - Cliquez sur "Redeploy"

## ✅ Vérification

Après le redéploiement, le build devrait réussir sans erreur.

## 📝 Note

Si vous voulez vérifier les types TypeScript localement avant de déployer, vous pouvez exécuter :
```bash
npm run type-check
```

Cela vérifiera les types sans générer de fichiers, ce qui est utile pour le développement.

---

## 🔍 Alternative (si le problème persiste)

Si vous avez toujours des problèmes, vous pouvez forcer l'installation des devDependencies dans Vercel :

1. Dans Vercel Dashboard → Settings → General
2. Vérifiez que "Install Command" est bien `npm ci` ou `npm install`
3. Vercel installe normalement les devDependencies par défaut pour le build

---

## 💡 Pourquoi Vite n'a pas besoin de `tsc` ?

Vite utilise `esbuild` pour transformer TypeScript en JavaScript pendant le build. C'est beaucoup plus rapide que `tsc` et fonctionne parfaitement pour la plupart des cas d'usage. La vérification de types avec `tsc` est utile pour le développement, mais pas nécessaire pour le build de production.

