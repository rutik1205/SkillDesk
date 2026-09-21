import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messageAPI } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const targetUser = searchParams.get('user');
    if (targetUser) {
      startConversation(targetUser);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeConv && socket) {
      socket.emit('conversation:join', activeConv._id);
      socket.on('message:new', (msg) => {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      });
      return () => {
        socket.emit('conversation:leave', activeConv._id);
        socket.off('message:new');
      };
    }
  }, [activeConv, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data.data.conversations);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const startConversation = async (userId) => {
    try {
      const res = await messageAPI.createConversation(userId);
      const conv = res.data.data.conversation;
      setActiveConv(conv);
      fetchMessages(conv._id);
      fetchConversations();
    } catch (err) { toast.error('Failed to start conversation'); }
  };

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    await fetchMessages(conv._id);
    try { await messageAPI.markAsRead(conv._id); } catch (e) {}
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await messageAPI.getMessages(convId);
      setMessages(res.data.data.messages);
    } catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await messageAPI.sendMessage(activeConv._id, { content: newMsg.trim() });
      setMessages((prev) => [...prev, res.data.data.message]);
      setNewMsg('');
      fetchConversations();
    } catch (err) { toast.error('Failed to send message'); }
    setSending(false);
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user._id);
  };

  if (loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="animate-fade-in h-[calc(100vh-10rem)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

      <div className="card h-[calc(100%-3rem)] flex overflow-hidden">
        {/* Conversation List */}
        <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b border-gray-100">
            <h2 className="font-semibold text-sm text-gray-900">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">No conversations yet</p>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const unread = conv.unreadCounts?.[user._id] || 0;
                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                      activeConv?._id === conv._id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar src={other?.avatar?.url} name={other?.name} size="md" />
                      {other?.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{other?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.content || 'Start chatting...'}</p>
                    </div>
                    {unread > 0 && (
                      <span className="w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} title="Select a conversation" message="Choose a conversation to start messaging" />
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="md:hidden text-gray-500 hover:text-gray-700">
                  ←
                </button>
                <Avatar src={getOtherParticipant(activeConv)?.avatar?.url} name={getOtherParticipant(activeConv)?.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{getOtherParticipant(activeConv)?.name}</p>
                  <p className="text-xs text-gray-500">{getOtherParticipant(activeConv)?.isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" disabled={!newMsg.trim() || sending} className="btn-primary !px-4">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
