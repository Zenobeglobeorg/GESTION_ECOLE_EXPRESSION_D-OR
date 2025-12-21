import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Hook pour gérer la connexion WebSocket avec Socket.IO
 */
export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('token');
    
    // Ne pas se connecter si pas de token ou d'utilisateur
    if (!token || !user) {
      return;
    }

    // Créer la connexion Socket.IO
    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    // Gestionnaires d'événements
    socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket déconnecté:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion WebSocket:', error);
      setConnectionError(error.message || 'Erreur de connexion');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Erreur WebSocket:', error);
      setConnectionError(error.message || 'Erreur WebSocket');
    });

    socketRef.current = socket;

    // Nettoyage lors du démontage
    return () => {
      console.log('🔌 Déconnexion WebSocket');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };
};

