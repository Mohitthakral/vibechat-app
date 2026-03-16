import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ selectedUser }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedUserIdRef = useRef(null);
  const { socket, isUserOnline } = useSocket();

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?.id;
  }, [selectedUser?.id]);

  useEffect(() => {
    if (selectedUser?.id) {
      setMessages([]);
      loadConversation();
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const currentId = selectedUserIdRef.current;
      if (message.senderId === currentId || message.receiverId === currentId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleMessageSent = (message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    const handleTypingEvent = ({ senderId }) => {
      if (senderId === selectedUserIdRef.current) setTyping(true);
    };

    const handleStopTypingEvent = ({ senderId }) => {
      if (senderId === selectedUserIdRef.current) setTyping(false);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-sent', handleMessageSent);
    socket.on('user-typing', handleTypingEvent);
    socket.on('user-stop-typing', handleStopTypingEvent);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-sent', handleMessageSent);
      socket.off('user-typing', handleTypingEvent);
      socket.off('user-stop-typing', handleStopTypingEvent);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    // Safety check
    if (!selectedUser || !selectedUser.id || !user) {
      console.log('⚠️ No selected user or current user, skipping load');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('🔍 1. Starting to load conversation for:', selectedUser.id);
    console.log('🔍 2. Current user:', user.id);

    try {
      console.log('🔍 3. Calling API...');
      const response = await messageAPI.getConversation(selectedUser.id);
      console.log('🔍 4. API response:', response);
      console.log('🔍 5. Messages data:', response.data);
      console.log('🔍 6. Number of messages:', response.data?.length);

      setMessages(response.data || []);

      // Auto-mark incoming messages as read (starts 12hr deletion timer)
      const unreadMessages = (response.data || []).filter(
        msg => msg.receiverId === user.id && !msg.isRead
      );

      console.log('🔍 7. Unread messages to mark:', unreadMessages.length);

      // Mark each unread message as read (sets deleteAt to 12 hours from now)
      for (const message of unreadMessages) {
        try {
          await messageAPI.markAsRead(message.id);
          console.log('✓ Marked message as read, will delete in 12 hours:', message.id);
        } catch (err) {
          console.error('Error marking message as read:', err);
        }
      }
    } catch (error) {
      console.error('❌ Load conversation error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setMessages([]);
    } finally {
      console.log('🔍 8. Setting loading to false');
      setLoading(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-8xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-700">Select a conversation</h2>
          <p className="text-gray-500 mt-2">Choose someone to start chatting</p>
        </div>
      </div>
    );
  }

  const online = isUserOnline(selectedUser.id);

  return (
    <div className="flex-1 flex flex-col" style={{height: '100%', maxHeight: '100%', overflow: 'hidden'}}>
      {/* Header */}
       <div className="bg-primary-500 text-white p-4 shadow-lg" style={{flexShrink: 0}}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.displayName}&background=random`}
              alt={selectedUser.displayName}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            {online && (
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{selectedUser.displayName}</h3>
            <p className="text-sm opacity-90">
              {typing ? '✍️ typing...' : online ? '🟢 Online' : '⚫ Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2 w-full" style={{minHeight: 0, backgroundColor: '#FAF9FF'}}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-3">👋</div>
              <p>No messages yet. Say hello!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {typing && <TypingIndicator user={selectedUser} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Single Message Input */}
      <div style={{flexShrink: 0}}>
        <MessageInput receiverId={selectedUser.id} />
      </div>
    </div>
  );
}