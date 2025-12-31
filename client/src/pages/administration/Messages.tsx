import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProtectedContent } from "../../components/permissions/ProtectedContent";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import * as messageService from "../../services/messageService";

export const Messages = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<messageService.Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<messageService.Conversation | null>(null);
  const [messages, setMessages] = useState<messageService.Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConversations, setShowConversations] = useState(false); // Pour mobile
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<messageService.Conversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, []);

  // Filtrer les conversations selon la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter(
          (conv) =>
            conv.name.toLowerCase().includes(query) ||
            conv.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, conversations]);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Recharger les conversations pour mettre à jour les compteurs
      loadConversations();
    }
  }, [selectedConversation]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Écouter les nouveaux messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: messageService.Message) => {
      // Si le message est pour la conversation actuelle, l'ajouter
      if (selectedConversation && 
          (message.senderId === selectedConversation.id || message.receiverId === selectedConversation.id)) {
        setMessages(prev => {
          // Éviter les doublons
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
      
      // Recharger les conversations pour mettre à jour le dernier message
      loadConversations();
    };

    const handleMessageSent = (message: messageService.Message) => {
      // Ajouter le message à la liste si c'est pour la conversation actuelle
      if (selectedConversation && 
          (message.senderId === selectedConversation.id || message.receiverId === selectedConversation.id)) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
      // Recharger les conversations
      loadConversations();
    };

    const handleError = (error: { message: string }) => {
      setError(error.message);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('error', handleError);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('error', handleError);
    };
  }, [socket, selectedConversation]);

  // Recharger les conversations périodiquement pour mettre à jour les compteurs (fallback si WebSocket échoue)
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        if (!selectedConversation) {
          loadConversations();
        }
      }, 30000); // Toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, [selectedConversation, isConnected]);

  const loadConversations = async () => {
    try {
      setError(null);
      const data = await messageService.getConversations();
      setConversations(data);
      setFilteredConversations(data);
      
      // Si aucune conversation n'est sélectionnée et qu'il y a des conversations, sélectionner la première
      if (!selectedConversation && data.length > 0) {
        setSelectedConversation(data[0]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: number) => {
    try {
      setError(null);
      const data = await messageService.getMessages(otherUserId);
      setMessages(data);
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // Utiliser WebSocket si disponible, sinon fallback sur API REST
    if (socket && isConnected) {
      setSending(true);
      setError(null);
      
      // Envoyer via WebSocket
      socket.emit('send_message', {
        receiverId: selectedConversation.id,
        content: newMessage.trim(),
      });

      setNewMessage("");
      // Le message sera ajouté via l'événement 'message_sent'
      // On remet sending à false après un court délai pour permettre l'émission
      setTimeout(() => {
        setSending(false);
      }, 100);
    } else {
      // Fallback sur API REST si WebSocket n'est pas disponible
      try {
        setSending(true);
        setError(null);
        
        const sentMessage = await messageService.sendMessage({
          receiverId: selectedConversation.id,
          content: newMessage.trim(),
        });

        setMessages([...messages, sentMessage]);
        setNewMessage("");
        await loadConversations();
      } catch (err) {
        console.error('Erreur lors de l\'envoi du message:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
      } finally {
        setSending(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      // Aujourd'hui : afficher seulement l'heure
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else {
      // Autre jour : afficher la date et l'heure
      return date.toLocaleDateString("fr-FR", { 
        day: "2-digit", 
        month: "2-digit",
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Messagerie"
        subtitle="Communiquez avec les enseignants, parents et élèves."
      >
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Messagerie"
      subtitle="Communiquez avec les enseignants, parents et élèves."
    >
      <ProtectedContent permission="users.read" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission d'accéder à la messagerie.
        </div>
      }>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 text-sm md:text-base text-red-700 mb-4">
            {error}
          </div>
        )}

      {/* Indicateur de connexion WebSocket */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4 text-sm md:text-base text-yellow-700 mb-4">
          ⚠️ Mode hors ligne - Les messages seront envoyés via l'API REST
        </div>
      )}

      {/* Bouton pour afficher les conversations sur mobile */}
      {!showConversations && !selectedConversation && (
        <button
          onClick={() => setShowConversations(true)}
          className="md:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
          aria-label="Afficher les conversations"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-250px)] md:h-[calc(100vh-300px)] min-h-[500px] md:min-h-[600px]">
        {/* Liste des conversations */}
        <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${
          showConversations ? 'block' : 'hidden md:flex'
        }`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-blue-900 mb-0">Conversations</h3>
            <button
              onClick={() => setShowConversations(false)}
              className="md:hidden p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              aria-label="Fermer la liste des conversations"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Barre de recherche */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin min-h-0">
            {filteredConversations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
              </p>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selectedConversation?.id === conv.id
                      ? "border-yellow-400 bg-yellow-50 text-blue-900"
                      : "border-blue-100 bg-blue-50/60 hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
                  type="button"
                >
                  <h4 className="font-semibold text-sm">{conv.name}</h4>
                  <p className="text-xs text-blue-700/70 truncate mt-1">
                    {conv.lastMessage || 'Aucun message'}
                  </p>
                  {conv.unread > 0 && (
                    <span className="inline-block text-xs bg-red-500 text-white px-2 py-0.5 rounded-full mt-1">
                      {conv.unread} non lus
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="md:col-span-3 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowConversations(true)}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    aria-label="Afficher les conversations"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-900">
                      {selectedConversation.name}
                    </h3>
                    <p className="text-xs text-gray-500">{selectedConversation.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>Aucun message dans cette conversation.</p>
                    <p className="text-sm mt-2">Envoyez un message pour commencer.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`inline-block p-3 rounded-2xl max-w-xs shadow-sm ${
                            isOwn ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-900 border border-blue-100"
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold mb-1 text-blue-700">
                              {msg.sender.firstName} {msg.sender.lastName}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-blue-700/70"}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Votre message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="form-control flex-1 text-sm md:text-base"
                    disabled={sending}
                  />
                  <Button 
                    type="submit" 
                    disabled={sending || !newMessage.trim()}
                    className="px-4 md:px-6 text-sm md:text-base bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500 disabled:opacity-50"
                  >
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">Sélectionnez une conversation</p>
                <p className="text-sm">Choisissez une conversation dans la liste pour commencer à chatter.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </ProtectedContent>
    </AdminLayout>
  );
};

