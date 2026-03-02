# 🔧 Activer les Appels API Non-Browser dans EmailJS

## ❌ Problème

Vous obtenez l'erreur :
```
❌ Erreur EmailJS: The Public Key is invalid
```

ou

```
❌ Erreur EmailJS: API calls are disabled for non-browser applications
```

## ✅ Solution : Activer les Appels API Non-Browser

EmailJS bloque par défaut les appels depuis les serveurs backend pour des raisons de sécurité. Vous devez activer cette fonctionnalité.

### 📋 Étapes pour Activer

1. **Connectez-vous à EmailJS** : https://dashboard.emailjs.com/
2. **Allez dans "Account"** (menu de gauche)
3. **Cliquez sur "Security"** (Sécurité)
4. **Trouvez la section "API Settings"** ou **"Non-browser applications"**
5. **Activez l'option** : "Allow API calls from non-browser applications" ou similaire
6. **Sauvegardez** les modifications

### 🔑 Vérifier votre Private Key

Assurez-vous d'utiliser la **Private Key** (pas la Public Key) :

1. **EmailJS** → **Account** → **API Keys**
2. **Copiez la "Private Key"** (API Key) - elle commence généralement par `private_` ou est différente de la Public Key
3. **Ajoutez sur Railway** :
   ```
   EMAILJS_PRIVATE_KEY = votre-private-key-ici
   ```

### ⚠️ Important

- **Public Key** = Pour le frontend uniquement (bloquée en backend)
- **Private Key** = Pour le backend (requise pour les appels serveur)

## 🔄 Après Activation

1. **Redéployez votre application** sur Railway
2. **Testez l'envoi d'email**
3. **Vérifiez les logs** - vous devriez voir :
   ```
   ✅ Email envoyé via EmailJS à user@example.com
   ```

## 💡 Alternative : Utiliser Mailgun

Si vous continuez à avoir des problèmes avec EmailJS, **Mailgun est recommandé** pour les appels backend :

- ✅ **Conçu pour les appels backend**
- ✅ **5000 emails/mois gratuits** (vs 200 pour EmailJS)
- ✅ **Plus fiable** depuis Railway
- ✅ **Pas de restrictions** d'appels backend

📖 **Guide Mailgun** : `GUIDE_MAILGUN.md`

## ✅ Checklist

- [ ] Connecté à EmailJS → Account → Security
- [ ] Activé "Allow API calls from non-browser applications"
- [ ] Vérifié que `EMAILJS_PRIVATE_KEY` est configurée sur Railway (pas `EMAILJS_PUBLIC_KEY`)
- [ ] Private Key copiée depuis EmailJS → Account → API Keys
- [ ] Application redéployée sur Railway
- [ ] Test d'envoi d'email effectué
- [ ] Email reçu

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs Railway** pour les détails d'erreur
2. **Vérifiez EmailJS → Logs** pour voir les tentatives d'envoi
3. **Utilisez Mailgun** (solution recommandée pour les appels backend)

