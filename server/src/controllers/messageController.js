import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

/**
 * Récupère toutes les conversations pour l'utilisateur connecté
 * Pour les parents : conversations avec l'administration
 * Pour l'administration : conversations avec tous les parents
 */
export const getConversations = async (req, res) => {
  try {
    const user = req.user;
    
    let conversations = [];
    
    if (user.role === 'PARENT') {
      // Pour les parents : récupérer les conversations avec l'administration
      const adminUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMINISTRATION', 'SUPER_ADMIN'],
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      
      // Pour chaque admin, récupérer le dernier message et le nombre de messages non lus
      for (const admin of adminUsers) {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: admin.id },
              { senderId: admin.id, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        
        const unreadCount = await prisma.message.count({
          where: {
            senderId: admin.id,
            receiverId: user.id,
            isRead: false,
          },
        });
        
        conversations.push({
          id: admin.id,
          name: `${admin.firstName} ${admin.lastName}`,
          email: admin.email,
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.createdAt || null,
          unread: unreadCount,
        });
      }
    } else if (user.role === 'ADMINISTRATION' || user.role === 'SUPER_ADMIN') {
      // Pour l'administration : récupérer les conversations avec tous les parents
      const parentUsers = await prisma.user.findMany({
        where: {
          role: 'PARENT',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      
      // Pour chaque parent, récupérer le dernier message et le nombre de messages non lus
      for (const parent of parentUsers) {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: parent.id },
              { senderId: parent.id, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        
        const unreadCount = await prisma.message.count({
          where: {
            senderId: parent.id,
            receiverId: user.id,
            isRead: false,
          },
        });
        
        conversations.push({
          id: parent.id,
          name: `${parent.firstName} ${parent.lastName}`,
          email: parent.email,
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.createdAt || null,
          unread: unreadCount,
        });
      }
    }
    
    // Trier par date du dernier message (plus récent en premier)
    conversations.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
    
    res.json(conversations);
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
};

/**
 * Récupère tous les messages d'une conversation entre deux utilisateurs
 */
export const getMessages = async (req, res) => {
  try {
    const user = req.user;
    const { otherUserId } = req.params;
    const otherUser = parseInt(otherUserId);
    
    if (!otherUser) {
      return res.status(400).json({ error: 'ID utilisateur invalide' });
    }
    
    // Vérifier les permissions
    if (user.role === 'PARENT') {
      // Les parents ne peuvent communiquer qu'avec l'administration
      const otherUserData = await prisma.user.findUnique({
        where: { id: otherUser },
        select: { role: true },
      });
      
      if (!otherUserData || (otherUserData.role !== 'ADMINISTRATION' && otherUserData.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
    } else if (user.role === 'ADMINISTRATION' || user.role === 'SUPER_ADMIN') {
      // L'administration peut communiquer avec les parents
      const otherUserData = await prisma.user.findUnique({
        where: { id: otherUser },
        select: { role: true },
      });
      
      if (!otherUserData || otherUserData.role !== 'PARENT') {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
    } else {
      return res.status(403).json({ error: 'Rôle non autorisé' });
    }
    
    // Récupérer tous les messages entre les deux utilisateurs
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUser },
          { senderId: otherUser, receiverId: user.id },
        ],
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
      orderBy: { createdAt: 'asc' },
    });
    
    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        senderId: otherUser,
        receiverId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    
    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
};

/**
 * Envoie un nouveau message
 */
export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ error: 'receiverId et content sont requis' });
    }
    
    const receiver = parseInt(receiverId);
    
    // Vérifier les permissions
    if (user.role === 'PARENT') {
      // Les parents ne peuvent communiquer qu'avec l'administration
      const receiverData = await prisma.user.findUnique({
        where: { id: receiver },
        select: { role: true },
      });
      
      if (!receiverData || (receiverData.role !== 'ADMINISTRATION' && receiverData.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
    } else if (user.role === 'ADMINISTRATION' || user.role === 'SUPER_ADMIN') {
      // L'administration peut communiquer avec les parents
      const receiverData = await prisma.user.findUnique({
        where: { id: receiver },
        select: { role: true },
      });
      
      if (!receiverData || receiverData.role !== 'PARENT') {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
    } else {
      return res.status(403).json({ error: 'Rôle non autorisé' });
    }
    
    // Créer le message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
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
    
    res.status(201).json(message);
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
};

/**
 * Marque un message comme lu
 */
export const markAsRead = async (req, res) => {
  try {
    const user = req.user;
    const { messageId } = req.params;
    
    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le destinataire
    if (message.receiverId !== user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: { isRead: true },
    });
    
    res.json(updatedMessage);
  } catch (err) {
    console.error('markAsRead error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du message' });
  }
};

/**
 * Récupère le nombre de messages non lus pour l'utilisateur connecté
 */
export const getUnreadCount = async (req, res) => {
  try {
    const user = req.user;
    
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        isRead: false,
      },
    });
    
    res.json({ unread: unreadCount });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du nombre de messages non lus' });
  }
};



