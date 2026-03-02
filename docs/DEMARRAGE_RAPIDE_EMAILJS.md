# 🚀 Démarrage Rapide EmailJS - 5 Minutes

## ✅ Solution la Plus Rapide pour Envoyer des Emails

EmailJS est **la solution la plus rapide** à configurer (5 minutes vs 30 minutes pour Mailgun).

## 📋 Configuration en 5 Étapes

### 1️⃣ Créer un Compte (1 min)
- Allez sur https://www.emailjs.com/
- Cliquez sur **"Sign Up"**
- Vérifiez votre email

### 2️⃣ Connecter Gmail (1 min)
- EmailJS → **Email Services** → **Add New Service**
- Sélectionnez **Gmail** → **Connect Account**
- Autorisez EmailJS dans Google
- **Notez le Service ID** (ex: `service_abc123`)

### 3️⃣ Créer un Template (2 min)
- EmailJS → **Email Templates** → **Create New Template**
- **Nom** : `Bienvenue Expression d'Or`
- **Subject** : `Bienvenue sur Expression d'Or - Vos identifiants de connexion`
- **Content** : Copiez le template HTML depuis `GUIDE_EMAILJS.md` (section Étape 3)
- **Variables à utiliser** : `{{to_name}}`, `{{to_email}}`, `{{password}}`, `{{login_url}}`
- **Sauvegardez** et **notez le Template ID** (ex: `template_xyz789`)

### 4️⃣ Obtenir votre Public Key (30 sec)
- EmailJS → **Account** → **API Keys**
- **Copiez votre Public Key** (ex: `abcdefghijklmnop`)

### 5️⃣ Ajouter les Variables sur Railway (30 sec)
Railway → **Variables** → Ajoutez :

**Variables requises** :
```
EMAILJS_SERVICE_ID = service_abc123
EMAILJS_TEMPLATE_ID = template_xyz789
EMAILJS_PUBLIC_KEY = abcdefghijklmnop
FRONTEND_URL = https://gestion-ecole-expression-d-or.vercel.app
```

**Variable optionnelle** (recommandée pour deux templates séparés) :
```
EMAILJS_TEMPLATE_ID_RESET = template_reset456
```

**💡 Astuce** : Si vous créez un template séparé pour la réinitialisation, ajoutez `EMAILJS_TEMPLATE_ID_RESET`. Sinon, le système utilisera `EMAILJS_TEMPLATE_ID` pour les deux types d'emails.

## 🎉 C'est Fait !

Railway redéploiera automatiquement. Vérifiez les logs :
```
✅ Configuration EmailJS détectée (RECOMMANDÉ - le plus rapide)
```

## 📖 Guide Complet

Pour les détails complets, templates HTML, et dépannage, consultez **`GUIDE_EMAILJS.md`**.

## 🔄 Ordre de Priorité

Le système essaie automatiquement :
1. **EmailJS** (si configuré) ← **Le plus rapide**
2. **Mailgun** (si EmailJS n'est pas configuré)
3. **SMTP** (si EmailJS et Mailgun ne sont pas configurés)

