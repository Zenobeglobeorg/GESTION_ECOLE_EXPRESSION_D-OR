# 📧 Guide : Configuration des Templates EmailJS

## ⚠️ Problème Courant

Les emails sont envoyés mais les liens ne fonctionnent pas :
- Le bouton "Se connecter" ne redirige pas
- Le bouton "Réinitialiser mon mot de passe" ne redirige pas
- Le lien texte n'apparaît pas

## 🔍 Cause

Avec EmailJS, le **template configuré dans le dashboard** remplace le HTML/text envoyé par le code. Les variables doivent être correctement configurées dans le template EmailJS.

## ✅ Solution : Configurer les Templates Correctement

### Template 1 : Email de Bienvenue (Identifiants Parent)

1. **EmailJS** → **Email Templates** → **Create New Template** (ou éditez l'existant)

2. **Nom** : `Bienvenue Expression d'Or`

3. **Subject** : `Bienvenue sur Expression d'Or - Vos identifiants de connexion`

4. **Content (HTML)** :
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue sur Expression d'Or</h1>
    </div>
    <div class="content">
      <p>Bonjour {{to_name}},</p>
      <p>Votre compte parent a été créé avec succès sur la plateforme de gestion de l'école Expression d'Or.</p>
      
      <div class="credentials">
        <h3>Vos identifiants de connexion :</h3>
        <p><strong>Email :</strong> {{to_email}}</p>
        <p><strong>Mot de passe temporaire :</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 16px;">{{password}}</code></p>
      </div>
      
      <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, veuillez changer ce mot de passe dès votre première connexion.</p>
      
      <p>Vous pouvez vous connecter en cliquant sur le bouton ci-dessous :</p>
      <a href="{{login_url}}" class="button">Se connecter</a>
      
      <p>Ou copiez-collez ce lien dans votre navigateur :</p>
      <p style="word-break: break-all; color: #2563eb;">{{login_url}}</p>
      
      <p>Si vous avez des questions, n'hésitez pas à contacter l'administration de l'école.</p>
      
      <div class="footer">
        <p>Expression d'Or - Plateforme de gestion scolaire</p>
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </div>
  </div>
</body>
</html>
```

5. **Variables utilisées** (doivent correspondre exactement) :
   - `{{to_name}}` - Nom du parent
   - `{{to_email}}` - Email du destinataire
   - `{{password}}` - Mot de passe temporaire
   - `{{login_url}}` - URL de connexion (ex: `https://gestion-ecole-expression-d-or.vercel.app/login`)

6. **Sauvegardez** et **notez le Template ID**

### Template 2 : Réinitialisation de Mot de Passe

1. **EmailJS** → **Email Templates** → **Create New Template**

2. **Nom** : `Réinitialisation Mot de Passe`

3. **Subject** : `Réinitialisation de votre mot de passe - Expression d'Or`

4. **Content (HTML)** :
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Réinitialisation de mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour {{to_name}},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe sur la plateforme Expression d'Or.</p>
      
      <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
      <a href="{{reset_url}}" class="button">Réinitialiser mon mot de passe</a>
      
      <p>Ou copiez-collez ce lien dans votre navigateur :</p>
      <p style="word-break: break-all; color: #2563eb;">{{reset_url}}</p>
      
      <div class="warning">
        <p><strong>⚠️ Important :</strong></p>
        <ul>
          <li>Ce lien est valide pendant <strong>1 heure</strong> uniquement</li>
          <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
          <li>Pour votre sécurité, ne partagez jamais ce lien</li>
        </ul>
      </div>
      
      <p>Si vous avez des questions, contactez l'administration de l'école.</p>
      
      <div class="footer">
        <p>Expression d'Or - Plateforme de gestion scolaire</p>
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </div>
  </div>
</body>
</html>
```

5. **Variables utilisées** :
   - `{{to_name}}` - Nom de l'utilisateur
   - `{{to_email}}` - Email du destinataire
   - `{{reset_url}}` - URL de réinitialisation avec token (ex: `https://gestion-ecole-expression-d-or.vercel.app/reset-password?token=abc123...`)

6. **Sauvegardez** et **notez le Template ID**

## 🔧 Configuration sur Railway

Assurez-vous que `FRONTEND_URL` est correctement configuré :

```
FRONTEND_URL = https://gestion-ecole-expression-d-or.vercel.app
```

**⚠️ Important** : 
- Pas de slash (`/`) à la fin
- Utilisez `https://` (pas `http://`)
- URL complète sans chemin

## ✅ Vérification

### Logs Railway

Après envoi, vérifiez les logs :

```
📧 Construction de l'URL de connexion: https://gestion-ecole-expression-d-or.vercel.app/login
📤 Envoi EmailJS à user@example.com via service service_xxx, template template_xxx
   Paramètres du template: {
     to_email: 'user@example.com',
     to_name: 'John Doe',
     password: '***',
     login_url: 'https://gestion-ecole-expression-d-or.vercel.app/login',
     reset_url: '(vide)'
   }
```

### Test dans EmailJS

1. **EmailJS** → **Email Templates** → Votre template
2. Cliquez sur **"Test"** ou **"Send Test Email"**
3. Remplissez les variables :
   - `to_name`: Test User
   - `to_email`: votre-email@example.com
   - `password`: Test123
   - `login_url`: https://gestion-ecole-expression-d-or.vercel.app/login
4. **Envoyez** et vérifiez que les liens fonctionnent

## 🐛 Dépannage

### Les liens ne fonctionnent pas

1. **Vérifiez les noms des variables** dans le template EmailJS :
   - Doit être `{{login_url}}` (avec underscore)
   - Doit être `{{reset_url}}` (avec underscore)
   - **Pas** `{{loginUrl}}` ou `{{login-url}}`

2. **Vérifiez `FRONTEND_URL`** sur Railway :
   - Doit être `https://gestion-ecole-expression-d-or.vercel.app`
   - **Pas** `https://gestion-ecole-expression-d-or.vercel.app/`

3. **Vérifiez les logs Railway** pour voir l'URL construite

4. **Testez le template** dans EmailJS avec des valeurs manuelles

### Le lien texte n'apparaît pas

- Vérifiez que `{{reset_url}}` ou `{{login_url}}` est bien dans le template
- Vérifiez qu'il n'y a pas d'espaces : `{{ reset_url }}` (incorrect) vs `{{reset_url}}` (correct)

## 📝 Checklist

- [ ] Template "Bienvenue" créé avec `{{login_url}}`
- [ ] Template "Réinitialisation" créé avec `{{reset_url}}`
- [ ] `FRONTEND_URL` configuré sur Railway (sans slash final)
- [ ] Variables testées dans EmailJS
- [ ] Email reçu avec liens fonctionnels

## 💡 Astuce

Si vous préférez utiliser directement l'URL dans le code au lieu de `process.env.FRONTEND_URL`, vous pouvez modifier `server/src/services/emailjsService.js` :

```javascript
const loginUrl = 'https://gestion-ecole-expression-d-or.vercel.app/login';
```

Mais il est recommandé d'utiliser `process.env.FRONTEND_URL` pour la flexibilité.





