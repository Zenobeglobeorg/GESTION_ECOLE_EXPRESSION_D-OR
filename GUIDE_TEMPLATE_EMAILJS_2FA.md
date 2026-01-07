# 📧 Guide : Configuration du Template EmailJS pour la 2FA

## 🎯 Objectif

Ce guide explique comment configurer un **compte EmailJS séparé** pour la double authentification (2FA), car le compte gratuit ne permet que 2 templates et ceux-ci sont déjà utilisés pour :
1. Email de bienvenue (identifiants parent)
2. Email de réinitialisation de mot de passe

## 📋 Variables d'Environnement Requises

Sur **Railway**, ajoutez ces nouvelles variables d'environnement :

```bash
# Compte EmailJS pour la 2FA (NOUVEAU)
EMAILJS_SERVICE_ID_2FA=service_xxxxx
EMAILJS_TEMPLATE_ID_2FA=template_xxxxx
EMAILJS_PRIVATE_KEY_2FA=xxxxxxxxxxxxx
EMAILJS_PUBLIC_KEY_2FA=xxxxxxxxxxxxx  # Optionnel mais recommandé
```

**Note** : Si vous utilisez le même compte EmailJS pour la 2FA, vous pouvez utiliser les mêmes clés (`EMAILJS_PRIVATE_KEY_2FA` peut pointer vers `EMAILJS_PRIVATE_KEY`).

## 🔧 Étapes de Configuration

### Étape 1 : Créer un Nouveau Compte EmailJS (ou utiliser le même)

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Créez un nouveau compte (ou utilisez votre compte existant)
3. Vérifiez votre email et activez votre compte

### Étape 2 : Créer un Service Email

1. Dans EmailJS, allez dans **Email Services**
2. Cliquez sur **Add New Service**
3. Choisissez votre fournisseur d'email (Gmail, Outlook, etc.)
4. Configurez votre service
5. **Copiez le Service ID** (format : `service_xxxxx`)

### Étape 3 : Créer le Template pour Code 2FA

1. Dans EmailJS, allez dans **Email Templates**
2. Cliquez sur **Create New Template**
3. Nommez-le : `Code 2FA - Expression d'Or`

#### **Subject** :
```
Code de vérification - Double authentification
```

#### **Content (HTML)** :
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #fbbf24 100%);
      color: white;
      padding: 20px;
      border-radius: 10px 10px 0 0;
      text-align: center;
      margin: -30px -30px 30px -30px;
    }
    .code-box {
      background-color: #f0f9ff;
      border: 2px dashed #1e40af;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #1e40af;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Code de Vérification</h1>
    </div>
    
    <p>Bonjour {{to_name}},</p>
    
    <p>Vous avez demandé à vous connecter à votre compte <strong>Expression d'Or</strong>.</p>
    
    <p>Utilisez le code suivant pour compléter votre connexion :</p>
    
    <div class="code-box">
      <div class="code">{{code}}</div>
    </div>
    
    <div class="warning">
      <strong>⚠️ Important :</strong>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Ce code est valide pendant <strong>10 minutes</strong> uniquement</li>
        <li>Ne partagez jamais ce code avec personne</li>
        <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
      </ul>
    </div>
    
    <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email ou contacter le support si vous êtes préoccupé par la sécurité de votre compte.</p>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
      <p>Expression d'Or - Système de gestion scolaire</p>
    </div>
  </div>
</body>
</html>
```

#### **Variables du Template** :
Le template utilise ces variables (qui seront remplacées automatiquement) :
- `{{to_name}}` : Nom de l'utilisateur
- `{{code}}` : Code de vérification à 6 chiffres
- `{{verification_code}}` : Alias pour `{{code}}` (compatibilité)

### Étape 4 : Obtenir les Clés API

1. Dans EmailJS, allez dans **Account** → **General**
2. **Public Key (User ID)** : Copiez la valeur (format : `user_xxxxx`)
3. Dans **Account** → **API Keys**
4. **Private Key (API Key)** : Créez une nouvelle clé si nécessaire et copiez-la

### Étape 5 : Activer les Appels API Non-Browser

⚠️ **IMPORTANT** : Pour que les appels depuis Railway fonctionnent :

1. Dans EmailJS, allez dans **Account** → **Security**
2. Activez **"Allow non-browser applications"** ou **"Enable API calls from server"**
3. Sauvegardez les modifications

### Étape 6 : Ajouter les Variables sur Railway

1. Allez sur votre projet Railway
2. Ouvrez **Variables**
3. Ajoutez ces variables :

```
EMAILJS_SERVICE_ID_2FA = service_xxxxx
EMAILJS_TEMPLATE_ID_2FA = template_xxxxx
EMAILJS_PRIVATE_KEY_2FA = xxxxxxxxxxxxx
EMAILJS_PUBLIC_KEY_2FA = user_xxxxx
```

**Note** : Si vous utilisez le même compte EmailJS, vous pouvez faire :
```
EMAILJS_SERVICE_ID_2FA = service_xxxxx
EMAILJS_TEMPLATE_ID_2FA = template_xxxxx
EMAILJS_PRIVATE_KEY_2FA = ${EMAILJS_PRIVATE_KEY}  # Référence à la clé principale
EMAILJS_PUBLIC_KEY_2FA = ${EMAILJS_PUBLIC_KEY}    # Référence à la clé principale
```

## ✅ Vérification

Après avoir configuré :

1. **Redéployez** votre application sur Railway
2. Testez l'activation de la 2FA depuis une page Settings
3. Vérifiez les logs Railway pour voir :
   ```
   📤 Envoi EmailJS à xxx@example.com via service service_xxxxx, template template_xxxxx
   ℹ️ Utilisation du compte EmailJS 2FA (séparé)
   ✅ Email envoyé via EmailJS à xxx@example.com
   ```

## 🔍 Dépannage

### Erreur : "EmailJS non configuré pour la 2FA"
- Vérifiez que `EMAILJS_SERVICE_ID_2FA`, `EMAILJS_TEMPLATE_ID_2FA` et `EMAILJS_PRIVATE_KEY_2FA` sont bien configurés sur Railway

### Erreur : "API calls are disabled for non-browser applications"
- Activez les appels API non-browser dans EmailJS → Account → Security

### Erreur : "The Public Key is invalid"
- Vérifiez que `EMAILJS_PUBLIC_KEY_2FA` correspond au User ID de votre compte EmailJS

### Le code n'apparaît pas dans l'email
- Vérifiez que le template utilise bien `{{code}}` (et non `{{verification_code}}` ou autre)
- Vérifiez que le template est bien sauvegardé dans EmailJS

## 📝 Notes Importantes

- Le compte EmailJS gratuit permet **200 emails/mois**
- Si vous utilisez le même compte pour tous les emails, assurez-vous de ne pas dépasser la limite
- Les variables `EMAILJS_*_2FA` sont **optionnelles** : si elles ne sont pas configurées, le système utilisera le compte principal (`EMAILJS_SERVICE_ID`, etc.)

## 🎉 C'est Fait !

Votre système de 2FA utilise maintenant un compte EmailJS séparé (ou le même si vous préférez). Les codes de vérification seront envoyés via EmailJS avec le template personnalisé.





