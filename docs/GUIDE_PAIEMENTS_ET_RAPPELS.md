# Guide : Gestion des Paiements et Rappels

## ✅ Fonctionnalités Implémentées

### 1. Rappel de Paiement Manuel
- **Côté Administration** : Bouton "📧 Rappel" dans `Fees.tsx` pour chaque échéance EN ATTENTE
- **Côté Backend** : Endpoint `POST /api/payments/:paymentId/send-reminder`
- **Notification** : Envoie une notification au parent avec :
  - Nom de l'élève
  - Montant de l'échéance
  - Montant total restant
  - Date limite de paiement

### 2. Affichage des Échéances dans ParentHeader
- **Système de couleurs** :
  - 🟢 **Vert** : Tout va bien, prochaine échéance affichée
  - 🟡 **Jaune** : Échéance dans moins de 7 jours OU moins de 60 jours avant le 5 mars
  - 🔴 **Rouge** : Moins de 30 jours avant le 5 mars OU date limite dépassée
- **Responsive** : S'affiche uniquement sur les écrans moyens et grands (hidden sur mobile)
- **Mise à jour automatique** : Recharge les paiements à chaque changement d'enfant

### 3. Blocage Automatique des Comptes
- **Champ ajouté** : `isBlocked` dans le modèle `User` (schema.prisma)
- **Vérification** : Lors de la connexion, vérifie si le compte est bloqué
- **Service** : `checkAndBlockOverdueAccounts()` dans `paymentReminderService.js`
- **Logique** : Bloque automatiquement les comptes parents avec des paiements en retard après le 5 mars 2026

### 4. Notifications Automatiques
- **Service** : `sendAutomaticPaymentReminders()` dans `paymentReminderService.js`
- **Fréquence** : À appeler chaque semaine à partir de février
- **Messages** :
  - **Plus d'un mois** : Rappel normal
  - **Moins d'un mois** : Avertissement avec nombre de jours restants
  - **Moins d'une semaine** : Message URGENT avec avertissement de blocage
- **Évite les doublons** : Un parent ne reçoit qu'une notification par semaine

## 📋 Routes API Disponibles

### Rappel Manuel
```
POST /api/payments/:paymentId/send-reminder
Authorization: Bearer <token>
Role: ADMINISTRATION, SUPER_ADMIN
```

### Vérification et Blocage des Comptes
```
POST /api/payment-reminders/check-and-block
Authorization: Bearer <token>
Role: ADMINISTRATION, SUPER_ADMIN
```

### Envoi des Rappels Automatiques
```
POST /api/payment-reminders/send-automatic-reminders
Authorization: Bearer <token>
Role: ADMINISTRATION, SUPER_ADMIN
```

## 🔧 Configuration d'un Cron Job (Recommandé)

Pour automatiser l'envoi des rappels et le blocage des comptes, configurez un cron job :

### Option 1 : Utiliser un service externe (Railway, Heroku Scheduler, etc.)
- Appeler `POST /api/payment-reminders/send-automatic-reminders` chaque semaine (ex: tous les lundis)
- Appeler `POST /api/payment-reminders/check-and-block` après le 5 mars (ex: tous les jours)

### Option 2 : Utiliser node-cron dans le serveur
Ajoutez dans `server.js` :

```javascript
import cron from 'node-cron';
import * as paymentReminderService from './services/paymentReminderService.js';

// Envoyer les rappels automatiques chaque lundi à 9h
cron.schedule('0 9 * * 1', async () => {
  try {
    const result = await paymentReminderService.sendAutomaticPaymentReminders();
    console.log(`Rappels automatiques envoyés: ${result.sent} notification(s)`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels automatiques:', error);
  }
});

// Vérifier et bloquer les comptes chaque jour à 8h (après le 5 mars)
cron.schedule('0 8 * * *', async () => {
  try {
    const result = await paymentReminderService.checkAndBlockOverdueAccounts();
    if (result.blocked > 0) {
      console.log(`Comptes bloqués: ${result.blocked} compte(s)`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des comptes:', error);
  }
});
```

## 📝 Migration de la Base de Données

Après avoir ajouté le champ `isBlocked` dans `schema.prisma`, exécutez :

```bash
npx prisma migrate dev --name add_is_blocked_field
```

Ou si vous utilisez Prisma Studio :

```bash
npx prisma db push
```

## 🎨 Interface Utilisateur

### Administration (Fees.tsx)
- Bouton "📧 Rappel" visible uniquement pour les paiements EN ATTENTE
- Confirmation avant envoi
- Message de succès/erreur affiché

### Parent (ParentHeader.tsx)
- Badge d'avertissement avec couleur dynamique
- Message contextuel selon la situation
- Masqué sur mobile pour économiser l'espace

## ⚠️ Notes Importantes

1. **Date limite fixe** : Le 5 mars 2026 est codé en dur dans le système
2. **Notifications** : Les notifications sont stockées en base de données et visibles dans `NotificationsPage.tsx`
3. **Blocage** : Un compte bloqué ne peut plus se connecter (erreur 403)
4. **Déblocage** : Pour débloquer un compte, mettez `isBlocked = false` dans la base de données

## 🔍 Vérification de la Logique Métier

### Montants par Niveau
- ✅ CM2 : 30 000 F/mois × 9 = 270 000 F
- ✅ Autres : 25 000 F/mois × 9 = 225 000 F

### Options de Paiement
- ✅ MONTHLY : Paiement le 5 de chaque mois
- ✅ QUARTERLY : Paiement le 5 du premier mois de chaque trimestre
- ✅ ANNUAL : Une ou deux tranches (dernière échéance le 5 mars)

### Comportement à l'Inscription
- ✅ Premier mois payé automatiquement (25k ou 30k selon le niveau)
- ✅ Échéances futures créées avec statut PENDING
- ✅ Date limite finale : 05 mars 2026

## 🚀 Prochaines Étapes (Optionnel)

1. **Interface de déblocage** : Ajouter une page admin pour débloquer les comptes
2. **Historique des rappels** : Tracker quand et combien de rappels ont été envoyés
3. **Email en plus des notifications** : Envoyer aussi un email au parent
4. **Dashboard parent** : Afficher un résumé des paiements sur la page d'accueil


