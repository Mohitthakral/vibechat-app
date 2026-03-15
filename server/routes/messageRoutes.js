const express = require('express');
const { getConversation, sendMessage, markAsRead, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId', getConversation);
router.post('/', upload.single('media'), sendMessage);
router.put('/:messageId/read', markAsRead);

module.exports = router;