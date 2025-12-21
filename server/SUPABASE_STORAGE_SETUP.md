# 📦 Configuration Supabase Storage

Ce guide explique comment configurer Supabase Storage pour remplacer le stockage local avec multer.

## 🎯 Avantages de Supabase Storage

- ✅ Stockage cloud scalable
- ✅ Pas de limitation d'espace disque local
- ✅ Accès sécurisé avec URLs signées
- ✅ Sauvegarde automatique
- ✅ Gestion des versions de fichiers

## 📋 Prérequis

1. Un compte [Supabase](https://supabase.com) (gratuit)
2. Un projet Supabase créé

## 🚀 Configuration

### Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et votre **Service Role Key**

### Étape 2 : Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `server/.env` :

```env
# Supabase Storage
SUPABASE_URL="https://votre-projet.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="votre-service-role-key-ici"
```

**Où trouver ces valeurs :**
- `SUPABASE_URL` : Dans votre projet Supabase → Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` : Dans votre projet Supabase → Settings → API → Service Role Key (⚠️ gardez cette clé secrète !)

### Étape 3 : Créer le bucket dans Supabase

1. Allez dans votre projet Supabase
2. Naviguez vers **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Nommez-le `bulletins`
5. Cochez **Public bucket** si vous voulez que les fichiers soient accessibles publiquement (recommandé: **non** pour la sécurité)
6. Cliquez sur **Create bucket**

### Étape 4 : Configurer les politiques de sécurité (optionnel)

Pour plus de sécurité, vous pouvez configurer des politiques RLS (Row Level Security) :

1. Allez dans **Storage** → **Policies**
2. Créez une politique pour le bucket `bulletins` :
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'bulletins'::text)
     ```

## 🔧 Utilisation

Une fois configuré, le système utilisera automatiquement Supabase Storage :

1. **Upload automatique** : Les fichiers Excel uploadés sont automatiquement sauvegardés dans Supabase Storage
2. **Traitement** : Le fichier est téléchargé depuis Supabase pour traitement
3. **Conservation** : Le fichier reste dans Supabase pour référence future

## ⚠️ Mode de fallback

Si Supabase Storage n'est **pas configuré** (variables d'environnement manquantes), le système fonctionnera toujours en utilisant le buffer en mémoire. Un avertissement sera affiché dans les logs.

## 📝 Notes importantes

- Les fichiers sont stockés dans le dossier `imports/` du bucket `bulletins`
- Les noms de fichiers incluent un timestamp pour éviter les collisions
- Les fichiers peuvent être supprimés automatiquement après traitement (code commenté dans le contrôleur)
- La taille maximale des fichiers est de 10MB (configurable dans multer)

## 🧪 Test

Pour tester la configuration :

1. Assurez-vous que les variables d'environnement sont définies
2. Redémarrez le serveur backend
3. Uploadez un fichier Excel via l'interface
4. Vérifiez dans Supabase Storage que le fichier apparaît dans le bucket `bulletins`

## 🔍 Dépannage

**Erreur : "Supabase Storage n'est pas configuré"**
- Vérifiez que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont définis dans `.env`
- Redémarrez le serveur après avoir ajouté les variables

**Erreur : "Bucket already exists"**
- C'est normal, le bucket existe déjà. Le système continuera à fonctionner.

**Fichiers non visibles dans Supabase**
- Vérifiez que le bucket `bulletins` existe
- Vérifiez les permissions du bucket
- Consultez les logs du serveur pour plus de détails



