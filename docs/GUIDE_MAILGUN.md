# Guide Complet : Configuration Mailgun pour l'Envoi d'Emails

## Pourquoi Mailgun ?

Les logs Railway montrent des timeouts SMTP (`ETIMEDOUT`) lors des connexions à Gmail. Cela peut être dû à :
- Railway bloquant les connexions SMTP sortantes
- Gmail bloquant les connexions depuis Railway
- Restrictions de sécurité réseau

**Mailgun** résout ces problèmes car :
- ✅ Utilise une API REST (pas de connexion SMTP directe)
- ✅ Plus fiable et rapide
- ✅ Plan gratuit généreux : **5000 emails/mois**
- ✅ Spécialement conçu pour les emails transactionnels
- ✅ Fonctionne parfaitement depuis Railway

## 📋 Étape 1 : Créer un Compte Mailgun

1. **Allez sur** : https://www.mailgun.com/
2. **Cliquez sur "Sign Up"** (Inscription)
3. **Remplissez le formulaire** :
   - Email
   - Mot de passe
   - Nom de votre organisation (ex: "Expression d'Or")
4. **Vérifiez votre email** et activez votre compte

## 📋 Étape 2 : Vérifier votre Domaine (Optionnel mais Recommandé)

### Option A : Utiliser le Domaine Sandbox Mailgun (Gratuit, pour tests)

Mailgun fournit un domaine sandbox gratuit (ex: `sandbox1234567890abcdef.mailgun.org`) qui fonctionne immédiatement.

**Avantages** :
- ✅ Configuration instantanée
- ✅ Parfait pour les tests
- ⚠️ Les emails peuvent aller dans les spams

**Comment trouver votre domaine sandbox** :
1. Connectez-vous à Mailgun
2. Allez dans **Sending** → **Domain Settings**
3. Vous verrez votre domaine sandbox (ex: `sandbox1234567890abcdef.mailgun.org`)

### Option B : Vérifier votre Propre Domaine (Recommandé pour Production)

1. **Dans Mailgun**, allez dans **Sending** → **Domain Settings**
2. **Cliquez sur "Add New Domain"**
3. **Entrez votre domaine** (ex: `expressiondor.com`)
4. **Suivez les instructions** pour ajouter les enregistrements DNS :
   - TXT record pour la vérification
   - MX records
   - CNAME records
5. **Attendez la vérification** (peut prendre quelques heures)

## 📋 Étape 3 : Obtenir votre Clé API

1. **Dans Mailgun**, allez dans **Settings** → **API Keys**
2. **Trouvez la section "Private API key"**
3. **Copiez la clé API** (commence par `key-...`)
   - ⚠️ **Ne partagez jamais cette clé !**

## 📋 Étape 4 : Configurer les Variables d'Environnement sur Railway

1. **Allez sur votre projet Railway**
2. **Cliquez sur l'onglet "Variables"**
3. **Ajoutez les variables suivantes** :

### Variables Requises pour Mailgun :

| Nom de la Variable | Valeur | Exemple |
|-------------------|--------|---------|
| `MAILGUN_API_KEY` | Votre clé API Mailgun | `key-1234567890abcdef1234567890abcdef` |
| `MAILGUN_DOMAIN` | Votre domaine Mailgun | `sandbox1234567890abcdef.mailgun.org` ou `mg.expressiondor.com` |
| `MAILGUN_FROM_EMAIL` | Email expéditeur | `noreply@expressiondor.com` ou `noreply@sandbox1234567890abcdef.mailgun.org` |

### Variables Optionnelles :

| Nom de la Variable | Valeur | Exemple |
|-------------------|--------|---------|
| `MAILGUN_API_URL` | URL de l'API (généralement pas nécessaire) | `https://api.mailgun.net/v3` (par défaut) |

### Variables SMTP (Garder comme Fallback) :

Vous pouvez garder les variables SMTP existantes comme fallback :
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

**Le système essaiera Mailgun en premier, puis SMTP si Mailgun échoue.**

## 📋 Étape 5 : Redéployer sur Railway

1. **Après avoir ajouté les variables**, Railway redéploiera automatiquement
2. **Ou cliquez sur "Redeploy"** manuellement
3. **Vérifiez les logs** pour confirmer que Mailgun est détecté

## 📋 Étape 6 : Tester l'Envoi d'Email

1. **Inscrivez un nouvel élève** dans l'application
2. **Vérifiez les logs Railway** - vous devriez voir :
   ```
   📧 Tentative d'envoi via Mailgun...
   ✅ Email envoyé via Mailgun à [email]
   ```
3. **Vérifiez votre boîte email** (et les spams si vous utilisez le domaine sandbox)

## 🔍 Dépannage

### Problème : "Mailgun non configuré"

**Solution** : Vérifiez que vous avez bien ajouté `MAILGUN_API_KEY` et `MAILGUN_DOMAIN` sur Railway.

### Problème : "401 Unauthorized"

**Solution** : Votre clé API est incorrecte. Vérifiez-la dans Mailgun → Settings → API Keys.

### Problème : "Domain not found"

**Solution** : Vérifiez que `MAILGUN_DOMAIN` correspond exactement au domaine dans Mailgun (sans `https://` ou `/v3`).

### Problème : Les emails vont dans les spams

**Solution** :
- Utilisez votre propre domaine vérifié (pas le sandbox)
- Configurez SPF, DKIM et DMARC dans vos DNS
- Vérifiez la réputation de votre domaine sur Mailgun

## 📊 Comparaison : Mailgun vs SMTP

| Critère | Mailgun | SMTP (Gmail) |
|---------|---------|--------------|
| **Fiabilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Vitesse** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Configuration** | Simple (API) | Complexe (certificats, ports) |
| **Depuis Railway** | ✅ Fonctionne | ❌ Timeouts fréquents |
| **Plan gratuit** | 5000 emails/mois | Illimité (mais restrictions) |
| **Coût payant** | $35/mois (50k emails) | Gratuit |

## ✅ Checklist de Configuration

- [ ] Compte Mailgun créé
- [ ] Domaine configuré (sandbox ou propre domaine)
- [ ] Clé API copiée
- [ ] Variables d'environnement ajoutées sur Railway :
  - [ ] `MAILGUN_API_KEY`
  - [ ] `MAILGUN_DOMAIN`
  - [ ] `MAILGUN_FROM_EMAIL` (optionnel)
- [ ] Application redéployée sur Railway
- [ ] Test d'envoi d'email effectué
- [ ] Email reçu (vérifier les spams si sandbox)

## 🎯 Résultat Attendu

Après configuration, les logs Railway devraient montrer :
```
📧 Tentative d'envoi via Mailgun...
✅ Email envoyé via Mailgun à user@example.com
   Message ID: <20231222123456.1234567890@mg.example.com>
```

Au lieu de :
```
❌ Échec de la vérification SMTP: Connection timeout
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway pour les détails d'erreur
2. Consultez la documentation Mailgun : https://documentation.mailgun.com/
3. Vérifiez votre compte Mailgun → Logs pour voir les tentatives d'envoi

