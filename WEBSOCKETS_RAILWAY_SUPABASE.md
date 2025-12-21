# WebSockets avec Railway et Supabase - Guide Production

## ✅ Réponse Rapide

**Oui, WebSockets avec Socket.IO fonctionnent parfaitement avec Railway (backend) et Supabase (base de données) !**

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │◄───────►│   Railway    │◄───────►│  Supabase   │
│  (Frontend) │ WebSocket│  (Backend)   │   HTTP   │  (Database) │
└─────────────┘         └──────────────┘         └─────────────┘
```

- **Supabase** : Base de données PostgreSQL (pas de problème, c'est juste la DB)
- **Railway** : Hébergement du backend Node.js avec Socket.IO
- **WebSockets** : Communication temps réel entre client et Railway

---

## 🚂 Railway - Configuration WebSockets

### ✅ Railway Supporte WebSockets

Railway supporte nativement les WebSockets. Voici ce qu'il faut configurer :

### 1. **Port et Configuration**

Dans votre `server.js` ou fichier principal :

```javascript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://votre-app.vercel.app",
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'], // Fallback sur polling si nécessaire
  pingTimeout: 60000,
  pingInterval: 25000
});

// Votre code Socket.IO ici
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);
  // ... votre logique
});

// Railway utilise le port défini dans la variable d'environnement PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
```

### 2. **Variables d'Environnement Railway**

Dans votre projet Railway, configurez :

```env
PORT=3000
CLIENT_URL=https://votre-app.vercel.app
JWT_SECRET=votre_secret
DATABASE_URL=postgresql://... (connexion Supabase)
```

### 3. **Railway.json (Optionnel)**

Créez un fichier `railway.json` à la racine :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/src/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. **Health Check**

Railway vérifie automatiquement la santé de votre application. Assurez-vous d'avoir un endpoint de santé :

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## 🗄️ Supabase - Base de Données

### ✅ Aucun Problème avec WebSockets

Supabase est **juste une base de données PostgreSQL**. Les WebSockets n'interagissent pas directement avec Supabase :

1. **WebSocket** : Communication client ↔ Railway (backend)
2. **Supabase** : Stockage des messages via Prisma/PostgreSQL

### Connexion Supabase depuis Railway

```javascript
// server/src/config/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // URL Supabase PostgreSQL
    }
  }
});

export default prisma;
```

### Exemple d'Utilisation dans Socket.IO

```javascript
import prisma from './config/database.js';

io.on('connection', async (socket) => {
  socket.on('send_message', async (data) => {
    try {
      // Sauvegarder dans Supabase via Prisma
      const message = await prisma.message.create({
        data: {
          senderId: socket.userId,
          receiverId: data.receiverId,
          content: data.content,
        },
      });

      // Envoyer via WebSocket
      io.to(`user:${data.receiverId}`).emit('new_message', message);
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de l\'envoi' });
    }
  });
});
```

---

## 🔧 Configuration Complète

### Structure de Fichiers Recommandée

```
server/
├── src/
│   ├── server.js          # Serveur Express + HTTP
│   ├── websocket/
│   │   └── socketHandler.js  # Logique Socket.IO
│   ├── config/
│   │   └── database.js    # Connexion Prisma/Supabase
│   └── ...
├── package.json
└── railway.json
```

### server/src/server.js

```javascript
import express from 'express';
import { createServer } from 'http';
import { initializeSocket } from './websocket/socketHandler.js';
import messageRoutes from './api/messageRoutes.js';
// ... autres imports

const app = express();
const server = createServer(app);

// Middlewares Express
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Routes API REST
app.use('/api/messages', messageRoutes);

// Health check pour Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocket: 'active'
  });
});

// Initialiser Socket.IO
const io = initializeSocket(server);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🔌 WebSocket actif`);
});
```

### server/src/websocket/socketHandler.js

```javascript
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware d'authentification
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token manquant'));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Utilisateur ${socket.userId} connecté`);

    // Rejoindre la room de l'utilisateur
    socket.join(`user:${socket.userId}`);

    // Écouter les nouveaux messages
    socket.on('send_message', async (data) => {
      try {
        // Sauvegarder dans Supabase
        const message = await prisma.message.create({
          data: {
            senderId: socket.userId,
            receiverId: data.receiverId,
            content: data.content,
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        });

        // Envoyer au destinataire
        socket.to(`user:${data.receiverId}`).emit('new_message', message);
        
        // Confirmer à l'expéditeur
        socket.emit('message_sent', message);
      } catch (error) {
        console.error('Erreur envoi message:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Indicateur "en train d'écrire"
    socket.on('typing', (data) => {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur ${socket.userId} déconnecté`);
    });
  });

  return io;
};
```

---

## 🌐 Frontend - Connexion WebSocket

### client/src/hooks/useSocket.ts

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
    });

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion WebSocket:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef.current;
};
```

### Utilisation dans MessageParent.tsx

```typescript
import { useSocket } from '../../hooks/useSocket';

const MessageParent = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      setMessages(prev => [...prev, message]);
      loadConversations();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim() || !selectedConversation) return;

    // Envoyer via WebSocket au lieu de l'API REST
    socket.emit('send_message', {
      receiverId: selectedConversation.id,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };
};
```

---

## 🔒 Sécurité

### 1. **Authentification JWT**
- Vérifier le token JWT dans le middleware Socket.IO
- Rejeter les connexions non authentifiées

### 2. **CORS**
- Configurer les origines autorisées
- Utiliser les variables d'environnement

### 3. **Rate Limiting**
- Limiter le nombre de messages par seconde
- Prévenir le spam

### 4. **Validation des Données**
- Valider tous les messages entrants
- Sanitizer le contenu

---

## 🚀 Déploiement sur Railway

### Étapes

1. **Connecter votre repo GitHub à Railway**
2. **Configurer les variables d'environnement** :
   - `PORT` (automatique)
   - `DATABASE_URL` (URL Supabase)
   - `JWT_SECRET`
   - `CLIENT_URL` (URL de votre frontend)

3. **Railway détecte automatiquement** :
   - Node.js
   - Package.json
   - Commande de démarrage

4. **Vérifier les logs** :
   ```bash
   railway logs
   ```

---

## ⚠️ Points d'Attention

### 1. **Timeout Railway**
- Railway peut fermer les connexions inactives
- Utiliser `pingInterval` et `pingTimeout` dans Socket.IO

### 2. **Scaling**
- Si vous scalez horizontalement, utilisez Redis Adapter pour Socket.IO
- Railway supporte le scaling horizontal

### 3. **Variables d'Environnement**
- Ne jamais commiter les secrets
- Utiliser Railway Secrets

---

## 📊 Monitoring

### Logs Railway

```javascript
// Ajouter des logs pour le debugging
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Connexion: ${socket.userId}`);
  
  socket.on('send_message', (data) => {
    console.log(`[${new Date().toISOString()}] Message envoyé: ${socket.userId} -> ${data.receiverId}`);
  });
});
```

### Métriques

- Nombre de connexions actives
- Messages envoyés/reçus
- Erreurs de connexion

---

## ✅ Checklist de Déploiement

- [ ] Socket.IO installé et configuré
- [ ] Authentification JWT dans Socket.IO
- [ ] Variables d'environnement configurées sur Railway
- [ ] CORS configuré correctement
- [ ] Health check endpoint créé
- [ ] Connexion Supabase testée
- [ ] Frontend connecté au WebSocket
- [ ] Tests de reconnexion effectués
- [ ] Logs vérifiés sur Railway

---

## 🎯 Conclusion

**Oui, WebSockets avec Socket.IO fonctionnent parfaitement avec Railway et Supabase !**

- ✅ **Railway** : Supporte nativement WebSockets
- ✅ **Supabase** : Base de données PostgreSQL standard (pas de problème)
- ✅ **Socket.IO** : Gère automatiquement les fallbacks et reconnexions

Il suffit de :
1. Configurer Socket.IO sur votre backend Railway
2. Connecter votre frontend au WebSocket
3. Utiliser Supabase comme base de données (via Prisma)

**C'est prêt pour la production !** 🚀

