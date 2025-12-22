# Migration vers Singleton PrismaClient

## Problème
Le code crée plusieurs instances de `PrismaClient` dans différents fichiers, ce qui cause l'erreur :
```
MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

## Solution
Utiliser un singleton PrismaClient partagé dans tous les contrôleurs.

## Fichiers déjà migrés
- ✅ `server/src/utils/prisma.js` (nouveau fichier singleton)
- ✅ `server/src/controllers/paymentController.js`
- ✅ `server/src/controllers/studentController.js`
- ✅ `server/src/controllers/parentController.js`
- ✅ `server/src/controllers/authController.js`

## Fichiers à migrer
Remplacer dans tous les autres contrôleurs :
```javascript
// AVANT
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// APRÈS
import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';
const prisma = getPrisma();
```

### Liste des fichiers à migrer :
- `server/src/controllers/dashboardController.js`
- `server/src/controllers/assignmentController.js`
- `server/src/controllers/announcementController.js`
- `server/src/controllers/calendarController.js`
- `server/src/controllers/notificationController.js`
- `server/src/controllers/messageController.js`
- `server/src/controllers/scheduleController.js`
- `server/src/controllers/attendanceController.js`
- `server/src/controllers/gradeController.js`
- `server/src/controllers/classController.js`
- `server/src/controllers/bulletinController.js`
- `server/src/controllers/twoFactorController.js`
- `server/src/controllers/settingsController.js`
- `server/src/controllers/userController.js`
- `server/src/controllers/evaluationController.js`
- `server/src/controllers/replacementController.js`
- `server/src/controllers/subjectController.js`
- `server/src/controllers/roleController.js`
- `server/src/controllers/permissionController.js`
- `server/src/websocket/socketHandler.js`
- `server/src/middlewares/authMiddleware.js` (utilise un import dynamique)

## Script de migration automatique

Vous pouvez utiliser cette commande pour trouver tous les fichiers à migrer :

```bash
grep -r "new PrismaClient()" server/src/controllers/
```

Puis remplacer manuellement ou avec un script de remplacement.

