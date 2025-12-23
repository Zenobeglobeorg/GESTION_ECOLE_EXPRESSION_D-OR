# 📧 Guide Complet : EmailJS pour Backend (Résolution des Erreurs)

## ❌ Erreurs Courantes

### Erreur 1 : "The Public Key is invalid"
```
❌ Erreur EmailJS: The Public Key is invalid
```

**Causes possibles** :
1. Vous utilisez la **Public Key** au lieu de la **Private Key**
2. La **Private Key** est incorrecte ou mal copiée
3. Les **appels API non-browser** ne sont pas activés dans EmailJS

**Solutions** :

#### Solution A : Utiliser la Private Key (pas la Public Key)

1. **EmailJS** → **Account** → **API Keys**
2. **Copiez la "Private Key"** (API Key) - **PAS** la Public Key
3. **Sur Railway**, ajoutez/modifiez :
   ```
   EMAILJS_PRIVATE_KEY = votre-private-key-ici
   ```
   ⚠️ **Important** : Utilisez `EMAILJS_PRIVATE_KEY`, pas `EMAILJS_PUBLIC_KEY`

#### Solution B : Activer les Appels API Non-Browser

1. **EmailJS** → **Account** → **Security**
2. **Activez** : "Allow API calls from non-browser applications"
3. **Sauvegardez**

#### Solution C : Vérifier la Configuration

Sur Railway, vous devez avoir :
```
EMAILJS_SERVICE_ID = service_xxx
EMAILJS_TEMPLATE_ID = template_xxx
EMAILJS_PRIVATE_KEY = private_xxx  ← PRIVATE KEY (pas Public Key)
```

### Erreur 2 : "API calls are disabled for non-browser applications"
```
❌ Erreur EmailJS: API calls are disabled for non-browser applications
```

**Solution** :
1. **EmailJS** → **Account** → **Security**
2. **Activez** : "Allow API calls from non-browser applications"
3. **Redéployez** votre application

## ✅ Configuration Correcte

### Variables Requises sur Railway

```
EMAILJS_SERVICE_ID = service_se6rh7e
EMAILJS_TEMPLATE_ID = template_1xq9w1e
EMAILJS_TEMPLATE_ID_RESET = template_94u7kmx  (optionnel)
EMAILJS_PRIVATE_KEY = votre-private-key-ici  ← IMPORTANT : Private Key
```

### ⚠️ Ne PAS Utiliser

```
EMAILJS_PUBLIC_KEY = ...  ← Bloquée en backend
```

## 🔍 Vérification

### 1. Vérifier votre Private Key

- **EmailJS** → **Account** → **API Keys**
- La **Private Key** est différente de la **Public Key**
- Copiez-la **exactement** (sans espaces avant/après)

### 2. Vérifier les Logs Railway

**Configuration correcte** :
```
✅ Configuration EmailJS détectée
   Service ID: service_se6rh7e
   Template ID (Bienvenue): template_1xq9w1e
   Template ID (Réinitialisation): template_94u7kmx ✅
   Clé: Private Key ✅
```

**Configuration incorrecte** :
```
⚠️ EmailJS : Public Key détectée mais Private Key manquante.
   ❌ EmailJS bloque les appels backend avec Public Key.
```

### 3. Test d'Envoi

Après configuration, testez l'envoi d'email. Les logs devraient montrer :
```
📤 Envoi EmailJS à user@example.com via service service_xxx, template template_xxx (Private Key)
✅ Email envoyé via EmailJS à user@example.com
   Status: 200
```

## 🚀 Solution Recommandée : Mailgun

Si vous continuez à avoir des problèmes avec EmailJS, **Mailgun est recommandé** :

### Avantages Mailgun :
- ✅ **Conçu pour les appels backend** - Pas de restrictions
- ✅ **5000 emails/mois gratuits** (vs 200 pour EmailJS)
- ✅ **Plus fiable** depuis Railway
- ✅ **Pas besoin d'activer des options** dans les paramètres

### Configuration Mailgun (5 minutes) :

1. **Créer un compte** : https://www.mailgun.com/
2. **Obtenir** :
   - Domaine sandbox (ex: `sandbox123...mailgun.org`)
   - API Key (Settings → API Keys)
3. **Ajouter sur Railway** :
   ```
   MAILGUN_API_KEY = key-votre-cle-api
   MAILGUN_DOMAIN = sandbox123...mailgun.org
   MAILGUN_FROM_EMAIL = noreply@sandbox123...mailgun.org
   ```
4. **Redéployer** - Le système utilisera automatiquement Mailgun

📖 **Guide complet** : `GUIDE_MAILGUN.md`

## 📝 Checklist de Dépannage

- [ ] `EMAILJS_PRIVATE_KEY` est configurée sur Railway (pas `EMAILJS_PUBLIC_KEY`)
- [ ] Private Key copiée depuis EmailJS → Account → API Keys
- [ ] Appels API non-browser activés dans EmailJS → Account → Security
- [ ] Package `@emailjs/nodejs` installé (`npm install @emailjs/nodejs`)
- [ ] Application redéployée sur Railway
- [ ] Logs Railway vérifiés
- [ ] Test d'envoi d'email effectué

## 🆘 Si Rien ne Fonctionne

1. **Utilisez Mailgun** - C'est la solution la plus fiable pour les appels backend
2. **Vérifiez les logs Railway** pour les détails d'erreur
3. **Vérifiez EmailJS → Logs** pour voir les tentatives d'envoi
4. **Contactez le support EmailJS** si nécessaire

## 💡 Note Importante

EmailJS est excellent pour les **appels côté client (frontend)**, mais pour les **appels backend**, Mailgun est généralement plus fiable et plus simple à configurer.

