# 🔧 Résolution : Liens EmailJS Ne Fonctionnent Pas

## ❌ Problème

Les emails sont envoyés mais :
- Le bouton "Se connecter" ne redirige pas
- Le bouton "Réinitialiser mon mot de passe" ne redirige pas  
- Le lien texte n'apparaît pas dans l'email

## 🔍 Cause

Avec EmailJS, le **template configuré dans le dashboard EmailJS** remplace complètement le HTML/text envoyé par le code. Les variables comme `{{login_url}}` et `{{reset_url}}` doivent être :
1. **Configurées dans le template EmailJS** (dans le dashboard)
2. **Passées correctement** depuis le code backend

## ✅ Solution Complète

### Étape 1 : Vérifier FRONTEND_URL sur Railway

Sur Railway → **Variables**, vérifiez :

```
FRONTEND_URL = https://gestion-ecole-expression-d-or.vercel.app
```

**⚠️ Important** :
- ✅ **Correct** : `https://gestion-ecole-expression-d-or.vercel.app`
- ❌ **Incorrect** : `https://gestion-ecole-expression-d-or.vercel.app/` (slash final)
- ❌ **Incorrect** : `http://gestion-ecole-expression-d-or.vercel.app` (http au lieu de https)

### Étape 2 : Configurer les Templates EmailJS

#### Template "Bienvenue" (Identifiants Parent)

1. **EmailJS** → **Email Templates** → Votre template de bienvenue
2. **Vérifiez que le template contient** :
   ```html
   <a href="{{login_url}}" class="button">Se connecter</a>
   
   <p>Ou copiez-collez ce lien dans votre navigateur :</p>
   <p>{{login_url}}</p>
   ```
3. **Variables requises** dans le template :
   - `{{to_name}}`
   - `{{to_email}}`
   - `{{password}}`
   - `{{login_url}}` ← **IMPORTANT**

#### Template "Réinitialisation" (Mot de Passe)

1. **EmailJS** → **Email Templates** → Votre template de réinitialisation
2. **Vérifiez que le template contient** :
   ```html
   <a href="{{reset_url}}" class="button">Réinitialiser mon mot de passe</a>
   
   <p>Ou copiez-collez ce lien dans votre navigateur :</p>
   <p>{{reset_url}}</p>
   ```
3. **Variables requises** dans le template :
   - `{{to_name}}`
   - `{{to_email}}`
   - `{{reset_url}}` ← **IMPORTANT**

### Étape 3 : Tester les Templates dans EmailJS

1. **EmailJS** → **Email Templates** → Votre template
2. Cliquez sur **"Test"** ou **"Send Test Email"**
3. Remplissez les variables :
   - `to_name`: Test User
   - `to_email`: votre-email@example.com
   - `password`: Test123 (pour bienvenue)
   - `login_url`: `https://gestion-ecole-expression-d-or.vercel.app/login`
   - `reset_url`: `https://gestion-ecole-expression-d-or.vercel.app/reset-password?token=test123`
4. **Envoyez** et vérifiez que les liens fonctionnent

### Étape 4 : Vérifier les Logs Railway

Après envoi d'email, vérifiez les logs Railway :

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

Si `login_url` ou `reset_url` est `'(vide)'`, le problème vient de la construction de l'URL.

## 🐛 Dépannage

### Les liens sont vides dans les logs

**Vérifiez `FRONTEND_URL`** :
```bash
# Sur Railway, vérifiez que FRONTEND_URL est bien configuré
FRONTEND_URL = https://gestion-ecole-expression-d-or.vercel.app
```

### Les liens apparaissent mais ne fonctionnent pas

1. **Vérifiez l'URL** : Doit être `https://` (pas `http://`)
2. **Vérifiez le domaine** : Doit correspondre à votre frontend Vercel
3. **Testez l'URL manuellement** : Copiez-collez dans le navigateur

### Le lien texte n'apparaît pas dans l'email

1. **Vérifiez le template EmailJS** : Le template doit contenir `{{reset_url}}` ou `{{login_url}}`
2. **Vérifiez les espaces** : `{{ reset_url }}` (incorrect) vs `{{reset_url}}` (correct)
3. **Vérifiez le nom de la variable** : Doit être exactement `{{login_url}}` ou `{{reset_url}}`

## 💡 Solution Alternative : URL Directe

Si `process.env.FRONTEND_URL` ne fonctionne pas, vous pouvez utiliser directement l'URL dans le code :

**Modifier `server/src/services/emailjsService.js`** :

```javascript
// Dans sendWelcomeEmail
const loginUrl = 'https://gestion-ecole-expression-d-or.vercel.app/login';

// Dans sendPasswordResetEmail  
const resetUrl = `https://gestion-ecole-expression-d-or.vercel.app/reset-password?token=${resetToken}`;
```

**⚠️ Note** : Cette solution est moins flexible mais peut résoudre le problème si `FRONTEND_URL` n'est pas correctement lu.

## ✅ Checklist

- [ ] `FRONTEND_URL` configuré sur Railway (sans slash final, avec https://)
- [ ] Template "Bienvenue" contient `{{login_url}}`
- [ ] Template "Réinitialisation" contient `{{reset_url}}`
- [ ] Templates testés dans EmailJS avec des URLs manuelles
- [ ] Logs Railway vérifiés (URLs construites correctement)
- [ ] Email reçu avec liens fonctionnels

## 📖 Guide Complet

Consultez `GUIDE_TEMPLATES_EMAILJS.md` pour les templates HTML complets à copier dans EmailJS.





