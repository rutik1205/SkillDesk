const asyncHandler = require('../utils/asyncHandler');
const messageService = require('../services/messageService');

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getConversations(req.user._id);
  res.json({ success: true, data: { conversations } });
});

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const conversation = await messageService.getOrCreateConversation(
    req.user._id,
    req.body.userId
  );
  res.json({ success: true, data: { conversation } });
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessages(
    req.params.id,
    req.user._id,
    req.query
  );
  res.json({ success: true, data: { messages } });
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(
    req.params.id,
    req.user._id,
    req.body
  );

  // Emit via Socket.IO
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    io.to(`conversation:${req.params.id}`).emit('message:new', message);
  } catch (err) {
    // Socket might not be available
  }

  res.status(201).json({ success: true, data: { message } });
});

const markAsRead = asyncHandler(async (req, res) => {
  const result = await messageService.markAsRead(req.params.id, req.user._id);
  res.json({ success: true, data: result });
});

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
};
