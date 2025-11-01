# 🔄 Guide de Migration - Changement de Type d'ID

## ⚠️ Important

Vous avez changé le type de l'ID de `String` (cuid) à `Int` (autoincrement). C'est un changement **critique** qui nécessite une migration des données.

## 🎯 Option 1 : Migration Reset (Recommandé en développement)

Si vous êtes en **développement** et que vous pouvez **perdre les données existantes**, utilisez cette méthode :

```bash
cd server

# 1. Réinitialiser complètement la base de données
npm run db:migrate reset

# 2. Recréer le super-admin
npm run db:seed
```

Cette commande va :
- Supprimer toutes les données
- Supprimer toutes les migrations
- Recréer la base de données avec le nouveau schéma
- Appliquer toutes les migrations depuis le début

## 🔧 Option 2 : Migration Manuelle (Si vous voulez préserver les données)

Si vous êtes en **production** ou voulez **préserver les données**, vous devez créer une migration manuelle :

```bash
cd server

# 1. Créer une nouvelle migration avec un nom descriptif
npx prisma migrate dev --name change_user_id_to_int --create-only

# 2. Modifier le fichier SQL de migration généré dans prisma/migrations/
# Pour ajouter la logique de conversion des données

# 3. Appliquer la migration
npx prisma migrate deploy
```

### Exemple de migration SQL personnalisée

Dans le fichier de migration, vous devrez ajouter quelque chose comme :

```sql
-- Créer une nouvelle table avec le bon schéma
CREATE TABLE "users_new" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Copier les données (sans l'ID car il sera auto-généré)
INSERT INTO "users_new" ("email", "passwordHash", "firstName", "lastName", "phone", "role", "createdAt", "updatedAt")
SELECT "email", "passwordHash", "firstName", "lastName", "phone", "role", "createdAt", "updatedAt"
FROM "users";

-- Supprimer l'ancienne table
DROP TABLE "users";

-- Renommer la nouvelle table
ALTER TABLE "users_new" RENAME TO "users";
```

## ✅ Option 3 : Migration Automatique (Solution simple pour développement)

Si vous êtes sûr de vouloir tout réinitialiser :

```bash
cd server

# Supprimer les migrations existantes
rm -rf prisma/migrations

# Créer une nouvelle migration initiale avec le nouveau schéma
npx prisma migrate dev --name init_with_int_id

# Recréer le super-admin
npm run db:seed
```

## 📋 Après la Migration

1. **Mettre à jour le code TypeScript** si nécessaire :
   - L'ID sera maintenant un `number` au lieu d'un `string`
   - Vérifier tous les endroits où l'ID est utilisé

2. **Vérifier le schéma** :
   ```bash
   npx prisma studio
   ```

3. **Tester la connexion** :
   - Redémarrer le serveur backend
   - Tester la connexion avec les nouveaux identifiants

## 🚨 Attention

- Si vous avez des relations avec d'autres tables qui référencent `User.id`, elles devront aussi être mises à jour
- Les IDs existants seront perdus si vous faites un reset
- En production, faites toujours une sauvegarde avant une migration

