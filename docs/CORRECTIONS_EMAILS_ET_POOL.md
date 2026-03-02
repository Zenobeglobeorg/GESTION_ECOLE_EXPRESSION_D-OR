# Corrections : Emails et Pool de Connexions Prisma

## Problèmes identifiés et résolus

### 1. ❌ Erreur "MaxClientsInSessionMode: max clients reached"

**Cause** : Chaque contrôleur créait sa propre instance de `PrismaClient`, ce qui saturait le pool de connexions PostgreSQL.

**Solution** : Création d'un singleton PrismaClient partagé.

**Fichiers modifiés** :
- ✅ `server/src/utils/prisma.js` (nouveau fichier singleton)
- ✅ Tous les contrôleurs migrés vers `getPrisma()`

**Migration effectuée** :
```javascript
// AVANT
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// APRÈS
import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';
const prisma = getPrisma();
```

### 2. ❌ Timeout SMTP (ETIMEDOUT)

**Cause** : Timeouts trop courts pour les connexions SMTP depuis Railway vers Gmail.

**Solution** : Augmentation des timeouts et configuration du pool de connexions.

**Fichiers modifiés** :
- ✅ `server/src/services/passwordResetEmail.js`
- ✅ `server/src/services/emailService.js`

**Changements** :
```javascript
const transporter = nodemailer.createTransport({
  // ... configuration existante ...
  connectionTimeout: 60000, // 60 secondes (au lieu de 30s par défaut)
  greetingTimeout: 30000,   // 30 secondes
  socketTimeout: 60000,     // 60 secondes
  pool: true,               // Activer le pool de connexions
  maxConnections: 5,        // Maximum 5 connexions simultanées
  maxMessages: 100,         // Maximum 100 messages par connexion
});
```

### 3. ❌ Email stocké en majuscule mais envoyé tel quel

**Cause** : Les emails sont stockés en majuscule dans la base de données mais doivent être envoyés en minuscule.

**Solution** : Normalisation de l'email en minuscule avant l'envoi.

**Fichiers modifiés** :
- ✅ `server/src/services/passwordResetEmail.js`
- ✅ `server/src/services/emailService.js`
- ✅ `server/src/controllers/authController.js`
- ✅ `server/src/controllers/studentController.js`

**Changements** :
```javascript
// Normaliser l'email en minuscule pour l'envoi (même si stocké en majuscule)
const normalizedEmail = email.toLowerCase().trim();
// Utiliser normalizedEmail pour l'envoi
```

### 4. ✅ Auto-remplissage du formulaire lors de la recherche d'un parent

**Fonctionnalité** : Quand un parent existant est trouvé lors de l'inscription d'un élève, le formulaire se remplit automatiquement avec les informations du parent (depuis le premier enfant).

**Fichiers modifiés** :
- ✅ `server/src/controllers/parentController.js` - Retourne `parentInfo` avec les informations extraites
- ✅ `client/src/services/parentService.ts` - Interface mise à jour
- ✅ `client/src/pages/administration/StudentRegistrationPage.tsx` - Auto-remplissage implémenté

**Fonctionnement** :
1. L'admin recherche un parent par email
2. Si trouvé, le backend retourne les informations du parent + `parentInfo` (extrait du premier enfant)
3. Le frontend remplit automatiquement les champs :
   - `fatherName`, `fatherAddress`, `fatherContact`
   - `motherName`, `motherAddress`, `motherContact`
   - `guardianName`, `guardianContact`
   - `authorizedPerson1Name`, `authorizedPerson1Tel`
   - `authorizedPerson2Name`, `authorizedPerson2Tel`

### 5. ✅ Optimisation de la création des paiements

**Problème** : Création de plusieurs paiements en parallèle causait des problèmes de pool.

**Solution** : Utilisation d'une transaction Prisma interactive avec fallback séquentiel.

**Fichier modifié** :
- ✅ `server/src/controllers/paymentController.js`

**Changements** :
```javascript
// Utiliser une transaction interactive Prisma
const payments = await prisma.$transaction(async (tx) => {
  const createdPayments = [];
  for (const item of schedule) {
    const payment = await tx.payment.create({ ... });
    createdPayments.push(payment);
  }
  return createdPayments;
}, {
  timeout: 30000,
  maxWait: 10000,
});

// Fallback séquentiel avec délai si la transaction échoue
```

## Fichiers migrés vers le singleton PrismaClient

✅ `server/src/controllers/paymentController.js`
✅ `server/src/controllers/studentController.js`
✅ `server/src/controllers/parentController.js`
✅ `server/src/controllers/authController.js`
✅ `server/src/controllers/dashboardController.js`
✅ `server/src/controllers/notificationController.js`
✅ `server/src/controllers/messageController.js`
✅ `server/src/controllers/assignmentController.js`
✅ `server/src/controllers/calendarController.js`
✅ `server/src/controllers/announcementController.js`
✅ `server/src/controllers/scheduleController.js`
✅ `server/src/controllers/attendanceController.js`
✅ `server/src/controllers/gradeController.js`
✅ `server/src/controllers/classController.js`
✅ `server/src/controllers/bulletinController.js`
✅ `server/src/controllers/settingsController.js`
✅ `server/src/controllers/userController.js`
✅ `server/src/controllers/twoFactorController.js`
✅ `server/src/controllers/evaluationController.js`
✅ `server/src/controllers/replacementController.js`
✅ `server/src/controllers/subjectController.js`
✅ `server/src/controllers/roleController.js`
✅ `server/src/controllers/permissionController.js`
✅ `server/src/websocket/socketHandler.js`
✅ `server/src/middlewares/authMiddleware.js`

## Notes importantes

### Configuration SMTP sur Railway

Si les emails ne sont toujours pas envoyés après ces corrections, vérifiez :

1. **Variables d'environnement sur Railway** :
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=votre.email@gmail.com`
   - `SMTP_PASS=votre-mot-de-passe-d-application` (⚠️ Pas le mot de passe du compte, mais un "Mot de passe d'application")
   - `FRONTEND_URL=https://votre-frontend.vercel.app`

2. **Gmail - Mot de passe d'application** :
   - Activez la validation en deux étapes sur votre compte Google
   - Générez un "Mot de passe d'application" : https://myaccount.google.com/apppasswords
   - Utilisez ce mot de passe de 16 caractères pour `SMTP_PASS`

3. **Alternative si Gmail bloque toujours** :
   - Considérez utiliser un service d'email tiers :
     - SendGrid (gratuit jusqu'à 100 emails/jour)
     - Mailgun (gratuit jusqu'à 5000 emails/mois)
     - AWS SES (payant mais très fiable)

### Pool de connexions Prisma

Le singleton PrismaClient partagé résout le problème de pool. Si vous rencontrez encore des problèmes :

1. Vérifiez la configuration de votre base de données PostgreSQL sur Supabase
2. Augmentez `pool_size` si nécessaire dans la chaîne de connexion DATABASE_URL
3. Surveillez les logs Railway pour détecter d'autres goulots d'étranglement

## Tests à effectuer

1. ✅ Inscription d'un élève avec création automatique d'un parent
2. ✅ Recherche d'un parent existant et auto-remplissage du formulaire
3. ✅ Envoi d'email de bienvenue (vérifier les logs Railway)
4. ✅ Réinitialisation de mot de passe (vérifier les logs Railway)
5. ✅ Création des paiements sans erreur de pool

## Prochaines étapes

Si les emails ne fonctionnent toujours pas après ces corrections :

1. Vérifiez les logs Railway pour les détails d'erreur SMTP
2. Testez la connexion SMTP manuellement avec un script de test
3. Considérez migrer vers un service d'email tiers (SendGrid, Mailgun, etc.)

