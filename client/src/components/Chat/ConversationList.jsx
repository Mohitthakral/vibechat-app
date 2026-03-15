import { useState, useEffect } from 'react';
import { messageAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ConversationList({ onSelectUser }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, isUserOnline } = useSocket();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', handleNewMessage);
    
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket]);

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    loadConversations();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        console.log('🔍 Conversation item:', conv);
        
        const userId = conv.userId || conv.other_user_id;
        
        return (
          <motion.div
            key={userId}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              const userToSelect = {
                id: userId,
                username: conv.username,
                displayName: conv.displayName,
                avatar: conv.avatar,
              };
              console.log('✅ Selecting user:', userToSelect);
              onSelectUser(userToSelect);
            }}
           className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors"
          >
            <div className="relative">
              <img
                src={conv.avatar || `https://ui-avatars.com/api/?name=${conv.displayName}`}
                alt={conv.displayName}
                className="w-12 h-12 rounded-full"
              />
              {isUserOnline(userId) && (
                 <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="font-semibold text-gray-800 truncate">{conv.displayName}</h4>
                <span className="text-xs text-gray-500">
                  {format(new Date(conv.lastMessageTime), 'HH:mm')}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
              {conv.senderId === userId ? '' : 'You: '}
              {conv.lastMessage 
               ? conv.lastMessage 
              : conv.mediaType === 'image' 
             ? '🖼️ GIF' 
             : '📎 Media'
  }
</p>
            </div>
            
            {!conv.isRead && conv.senderId === userId && (
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            )}
          </motion.div>
        );
      })}
      
      {conversations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No conversations yet</p>
          <p className="text-sm mt-1">Search for users to start chatting!</p>
        </div>
      )}
    </div>
  );
}