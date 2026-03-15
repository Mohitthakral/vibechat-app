const prisma = require('./config/database');

async function createConversations() {
  try {
    console.log('🔍 Finding all message pairs...');
    
    // Get all unique sender-receiver pairs
    const messagePairs = await prisma.$queryRaw`
      SELECT DISTINCT 
        LEAST("senderId", "receiverId") as user1,
        GREATEST("senderId", "receiverId") as user2
      FROM "Message"
    `;

    console.log(`Found ${messagePairs.length} unique conversation pairs`);

    // Create conversation for each pair
    for (const pair of messagePairs) {
      try {
        await prisma.conversation.upsert({
          where: {
            user1Id_user2Id: {
              user1Id: pair.user1,
              user2Id: pair.user2
            }
          },
          create: {
            user1Id: pair.user1,
            user2Id: pair.user2
          },
          update: {
            updatedAt: new Date()
          }
        });
        console.log(`✅ Created conversation: ${pair.user1} <-> ${pair.user2}`);
      } catch (err) {
        console.log(`⚠️  Conversation already exists or error:`, err.message);
      }
    }

    console.log('✅ Done! All conversations created.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

createConversations();