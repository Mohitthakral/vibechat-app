const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const setupSocketIO = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userData = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store socket connection
    connectedUsers.set(socket.userId, socket.id);

    // Emit online status
    io.emit('user-online', { userId: socket.userId });
    

    // Join personal room
    socket.join(socket.userId);

    // Handle typing indicator
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          senderId: socket.userId,
          senderData: socket.userData,
        });
      }
    });

    socket.on('stop-typing', ({ receiverId }) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-stop-typing', {
          senderId: socket.userId,
        });
      }
    });

    // Handle new message
    socket.on('send-message', async (messageData) => {
      console.log('📨 RECEIVED send-message:', messageData); // ADD THIS
         console.log('Socket userId:', socket.userId); // ADD THIS
      try {
        const { receiverId, content, mediaUrl, mediaType } = messageData;
          const [user1Id, user2Id] = [socket.userId, receiverId].sort();
          await prisma.conversation.upsert({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id
        }
      },
      create: {
        user1Id,
        user2Id
      },
      update: {
        updatedAt: new Date()
      }
    });
       // Create message in database
const message = await prisma.message.create({
  data: {
    content,
    mediaUrl,
    mediaType,
    senderId: socket.userId,
    receiverId,
    // Delete unread messages after 7 days
    deleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  include: {
    sender: {
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    },
    receiver: {
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    },
  },
});

        // Send to sender
        socket.emit('message-sent', message);

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new-message', message);
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle message read
    socket.on('message-read', async ({ messageId }) => {
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId },
        });

        if (message && message.receiverId === socket.userId) {
          const deleteAt = new Date();
          deleteAt.setHours(deleteAt.getHours() + 12);

          const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
              isRead: true,
              readAt: new Date(),
              deleteAt,
            },
          });

          // Notify sender that message was read
          const senderSocketId = connectedUsers.get(message.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-read-update', {
              messageId,
              readAt: updatedMessage.readAt,
            });
          }
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });
    // Handle get online users request
socket.on('get-online-users', () => {
  const onlineUserIds = Array.from(connectedUsers.keys());
  socket.emit('online-users-list', onlineUserIds);
});

   // Handle disconnect
socket.on('disconnect', () => {
  console.log(`User disconnected: ${socket.userId}`);
  connectedUsers.delete(socket.userId);
  io.emit('user-offline', { userId: socket.userId });
});
  });

  // Clean up expired messages every hour
  setInterval(async () => {
    try {
      const deleted = await prisma.message.deleteMany({
        where: {
          deleteAt: {
            lte: new Date(),
          },
        },
      });
      console.log(`Deleted ${deleted.count} expired messages`);
    } catch (error) {
      console.error('Error deleting expired messages:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
};

module.exports = setupSocketIO;