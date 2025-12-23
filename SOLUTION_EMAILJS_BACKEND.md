# 🔧 Solution : Erreur EmailJS "API calls are disabled for non-browser applications"

## ❌ Problème

Vous rencontrez cette erreur dans les logs Railway :
```
❌ Erreur EmailJS: {
  status: 'error',
  message: 'API calls are disabled for non-browser applications'
}
```

## 🔍 Explication

EmailJS a **deux types de clés** :
1. **Public Key (User ID)** - Pour utilisation côté **client (navigateur)** uniquement
2. **Private Key (API Key)** - Pour utilisation côté **serveur (backend)**

**Le problème** : EmailJS bloque les appels depuis un serveur backend avec la Public Key pour des raisons de sécurité. Même avec une Private Key, EmailJS peut avoir des restrictions.

## ✅ Solutions

### Solution 1 : Utiliser Mailgun (RECOMMANDÉ) ⭐

**Mailgun est conçu pour les appels backend** et fonctionne parfaitement depuis Railway.

#### Avantages :
- ✅ **Conçu pour les appels backend** - Pas de restrictions
- ✅ **5000 emails/mois gratuits** (vs 200 pour EmailJS)
- ✅ **Plus fiable** depuis Railway
- ✅ **API REST** - Pas de problèmes de timeout SMTP

#### Configuration rapide :

1. **Créer un compte Mailgun** : https://www.mailgun.com/
2. **Obtenir votre domaine sandbox** (ex: `sandbox123...mailgun.org`)
3. **Obtenir votre API Key** dans Settings → API Keys
4. **Ajouter sur Railway** :
   ```
   MAILGUN_API_KEY = key-votre-cle-api
   MAILGUN_DOMAIN = sandbox123...mailgun.org
   MAILGUN_FROM_EMAIL = noreply@sandbox123...mailgun.org
   FRONTEND_URL = https://votre-frontend.vercel.app
   ```

📖 **Guide complet** : `GUIDE_MAILGUN.md`

### Solution 2 : Utiliser la Private Key d'EmailJS (Alternative)

Si vous voulez absolument utiliser EmailJS :

1. **Obtenir la Private Key** :
   - EmailJS → **Account** → **API Keys**
   - Copiez la **Private Key** (pas la Public Key)

2. **Ajouter sur Railway** :
   ```
   EMAILJS_PRIVATE_KEY = votre-private-key-ici
   ```
   (Gardez aussi `EMAILJS_SERVICE_ID` et `EMAILJS_TEMPLATE_ID`)

3. **Note** : Même avec Private Key, EmailJS peut avoir des restrictions. Mailgun reste recommandé.

### Solution 3 : Utiliser SMTP avec un service compatible Railway

Si vous avez déjà configuré SMTP, vous pouvez utiliser un service comme :
- **SendGrid** (API REST)
- **AWS SES** (API REST)
- **Resend** (API REST)

## 🎯 Recommandation

**Utilisez Mailgun** pour les appels backend. C'est la solution la plus fiable et la plus simple depuis Railway.

## 📊 Comparaison

| Service | Appels Backend | Gratuit | Fiabilité Railway |
|---------|----------------|---------|-------------------|
| **Mailgun** | ✅ Oui | 5000/mois | ⭐⭐⭐⭐⭐ |
| **EmailJS (Private Key)** | ⚠️ Peut être bloqué | 200/mois | ⭐⭐⭐ |
| **EmailJS (Public Key)** | ❌ Bloqué | 200/mois | ❌ |
| **SMTP (Gmail)** | ⚠️ Timeouts | Illimité | ⭐⭐ |

## 🚀 Migration vers Mailgun

1. **Suivez le guide** : `GUIDE_MAILGUN.md`
2. **Ajoutez les variables** sur Railway
3. **Redéployez** - Le système utilisera automatiquement Mailgun
4. **Testez** - Les emails devraient fonctionner immédiatement

## 📝 Logs Attendu avec Mailgun

**Avant (EmailJS bloqué)** :
```
❌ Erreur EmailJS: API calls are disabled for non-browser applications
⚠️ Échec de l'envoi via EmailJS, tentative avec Mailgun...
```

**Après (Mailgun configuré)** :
```
📧 Tentative d'envoi via Mailgun...
✅ Email envoyé via Mailgun à user@example.com
   Message ID: <20231223...@mailgun.org>
```

## ✅ Checklist

- [ ] Compte Mailgun créé
- [ ] Domaine sandbox noté
- [ ] API Key copiée
- [ ] Variables ajoutées sur Railway :
  - [ ] `MAILGUN_API_KEY`
  - [ ] `MAILGUN_DOMAIN`
  - [ ] `MAILGUN_FROM_EMAIL`
- [ ] Application redéployée
- [ ] Test d'envoi d'email effectué
- [ ] Email reçu

## 💡 Note Importante

EmailJS est excellent pour les **appels côté client (frontend)**, mais pour les **appels backend**, Mailgun est la meilleure solution.

