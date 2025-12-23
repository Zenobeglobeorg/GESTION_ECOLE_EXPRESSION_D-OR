# Guide Complet : Configuration EmailJS pour l'Envoi d'Emails

## 🚀 Pourquoi EmailJS ?

**EmailJS** est la solution la plus rapide à configurer pour l'envoi d'emails :
- ✅ **Configuration en 5 minutes** (pas de vérification de domaine nécessaire)
- ✅ **Gratuit jusqu'à 200 emails/mois** (parfait pour commencer)
- ✅ **Fonctionne immédiatement** - Pas besoin d'attendre la vérification
- ✅ **API REST simple** - Pas de problèmes de timeout SMTP
- ✅ **Intégration Gmail/Outlook** - Utilise votre compte email existant

## 📋 Étape 1 : Créer un Compte EmailJS

1. **Allez sur** : https://www.emailjs.com/
2. **Cliquez sur "Sign Up"** (Inscription) en haut à droite
3. **Remplissez le formulaire** :
   - Email
   - Mot de passe
   - Nom (optionnel)
4. **Vérifiez votre email** et activez votre compte

## 📋 Étape 2 : Connecter votre Service Email (Gmail recommandé)

1. **Connectez-vous** à EmailJS
2. **Allez dans "Email Services"** (menu de gauche)
3. **Cliquez sur "Add New Service"**
4. **Sélectionnez "Gmail"** (ou Outlook, Yahoo, etc.)
5. **Cliquez sur "Connect Account"**
6. **Autorisez EmailJS** à accéder à votre compte Gmail
   - Vous serez redirigé vers Google pour autoriser
   - Cliquez sur "Autoriser"
7. **Donnez un nom à votre service** (ex: "Expression d'Or Gmail")
8. **Notez le "Service ID"** qui apparaît (ex: `service_abc123`)

**⚠️ Important** : Utilisez un compte Gmail que vous contrôlez. Les emails seront envoyés depuis ce compte.

## 📋 Étape 3 : Créer un Template Email

1. **Allez dans "Email Templates"** (menu de gauche)
2. **Cliquez sur "Create New Template"**
3. **Configurez le template** :

### Template pour Email de Bienvenue :

**Nom du template** : `Bienvenue Expression d'Or`

**Subject** (Sujet) :
```
Bienvenue sur Expression d'Or - Vos identifiants de connexion
```

**Content** (Contenu HTML) :
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

**Variables utilisées** :
- `{{to_name}}` - Nom du parent
- `{{to_email}}` - Email du destinataire
- `{{password}}` - Mot de passe temporaire
- `{{login_url}}` - URL de connexion

4. **Cliquez sur "Save"**
5. **Notez le "Template ID"** qui apparaît (ex: `template_xyz789`)

### Template pour Réinitialisation de Mot de Passe :

**Créez un deuxième template** avec le nom : `Réinitialisation Mot de Passe`

**Subject** :
```
Réinitialisation de votre mot de passe - Expression d'Or
```

**Content** :
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

**Variables utilisées** :
- `{{to_name}}` - Nom de l'utilisateur
- `{{reset_url}}` - URL de réinitialisation avec token

6. **Sauvegardez** et notez le Template ID (ex: `template_reset456`)

**💡 Astuce** : Vous pouvez réutiliser le même template pour les deux types d'emails si vous utilisez des variables conditionnelles, mais il est **recommandé d'avoir deux templates séparés** pour plus de clarté.

## 📋 Étape 4 : Obtenir votre Public Key (User ID)

1. **Allez dans "Account"** (menu de gauche) ou **"General"**
2. **Trouvez la section "API Keys"** ou **"Public Key"**
3. **Copiez votre "Public Key"** (ex: `abcdefghijklmnop`)
   - ⚠️ **C'est votre User ID**, ne le partagez jamais publiquement

## 📋 Étape 5 : Configurer les Variables sur Railway

1. **Allez sur votre projet Railway**
2. **Cliquez sur l'onglet "Variables"**
3. **Ajoutez les variables suivantes** :

### Variables Requises pour EmailJS :

| Nom de la Variable | Valeur | Exemple |
|-------------------|--------|---------|
| `EMAILJS_SERVICE_ID` | Votre Service ID (Gmail) | `service_abc123` |
| `EMAILJS_TEMPLATE_ID` | Votre Template ID (Bienvenue) | `template_xyz789` |
| `EMAILJS_PUBLIC_KEY` | Votre Public Key (User ID) | `abcdefghijklmnop` |

**⚠️ Note** : Pour la réinitialisation de mot de passe, le système utilisera le même template. Si vous voulez un template différent, vous pouvez créer une variable `EMAILJS_TEMPLATE_ID_RESET` (optionnel, le code utilisera `EMAILJS_TEMPLATE_ID` par défaut).

### Variables Optionnelles :

| Nom de la Variable | Valeur | Exemple |
|-------------------|--------|---------|
| `EMAILJS_TEMPLATE_ID_RESET` | Template ID pour réinitialisation (optionnel) | `template_reset456` |
| `EMAILJS_API_URL` | URL de l'API (généralement pas nécessaire) | `https://api.emailjs.com/api/v1.0/email/send` (par défaut) |

### Variables à Garder :

- `FRONTEND_URL` - URL de votre frontend (ex: `https://gestion-ecole-expression-d-or.vercel.app`)

## 📋 Étape 6 : Redéployer sur Railway

1. **Après avoir ajouté les variables**, Railway redéploiera automatiquement
2. **Ou cliquez sur "Redeploy"** manuellement
3. **Vérifiez les logs** pour confirmer que EmailJS est détecté :
   ```
   ✅ Configuration EmailJS détectée (RECOMMANDÉ - le plus rapide)
   ```

## 📋 Étape 7 : Tester l'Envoi d'Email

1. **Inscrivez un nouvel élève** dans l'application
2. **Vérifiez les logs Railway** - vous devriez voir :
   ```
   📧 Tentative d'envoi via EmailJS...
   ✅ Email envoyé via EmailJS à [email]
   ```
3. **Vérifiez votre boîte email** (et les spams si nécessaire)

## 🔍 Dépannage

### Problème : "EmailJS non configuré"

**Solution** : Vérifiez que vous avez bien ajouté les 3 variables requises sur Railway :
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `EMAILJS_PUBLIC_KEY`

### Problème : "400 Bad Request"

**Solution** : 
- Vérifiez que votre Service ID et Template ID sont corrects
- Vérifiez que toutes les variables du template ({{to_name}}, {{to_email}}, etc.) sont bien passées dans le code

### Problème : "401 Unauthorized"

**Solution** : Votre Public Key (User ID) est incorrecte. Vérifiez-la dans EmailJS → Account → API Keys.

### Problème : Les emails ne sont pas reçus

**Solutions** :
- Vérifiez les spams
- Vérifiez que votre service Gmail est bien connecté dans EmailJS
- Vérifiez les logs EmailJS dans votre compte (EmailJS → Logs)

### Problème : "Template variables not found"

**Solution** : Assurez-vous que toutes les variables utilisées dans votre template ({{variable_name}}) sont bien passées dans le code. Le service EmailJS passe automatiquement :
- `to_name`, `to_email`, `subject`, `message_html`, `message_text`
- Plus les variables personnalisées (`password`, `login_url`, `reset_url`, etc.)

## 📊 Comparaison : EmailJS vs Mailgun vs SMTP

| Critère | EmailJS | Mailgun | SMTP (Gmail) |
|---------|---------|---------|--------------|
| **Temps de config** | ⭐⭐⭐⭐⭐ (5 min) | ⭐⭐⭐ (30 min) | ⭐⭐ (15 min) |
| **Vérification domaine** | ❌ Non nécessaire | ✅ Requis (ou sandbox) | ❌ Non nécessaire |
| **Fiabilité** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Vitesse** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Depuis Railway** | ✅ Fonctionne | ✅ Fonctionne | ❌ Timeouts fréquents |
| **Plan gratuit** | 200 emails/mois | 5000 emails/mois | Illimité (restrictions) |
| **Coût payant** | $15/mois (1000 emails) | $35/mois (50k emails) | Gratuit |

## ✅ Checklist de Configuration

- [ ] Compte EmailJS créé
- [ ] Service Gmail connecté dans EmailJS
- [ ] Service ID noté
- [ ] Template "Bienvenue" créé
- [ ] Template ID noté
- [ ] Template "Réinitialisation" créé (optionnel, peut réutiliser le même)
- [ ] Public Key (User ID) copiée
- [ ] Variables d'environnement ajoutées sur Railway :
  - [ ] `EMAILJS_SERVICE_ID`
  - [ ] `EMAILJS_TEMPLATE_ID`
  - [ ] `EMAILJS_PUBLIC_KEY`
  - [ ] `FRONTEND_URL`
- [ ] Application redéployée sur Railway
- [ ] Test d'envoi d'email effectué
- [ ] Email reçu

## 🎯 Résultat Attendu

Après configuration, les logs Railway devraient montrer :
```
📧 Tentative d'envoi via EmailJS...
✅ Email envoyé via EmailJS à user@example.com
   Status: success
```

## 🔄 Ordre de Priorité

Le système essaie les services dans cet ordre :
1. **EmailJS** (si configuré) ← **Le plus rapide à configurer**
2. **Mailgun** (si EmailJS échoue ou n'est pas configuré)
3. **SMTP** (si EmailJS et Mailgun échouent ou ne sont pas configurés)

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway pour les détails d'erreur
2. Consultez la documentation EmailJS : https://www.emailjs.com/docs/
3. Vérifiez votre compte EmailJS → Logs pour voir les tentatives d'envoi
4. Vérifiez que votre service Gmail est toujours connecté dans EmailJS

## 💡 Astuce

Pour tester rapidement, vous pouvez créer un template simple avec juste :
```
Bonjour {{to_name}},

Votre mot de passe temporaire est : {{password}}

{{login_url}}
```

Une fois que ça fonctionne, vous pouvez améliorer le template avec le HTML complet.

