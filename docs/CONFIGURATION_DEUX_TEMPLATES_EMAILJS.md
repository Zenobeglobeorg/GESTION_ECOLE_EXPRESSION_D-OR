# 📧 Configuration de Deux Templates EmailJS

## 🎯 Objectif

Utiliser **deux templates séparés** dans EmailJS :
1. **Template "Bienvenue"** → Pour envoyer les identifiants du parent
2. **Template "Réinitialisation"** → Pour la réinitialisation de mot de passe

## ✅ Avantages

- ✅ **Personnalisation différente** pour chaque type d'email
- ✅ **Design adapté** au contexte (bienvenue vs réinitialisation)
- ✅ **Plus facile à maintenir** - Modifier chaque template indépendamment
- ✅ **Meilleure organisation** - Séparation claire des fonctionnalités

## 📋 Configuration Complète

### Étape 1 : Créer le Template "Bienvenue"

1. **EmailJS** → **Email Templates** → **Create New Template**
2. **Nom** : `Bienvenue Expression d'Or`
3. **Subject** : `Bienvenue sur Expression d'Or - Vos identifiants de connexion`
4. **Content** (HTML) : Utilisez le template fourni dans `GUIDE_EMAILJS.md` (section "Template pour Email de Bienvenue")
5. **Variables à utiliser** :
   - `{{to_name}}` - Nom du parent
   - `{{to_email}}` - Email du destinataire
   - `{{password}}` - Mot de passe temporaire
   - `{{login_url}}` - URL de connexion
6. **Sauvegardez** et **notez le Template ID** (ex: `template_bienvenue123`)

### Étape 2 : Créer le Template "Réinitialisation"

1. **EmailJS** → **Email Templates** → **Create New Template**
2. **Nom** : `Réinitialisation Mot de Passe`
3. **Subject** : `Réinitialisation de votre mot de passe - Expression d'Or`
4. **Content** (HTML) : Utilisez le template fourni dans `GUIDE_EMAILJS.md` (section "Template pour Réinitialisation de Mot de Passe")
5. **Variables à utiliser** :
   - `{{to_name}}` - Nom de l'utilisateur
   - `{{to_email}}` - Email du destinataire
   - `{{reset_url}}` - URL de réinitialisation avec token
6. **Sauvegardez** et **notez le Template ID** (ex: `template_reset456`)

### Étape 3 : Configurer les Variables sur Railway

Dans Railway → **Variables**, ajoutez :

**Variables requises** :
```
EMAILJS_SERVICE_ID = service_abc123
EMAILJS_TEMPLATE_ID = template_bienvenue123
EMAILJS_PUBLIC_KEY = abcdefghijklmnop
FRONTEND_URL = https://gestion-ecole-expression-d-or.vercel.app
```

**Variable pour le template de réinitialisation** :
```
EMAILJS_TEMPLATE_ID_RESET = template_reset456
```

## 🔄 Comment ça Fonctionne

### Avec deux templates (recommandé) :

1. **Email de bienvenue** :
   - Utilise `EMAILJS_TEMPLATE_ID` (template "Bienvenue")
   - Variables : `{{to_name}}`, `{{to_email}}`, `{{password}}`, `{{login_url}}`

2. **Email de réinitialisation** :
   - Utilise `EMAILJS_TEMPLATE_ID_RESET` (template "Réinitialisation")
   - Variables : `{{to_name}}`, `{{to_email}}`, `{{reset_url}}`

### Avec un seul template (simple) :

Si `EMAILJS_TEMPLATE_ID_RESET` n'est **pas configuré** :
- Le système utilise `EMAILJS_TEMPLATE_ID` pour les deux types d'emails
- Les variables changent selon le contexte :
  - Bienvenue : `{{password}}`, `{{login_url}}`
  - Réinitialisation : `{{reset_url}}`

## 📊 Logs Railway

Après configuration, les logs Railway devraient montrer :

**Avec deux templates** :
```
✅ Configuration EmailJS détectée (RECOMMANDÉ - le plus rapide)
   Service ID: service_abc123
   Template ID (Bienvenue): template_bienvenue123
   Template ID (Réinitialisation): template_reset456 ✅
```

**Avec un seul template** :
```
✅ Configuration EmailJS détectée (RECOMMANDÉ - le plus rapide)
   Service ID: service_abc123
   Template ID (Bienvenue): template_bienvenue123
   Template ID (Réinitialisation): template_bienvenue123 (même que bienvenue)
   💡 Astuce: Créez un template séparé et ajoutez EMAILJS_TEMPLATE_ID_RESET pour personnaliser
```

## 🧪 Test

1. **Test email de bienvenue** :
   - Inscrivez un nouvel élève
   - Vérifiez les logs : `📤 Envoi EmailJS à ... via service ..., template template_bienvenue123`
   - Vérifiez votre boîte email

2. **Test email de réinitialisation** :
   - Demandez une réinitialisation de mot de passe
   - Vérifiez les logs : `📧 Utilisation du template de réinitialisation: template_reset456`
   - Vérifiez les logs : `📤 Envoi EmailJS à ... via service ..., template template_reset456`
   - Vérifiez votre boîte email

## ✅ Checklist

- [ ] Template "Bienvenue" créé dans EmailJS
- [ ] Template ID (Bienvenue) noté
- [ ] Template "Réinitialisation" créé dans EmailJS
- [ ] Template ID (Réinitialisation) noté
- [ ] Variables ajoutées sur Railway :
  - [ ] `EMAILJS_SERVICE_ID`
  - [ ] `EMAILJS_TEMPLATE_ID` (bienvenue)
  - [ ] `EMAILJS_TEMPLATE_ID_RESET` (réinitialisation)
  - [ ] `EMAILJS_PUBLIC_KEY`
  - [ ] `FRONTEND_URL`
- [ ] Application redéployée sur Railway
- [ ] Test email de bienvenue effectué
- [ ] Test email de réinitialisation effectué
- [ ] Emails reçus avec les bons templates

## 💡 Exemple de Templates

### Template "Bienvenue" - Variables utilisées :
```html
Bonjour {{to_name}},

Votre compte a été créé.

Email : {{to_email}}
Mot de passe : {{password}}

Connectez-vous : {{login_url}}
```

### Template "Réinitialisation" - Variables utilisées :
```html
Bonjour {{to_name}},

Vous avez demandé à réinitialiser votre mot de passe.

Cliquez ici : {{reset_url}}
```

## 🎉 Résultat

Une fois configuré, chaque type d'email utilisera son template dédié, permettant une personnalisation complète et indépendante !

