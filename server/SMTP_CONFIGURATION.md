# Configuration SMTP pour l'envoi d'emails

## Variables d'environnement requises sur Railway

Pour que l'envoi d'emails fonctionne en production, vous devez configurer les variables d'environnement suivantes dans votre projet Railway :

### Variables requises

1. **SMTP_USER** (REQUIS)
   - Votre adresse email qui enverra les emails
   - Exemple : `votre-email@gmail.com`

2. **SMTP_PASS** (REQUIS)
   - Le mot de passe d'application (pour Gmail) ou le mot de passe SMTP
   - **Pour Gmail** : Vous devez créer un "Mot de passe d'application"
   - Guide : https://support.google.com/accounts/answer/185833

### Variables optionnelles

3. **SMTP_HOST** (optionnel)
   - Serveur SMTP à utiliser
   - Défaut : `smtp.gmail.com`
   - Autres options :
     - Outlook/Hotmail : `smtp-mail.outlook.com`
     - Yahoo : `smtp.mail.yahoo.com`
     - Autres : Consultez votre fournisseur d'email

4. **SMTP_PORT** (optionnel)
   - Port SMTP à utiliser
   - Défaut : `587` (TLS)
   - Autres options :
     - `465` (SSL)
     - `25` (non sécurisé, déconseillé)

5. **FRONTEND_URL** (optionnel mais recommandé)
   - URL de votre frontend déployé
   - Exemple : `https://votre-app.vercel.app`
   - Utilisé pour générer les liens dans les emails

## Configuration sur Railway

1. Allez sur votre projet Railway
2. Cliquez sur votre service backend
3. Allez dans l'onglet "Variables"
4. Ajoutez les variables suivantes :

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-d-application
FRONTEND_URL=https://votre-frontend.vercel.app
```

## Configuration Gmail (Recommandé)

### Étape 1 : Activer la vérification en 2 étapes
1. Allez sur https://myaccount.google.com/security
2. Activez la "Vérification en deux étapes"

### Étape 2 : Créer un mot de passe d'application
1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Mail" et "Autre (nom personnalisé)"
3. Entrez "Expression d'Or" comme nom
4. Cliquez sur "Générer"
5. Copiez le mot de passe généré (16 caractères)
6. Utilisez ce mot de passe comme valeur de `SMTP_PASS`

## Vérification

Après avoir configuré les variables, redéployez votre service Railway. Vous devriez voir dans les logs :

```
✅ Configuration SMTP détectée
   Host: smtp.gmail.com
   Port: 587
   User: votre-email@gmail.com
   Frontend URL: https://votre-frontend.vercel.app
```

Si vous voyez un avertissement, vérifiez que toutes les variables sont bien configurées.

## Dépannage

### Les emails ne sont pas envoyés

1. **Vérifiez les logs Railway** :
   - Cherchez les messages commençant par `📧` ou `❌`
   - Les erreurs détaillées sont maintenant loggées

2. **Vérifiez les variables d'environnement** :
   - Assurez-vous que `SMTP_USER` et `SMTP_PASS` sont définis
   - Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs

3. **Pour Gmail** :
   - Assurez-vous d'utiliser un "Mot de passe d'application", pas votre mot de passe Gmail normal
   - Vérifiez que la vérification en 2 étapes est activée

4. **Vérifiez les logs lors d'une demande de réinitialisation** :
   - Les logs détaillent chaque étape du processus
   - Cherchez les messages `✅` pour le succès ou `❌` pour les erreurs

## Alternative : Services d'email tiers

Si Gmail ne fonctionne pas, vous pouvez utiliser d'autres services :

### SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

### Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=votre-username-mailgun
SMTP_PASS=votre-password-mailgun
```

### AWS SES
```
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=votre-access-key-id
SMTP_PASS=votre-secret-access-key
```

