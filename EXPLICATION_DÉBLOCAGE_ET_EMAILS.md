# Explication : Déblocage de Comptes et Envoi d'Emails

## 🔒 Déblocage de Comptes

### Comment fonctionne le déblocage ?

**Réponse courte :** Oui, il faut que le compte soit bloqué avant qu'un bouton de déblocage n'apparaisse.

### Processus de blocage automatique

1. **Vérification automatique** : Chaque jour à 8h (via cron job), le système vérifie tous les comptes parents
2. **Condition de blocage** : Un compte est bloqué si :
   - La date limite (5 mars) est dépassée
   - ET le parent a des paiements en retard (statut `OVERDUE` ou `PENDING`)
3. **Blocage effectif** : Le champ `isBlocked` est mis à `true` dans la base de données
4. **Notification** : Le parent reçoit une notification lui indiquant que son compte est bloqué

### Affichage dans Fees.tsx

La section "Comptes Bloqués" n'apparaît que si :
- `blockedAccounts.length > 0` (il y a au moins un compte bloqué)
- L'utilisateur a la permission `fees.manage`

**Code :**
```tsx
{blockedAccounts.length > 0 && (
  <Card>
    {/* Section des comptes bloqués */}
  </Card>
)}
```

### Processus de déblocage

1. **Bouton "Débloquer"** : Apparaît uniquement pour les comptes avec `isBlocked: true`
2. **Action** : L'admin clique sur "Débloquer"
3. **Vérification** : Le système vérifie que :
   - Le compte est bien bloqué
   - L'utilisateur est bien un parent
4. **Déblocage** : Le champ `isBlocked` est remis à `false`
5. **Notification** : Le parent reçoit une notification de déblocage
6. **Actualisation** : La liste des comptes bloqués est rechargée

### Important

- Le déblocage ne règle **PAS** les paiements en retard
- Le compte peut être re-bloqué automatiquement le lendemain si les paiements ne sont toujours pas réglés
- Le déblocage est manuel et nécessite une action de l'administrateur

---

## 📧 Envoi d'Emails pour les Rappels de Paiement

### Quand un email est-il envoyé ?

Un email est envoyé dans **2 cas** :

#### 1. Rappel Manuel (par un administrateur)

**Quand :** Un admin clique sur le bouton "📧 Rappel" dans la page `Fees.tsx`

**Processus :**
1. L'admin clique sur "Rappel" pour un paiement spécifique
2. Le système envoie :
   - ✅ **Notification** (toujours envoyée)
   - ✅ **Email** (si EmailJS est configuré)

**Code :** `server/src/controllers/paymentController.js` → `sendPaymentReminder()`

**Résultat :**
- Si l'email réussit : `"Rappel de paiement envoyé avec succès (notification + email)"`
- Si l'email échoue : `"Rappel de paiement envoyé avec succès (notification)"` (la notification est toujours envoyée)

#### 2. Rappels Automatiques (via cron job)

**Quand :** Chaque lundi à 9h (configuré dans `server.js`)

**Conditions :**
- Le système vérifie tous les paiements en attente
- Seulement si on est en **février ou mars**
- Seulement si on n'a pas encore dépassé le 5 mars
- Un rappel par parent par semaine (pour éviter le spam)

**Processus :**
1. Le cron job s'exécute chaque lundi à 9h
2. Le système identifie les paiements en attente
3. Pour chaque paiement :
   - ✅ **Notification** (toujours envoyée)
   - ✅ **Email** (si EmailJS est configuré)

**Code :** `server/src/services/paymentReminderService.js` → `sendAutomaticPaymentReminders()`

### Configuration EmailJS pour les Paiements

Pour que les emails soient envoyés, vous devez configurer :

```env
EMAILJS_SERVICE_ID_PAYMENT=service_xxxxxxx
EMAILJS_TEMPLATE_ID_PAYMENT=template_xxxxxxx
EMAILJS_PRIVATE_KEY_PAYMENT=xxxxxxx
EMAILJS_PUBLIC_KEY_PAYMENT=xxxxxxx
```

**Note :** Si ces variables ne sont pas configurées, le système utilisera le compte EmailJS principal.

### Historique des Rappels

Chaque rappel envoyé (manuel ou automatique) est enregistré dans la table `PaymentReminder` avec :
- `paymentId` : ID du paiement concerné
- `userId` : ID du parent
- `sentBy` : ID de l'admin (null si automatique)
- `sentVia` : "notification", "email", ou "both"
- `emailSent` : true/false selon si l'email a réussi
- `createdAt` : Date et heure d'envoi

### Résumé : Moments d'envoi d'email

| Moment | Type | Email envoyé ? | Notification envoyée ? |
|--------|------|----------------|------------------------|
| Rappel manuel (admin) | Manuel | ✅ Oui (si configuré) | ✅ Oui (toujours) |
| Rappel automatique (lundi 9h) | Automatique | ✅ Oui (si configuré) | ✅ Oui (toujours) |
| Blocage de compte (8h) | Automatique | ❌ Non | ✅ Oui (toujours) |
| Déblocage de compte | Manuel | ❌ Non | ✅ Oui (toujours) |

---

## 🔍 Vérification

### Comment vérifier si un email a été envoyé ?

1. **Dans les logs du serveur** :
   - Cherchez `✅ Email envoyé via EmailJS`
   - Ou `⚠️ Erreur lors de l'envoi de l'email`

2. **Dans la base de données** :
   ```sql
   SELECT * FROM payment_reminders 
   WHERE emailSent = true 
   ORDER BY createdAt DESC;
   ```

3. **Dans l'interface admin** (à implémenter) :
   - Afficher l'historique des rappels dans `Fees.tsx`
   - Montrer si l'email a été envoyé ou non

### Comment tester l'envoi d'email ?

1. **Test manuel** :
   - Allez sur la page `Fees.tsx`
   - Cliquez sur "📧 Rappel" pour un paiement
   - Vérifiez les logs du serveur
   - Vérifiez la boîte email du parent

2. **Test automatique** :
   - Attendez le lundi à 9h
   - Ou déclenchez manuellement via l'API :
     ```bash
     POST /api/payment-reminders/send-automatic-reminders
     ```

---

## 📝 Notes Importantes

1. **Les notifications sont toujours envoyées**, même si l'email échoue
2. **Les emails sont optionnels** et dépendent de la configuration EmailJS
3. **Le déblocage est manuel** - aucun déblocage automatique
4. **Un compte peut être re-bloqué** si les paiements ne sont pas réglés
5. **L'historique est enregistré** pour chaque rappel envoyé


