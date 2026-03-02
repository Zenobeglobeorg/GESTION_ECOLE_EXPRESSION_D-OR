# 📧 Guide de Configuration Email

## Problème : Email non envoyé, mot de passe dans la console

Si vous voyez le mot de passe dans la console au lieu de recevoir un email, c'est soit :
1. **SMTP n'est pas configuré** dans votre fichier `.env`
2. **Erreur SSL** : "self-signed certificate in certificate chain"
3. **Problème d'authentification** avec Gmail

## ✅ Solution : Configurer SMTP

### Étape 1 : Créer/Modifier `server/.env`

Ajoutez ces lignes dans votre fichier `server/.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Étape 2 : Configuration Gmail

1. **Activez l'authentification à 2 facteurs** sur votre compte Gmail
   - Allez sur https://myaccount.google.com/security
   - Activez "Validation en deux étapes"

2. **Générez un "Mot de passe d'application"** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Courrier" et "Autre (nom personnalisé)"
   - Entrez "Expression d'Or" comme nom
   - Cliquez sur "Générer"
   - **Copiez le mot de passe généré** (16 caractères sans espaces)

3. **Utilisez ce mot de passe** dans `SMTP_PASS` :
   ```env
   SMTP_PASS=abcd efgh ijkl mnop
   ```
   (Sans les espaces, ou avec les espaces, selon le format)

### Étape 3 : Redémarrer le serveur

Après avoir modifié `.env`, **redémarrez votre serveur backend** (IMPORTANT) :

```bash
cd server
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

**⚠️ Si vous avez l'erreur "self-signed certificate" :**
1. **Arrêtez complètement le serveur** (Ctrl+C)
2. **Redémarrez-le** avec `npm run dev`
3. La configuration TLS a été mise à jour pour ignorer cette erreur en développement

**Alternative si le problème persiste :**
- Utilisez le **port 465 avec secure: true** dans `.env` :
  ```env
  SMTP_PORT=465
  ```
  (Et modifiez `secure: true` dans `emailService.js` si nécessaire)

## 🔍 Vérification

Après avoir configuré SMTP et créé un nouvel élève, vous devriez voir dans la console :

```
✅ Email envoyé avec succès à parent@example.com
   Message ID: <xxx@xxx.com>
```

Si vous voyez toujours :
```
⚠️ Email non envoyé (SMTP non configuré dans .env)
📧 [DEV] Email de bienvenue pour parent@example.com:
   Mot de passe temporaire: xxxxxx
```

→ Vérifiez que :
1. Les variables sont bien dans `server/.env` (pas dans `client/.env`)
2. Le serveur a été redémarré après modification
3. Il n'y a pas d'espaces avant/après les valeurs dans `.env`

## 🔧 Autres Services Email

### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailtrap (pour tests)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

## 🐛 Dépannage

### Erreur "EAUTH" (Authentification échouée)
- Vérifiez que `SMTP_USER` et `SMTP_PASS` sont corrects
- Pour Gmail, utilisez un "Mot de passe d'application", pas votre mot de passe normal
- Vérifiez qu'il n'y a pas d'espaces dans les valeurs

### Erreur "ECONNECTION" (Connexion échouée)
- Vérifiez `SMTP_HOST` et `SMTP_PORT`
- Vérifiez votre connexion internet
- Vérifiez les pare-feu

### Email toujours dans la console
- Vérifiez que le fichier `.env` est dans `server/` (pas `client/`)
- Redémarrez le serveur après modification
- Vérifiez les logs de la console pour voir l'erreur exacte

## 📝 Exemple de fichier .env complet

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expression_or?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000

# CORS
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
FRONTEND_URL=http://localhost:5173
```

## ✅ Test

Pour tester la configuration, créez un nouvel élève avec un email de parent. Vous devriez recevoir l'email automatiquement.

Si ça ne fonctionne toujours pas, vérifiez les logs de la console du serveur pour voir l'erreur exacte.

