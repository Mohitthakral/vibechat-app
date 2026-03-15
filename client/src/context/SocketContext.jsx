import { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user) return;

    const socketInstance = getSocket();

    if (!socketInstance) return;

    setSocket(socketInstance);

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    socketInstance.on('user-online', handleUserOnline);
    socketInstance.on('user-offline', handleUserOffline);

    return () => {
      socketInstance.off('user-online', handleUserOnline);
      socketInstance.off('user-offline', handleUserOffline);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      isUserOnline: (userId) => onlineUsers.has(userId),
    }}>
      {children}
    </SocketContext.Provider>
  );
};