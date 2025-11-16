import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";


interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  unread: number;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
}

export const Messages = () => {
  const [conversations] = useState<Conversation[]>([
    { id: 1, name: "Mr. Dupont", lastMessage: "À bientôt", unread: 2 },
    { id: 2, name: "Mme. Bernard", lastMessage: "Merci pour le message", unread: 0 },
  ]);
  const [selectedConvId, setSelectedConvId] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "Mr. Dupont", text: "Bonjour, comment allez-vous?", time: "10:30", isOwn: false },
    { id: 2, sender: "Admin", text: "Bonjour, très bien merci", time: "10:32", isOwn: true },
    { id: 3, sender: "Mr. Dupont", text: "À bientôt", time: "10:35", isOwn: false },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const message: Message = {
      id: messages.length + 1,
      sender: "Admin",
      text: newMessage,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };
    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <AdminLayout
      title="Messagerie"
      subtitle="Communiquez avec les enseignants, parents et élèves."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[28rem]">
        <Card className="border-0 shadow-lg">
          <div className="p-4 flex flex-col h-full">
            <h3 className="font-semibold text-blue-900 mb-3">Conversations</h3>
            <div className="space-y-2 overflow-y-auto flex-1">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selectedConvId === conv.id
                      ? "border-yellow-400 bg-yellow-50 text-blue-900"
                      : "border-blue-100 bg-blue-50/60 hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
                  type="button"
                >
                  <h4 className="font-semibold text-sm">{conv.name}</h4>
                  <p className="text-xs text-blue-700/70 truncate">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="inline-block text-xs bg-red-500 text-white px-2 py-0.5 rounded-full mt-1">
                      {conv.unread} non lus
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              onClick={() => alert("Nouvelle conversation")}
            >
              Nouvelle conversation
            </Button>
          </div>
        </Card>

        <Card className="md:col-span-3 border-0 shadow-lg">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg text-blue-900">
                {conversations.find(c => c.id === selectedConvId)?.name}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={() => alert("Archiver la conversation")}
              >
                Archiver
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`inline-block p-3 rounded-2xl max-w-xs shadow-sm ${
                      msg.isOwn ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-900 border border-blue-100"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.isOwn ? "text-white/70" : "text-blue-700/70"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Votre message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="form-control flex-1"
              />
              <Button type="submit" className="px-4 bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                Envoyer
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

