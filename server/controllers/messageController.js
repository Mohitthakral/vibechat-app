const prisma = require('../config/database');
const cloudinary = require('../config/cloudinary');

// @desc    Get conversation with a user
// @route   GET /api/messages/:userId
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Get messages between current user and specified user
    const messages = await prisma.message.findMany({
      where: {
  OR: [
    { senderId: currentUserId, receiverId: userId },
    { senderId: userId, receiverId: currentUserId },
  ],
  AND: [
    {
      OR: [
        { deleteAt: null },
        { deleteAt: { gte: new Date() } },
      ],
    },
  ],
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, mediaType } = req.body;
    let mediaUrl = null;

    // If there's a file upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'vibechat/messages',
        resource_type: 'auto',
      });
      mediaUrl = result.secure_url;
    }

    const message = await prisma.message.create({
      data: {
        content,
        mediaUrl,
        mediaType,
        senderId: req.user.id,
        receiverId,
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

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiverId !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Calculate delete time (12 hours from now)
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

    res.json(updatedMessage);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's conversations list
// @route   GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all conversations for this user
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // For each conversation, get the last message (if any)
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.user1Id === currentUserId ? conv.user2 : conv.user1;
        
        // Get last message in this conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: otherUser.id },
              { senderId: otherUser.id, receiverId: currentUserId }
            ],
            AND: [
              {
                OR: [
                  { deleteAt: null },
                  { deleteAt: { gte: new Date() } }
                ]
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return {
          userId: otherUser.id,
          username: otherUser.username,
          displayName: otherUser.displayName,
          avatar: otherUser.avatar,
          lastMessage: lastMessage?.content || 'No messages yet',
          lastMessageTime: lastMessage?.createdAt || conv.createdAt,
          isRead: lastMessage?.isRead ?? true,
          senderId: lastMessage?.senderId
        };
      })
    );

    // Sort by last message time
    conversationsWithMessages.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(conversationsWithMessages);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversation,
  sendMessage,
  markAsRead,
  getConversations,
};