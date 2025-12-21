# Implémentation WebSocket avec Socket.IO - Récapitulatif

## ✅ Ce qui a été implémenté

### 1. **Backend (Serveur)**

#### Fichiers créés/modifiés :

- **`server/src/websocket/socketHandler.js`** (NOUVEAU)
  - Handler WebSocket avec Socket.IO
  - Authentification JWT pour les connexions WebSocket
  - Gestion des événements : `send_message`, `typing`, `mark_as_read`
  - Envoi de messages en temps réel aux destinataires connectés
  - Sauvegarde des messages dans Supabase via Prisma

- **`server/src/server.js`** (MODIFIÉ)
  - Utilisation de `createServer` au lieu de `app.listen`
  - Intégration de Socket.IO avec `initializeSocket(server)`
  - Health check mis à jour pour indiquer le statut WebSocket

#### Dépendances installées :
```bash
npm install socket.io
```

### 2. **Frontend (Client)**

#### Fichiers créés/modifiés :

- **`client/src/hooks/useSocket.ts`** (NOUVEAU)
  - Hook React pour gérer la connexion WebSocket
  - Authentification automatique avec le token JWT
  - Gestion de l'état de connexion (`isConnected`)
  - Gestion des erreurs de connexion
  - Reconnexion automatique en cas de déconnexion

- **`client/src/pages/administration/Messages.tsx`** (MODIFIÉ)
  - Intégration du hook `useSocket`
  - Envoi de messages via WebSocket (avec fallback sur API REST)
  - Réception de nouveaux messages en temps réel
  - Indicateur de statut de connexion WebSocket

- **`client/src/pages/parent/MessageParent.tsx`** (MODIFIÉ)
  - Intégration du hook `useSocket`
  - Envoi de messages via WebSocket (avec fallback sur API REST)
  - Réception de nouveaux messages en temps réel
  - Indicateur de statut de connexion WebSocket

#### Dépendances installées :
```bash
npm install socket.io-client
```

## 🔄 Fonctionnement

### Flux de communication :

1. **Connexion WebSocket** :
   - Le client se connecte automatiquement au serveur avec le token JWT
   - Le serveur authentifie l'utilisateur et crée une room `user:{userId}`

2. **Envoi de message** :
   - Le client émet `send_message` avec `receiverId` et `content`
   - Le serveur sauvegarde le message dans Supabase
   - Le serveur envoie le message au destinataire via `new_message`
   - Le serveur confirme à l'expéditeur via `message_sent`

3. **Réception de message** :
   - Le destinataire reçoit le message via l'événement `new_message`
   - Le message est ajouté automatiquement à la liste des messages
   - Les conversations sont mises à jour automatiquement

### Fallback API REST :

Si WebSocket n'est pas disponible :
- Les messages sont envoyés via l'API REST classique
- Les conversations sont rechargées périodiquement (toutes les 30 secondes)
- Un indicateur visuel informe l'utilisateur du mode hors ligne

## 🚀 Démarrage

### Backend :
```bash
cd server
npm run dev
```

Le serveur démarre avec :
- ✅ API REST sur `http://localhost:3000`
- ✅ WebSocket sur le même port (Socket.IO utilise le même serveur HTTP)

### Frontend :
```bash
cd client
npm run dev
```

Le client se connecte automatiquement au WebSocket au chargement de la page.

## 🔧 Configuration

### Variables d'environnement :

**Backend (`server/.env`)** :
```env
PORT=3000
JWT_SECRET=votre_secret_jwt
DATABASE_URL=postgresql://... (URL Supabase)
CORS_ORIGINS=http://localhost:5173,https://votre-domaine.com
```

**Frontend (`client/.env`)** :
```env
VITE_API_URL=http://localhost:3000
```

## 📊 Événements WebSocket

### Événements émis par le client :

- `send_message` : Envoyer un message
  ```javascript
  socket.emit('send_message', {
    receiverId: number,
    content: string
  });
  ```

- `typing` : Indicateur "en train d'écrire"
  ```javascript
  socket.emit('typing', {
    receiverId: number,
    isTyping: boolean
  });
  ```

- `mark_as_read` : Marquer un message comme lu
  ```javascript
  socket.emit('mark_as_read', {
    messageId: number
  });
  ```

### Événements reçus par le client :

- `new_message` : Nouveau message reçu
  ```javascript
  socket.on('new_message', (message) => {
    // message: Message avec sender, receiver, content, etc.
  });
  ```

- `message_sent` : Confirmation d'envoi
  ```javascript
  socket.on('message_sent', (message) => {
    // message: Message envoyé avec succès
  });
  ```

- `user_typing` : Indicateur de frappe
  ```javascript
  socket.on('user_typing', ({ userId, isTyping }) => {
    // Afficher "X est en train d'écrire..."
  });
  ```

- `error` : Erreur WebSocket
  ```javascript
  socket.on('error', ({ message }) => {
    // Afficher l'erreur
  });
  ```

## ✅ Avantages de cette implémentation

1. **Temps réel** : Les messages arrivent instantanément
2. **Fallback robuste** : Fonctionne même si WebSocket échoue
3. **Authentification sécurisée** : JWT requis pour chaque connexion
4. **Reconnexion automatique** : Gestion des déconnexions réseau
5. **Scalable** : Prêt pour Railway et Supabase en production

## 🔍 Tests

### Tester la messagerie instantanée :

1. Ouvrir deux navigateurs différents (ou onglets en navigation privée)
2. Se connecter avec deux comptes différents (un parent et un admin)
3. Envoyer un message depuis l'un
4. Le message doit apparaître instantanément dans l'autre navigateur

### Vérifier les logs :

**Backend** :
```
✅ Utilisateur 1 (PARENT) connecté via WebSocket
✅ Utilisateur 2 (ADMINISTRATION) connecté via WebSocket
📨 Message envoyé: 1 -> 2
```

**Frontend** (Console navigateur) :
```
✅ WebSocket connecté
📨 Message envoyé: 1 -> 2
```

## 🐛 Dépannage

### WebSocket ne se connecte pas :

1. Vérifier que le serveur est démarré
2. Vérifier les variables d'environnement (`VITE_API_URL`)
3. Vérifier les logs du serveur pour les erreurs d'authentification
4. Vérifier la console du navigateur pour les erreurs CORS

### Messages dupliqués :

- Les messages sont filtrés pour éviter les doublons
- Si problème persiste, vérifier que `message.id` est unique

### Messages ne s'affichent pas :

- Vérifier que les deux utilisateurs sont connectés
- Vérifier les logs du serveur
- Vérifier que `selectedConversation` correspond au bon utilisateur

## 📝 Notes importantes

- Les messages sont toujours sauvegardés dans Supabase, même via WebSocket
- L'API REST reste disponible pour compatibilité
- Le polling périodique est désactivé quand WebSocket est actif
- Les permissions (PARENT ↔ ADMINISTRATION) sont vérifiées côté serveur

## 🎯 Prochaines améliorations possibles

1. **Indicateur "en train d'écrire"** : Implémenter l'événement `typing`
2. **Notifications push** : Notifier même si l'utilisateur n'est pas sur la page
3. **Statut de lecture** : Afficher "lu" / "non lu" en temps réel
4. **Messages groupés** : Support pour les conversations de groupe
5. **Fichiers joints** : Envoi de fichiers via WebSocket

