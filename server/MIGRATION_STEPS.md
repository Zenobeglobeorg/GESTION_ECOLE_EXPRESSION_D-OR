# 📝 Étapes pour Appliquer le Changement d'ID (String → Int)

## 🎯 Méthode Recommandée : Reset Complet (Développement)

### Étape 1 : Arrêter les serveurs
```bash
# Arrêtez le serveur backend (Ctrl+C)
```

### Étape 2 : Supprimer les migrations existantes
```bash
cd server
rm -rf prisma/migrations
```

### Étape 3 : Générer le client Prisma
```bash
npm run db:generate
```

### Étape 4 : Créer une nouvelle migration
```bash
npx prisma migrate dev --name init_with_int_id
```
Quand Prisma vous demande si vous voulez réinitialiser la base de données, répondez **Oui (Yes)**.

### Étape 5 : Créer le super-admin
```bash
npm run db:seed
```

### Étape 6 : Vérifier
```bash
# Ouvrir Prisma Studio pour vérifier
npm run db:studio
```

Vous devriez voir que l'ID est maintenant un nombre (1, 2, 3...) au lieu d'une chaîne.

## ✅ Résultat Attendu

- L'ID dans la table `users` sera maintenant un `INT` avec auto-increment
- Le super-admin aura l'ID `1`
- Le type TypeScript dans le frontend a été mis à jour pour utiliser `number`

## 🔄 Commandes en Une Ligne (Windows PowerShell)

```powershell
cd server; Remove-Item -Recurse -Force prisma/migrations; npm run db:generate; npx prisma migrate dev --name init_with_int_id; npm run db:seed
```

## ⚠️ Important

- **Toutes les données existantes seront perdues** avec cette méthode
- C'est normal en développement, mais ne faites jamais ça en production sans sauvegarde !

## 🚀 Après la Migration

1. Redémarrer le serveur backend : `npm run dev`
2. Tester la connexion avec : `ZENOBEGLOBE` / `Zenobeglobe2025`
3. Vérifier que tout fonctionne correctement

