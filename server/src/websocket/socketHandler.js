import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { setSocketIO } from '../controllers/notificationController.js';

const prisma = new PrismaClient();

/**
 * Initialise et configure Socket.IO pour la messagerie instantanée
 */
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
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
      console.error('Erreur d\'authentification WebSocket:', err);
      next(new Error('Token invalide'));
    }
  });

  // Définir l'instance Socket.IO pour les notifications
  setSocketIO(io);

  io.on('connection', (socket) => {
    console.log(`✅ Utilisateur ${socket.userId} (${socket.userRole}) connecté via WebSocket`);

    // Rejoindre la room de l'utilisateur pour recevoir ses messages
    socket.join(`user:${socket.userId}`);

    // Écouter les nouveaux messages
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;

        if (!receiverId || !content || !content.trim()) {
          socket.emit('error', { message: 'receiverId et content sont requis' });
          return;
        }

        const receiver = parseInt(receiverId);

        // Vérifier les permissions
        if (socket.userRole === 'PARENT') {
          // Les parents ne peuvent communiquer qu'avec l'administration
          const receiverData = await prisma.user.findUnique({
            where: { id: receiver },
            select: { role: true },
          });
          
          if (!receiverData || (receiverData.role !== 'ADMINISTRATION' && receiverData.role !== 'SUPER_ADMIN')) {
            socket.emit('error', { message: 'Accès non autorisé' });
            return;
          }
        } else if (socket.userRole === 'ADMINISTRATION' || socket.userRole === 'SUPER_ADMIN') {
          // L'administration peut communiquer avec les parents
          const receiverData = await prisma.user.findUnique({
            where: { id: receiver },
            select: { role: true },
          });
          
          if (!receiverData || receiverData.role !== 'PARENT') {
            socket.emit('error', { message: 'Accès non autorisé' });
            return;
          }
        } else {
          socket.emit('error', { message: 'Rôle non autorisé' });
          return;
        }

        // Créer le message dans la base de données
        const message = await prisma.message.create({
          data: {
            senderId: socket.userId,
            receiverId: receiver,
            content: content.trim(),
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        // Envoyer le message au destinataire s'il est connecté
        socket.to(`user:${receiver}`).emit('new_message', message);
        
        // Confirmer à l'expéditeur
        socket.emit('message_sent', message);

        console.log(`📨 Message envoyé: ${socket.userId} -> ${receiver}`);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Indicateur "en train d'écrire"
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      socket.to(`user:${receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: isTyping || false,
      });
    });

    // Marquer les messages comme lus
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await prisma.message.findUnique({
          where: { id: parseInt(messageId) },
        });

        if (!message) {
          socket.emit('error', { message: 'Message non trouvé' });
          return;
        }

        // Vérifier que l'utilisateur est le destinataire
        if (message.receiverId !== socket.userId) {
          socket.emit('error', { message: 'Accès non autorisé' });
          return;
        }

        await prisma.message.update({
          where: { id: parseInt(messageId) },
          data: { isRead: true },
        });

        socket.emit('message_read', { messageId });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du message:', error);
        socket.emit('error', { message: 'Erreur lors de la mise à jour du message' });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur ${socket.userId} déconnecté`);
    });
  });

  return io;
};

