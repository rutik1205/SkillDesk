const express = require('express');
const router = express.Router();
const {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage, markAsRead,
} = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.use(auth); // All message routes require authentication

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:id', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.put('/conversations/:id/read', markAsRead);

module.exports = router;
