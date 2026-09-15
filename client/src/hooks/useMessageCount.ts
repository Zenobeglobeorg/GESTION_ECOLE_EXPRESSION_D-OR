import { useContext } from 'react';
import { MessageCountContext } from '../contexts/MessageCountContext';

/**
 * Hook pour accéder au nombre de messages non lus, partagé entre toute
 * l'application (voir MessageCountProvider dans App.tsx).
 */
export const useMessageCount = () => {
  const context = useContext(MessageCountContext);
  if (context === undefined) {
    throw new Error('useMessageCount must be used within a MessageCountProvider');
  }
  return context;
};
