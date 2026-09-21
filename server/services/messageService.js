const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notificationService');

const getOrCreateConversation = async (userId, otherUserId) => {
  if (userId.toString() === otherUserId.toString()) {
    throw ApiError.badRequest('You cannot message yourself.');
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
  }).populate('participants', 'name avatar isOnline');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, otherUserId],
      unreadCounts: new Map([
        [userId.toString(), 0],
        [otherUserId.toString(), 0],
      ]),
    });
    conversation = await conversation.populate('participants', 'name avatar isOnline');
  }

  return conversation;
};

const getConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name avatar isOnline')
    .sort('-updatedAt');

  return conversations;
};

const getMessages = async (conversationId, userId, query = {}) => {
  const { page = 1, limit = 50 } = query;

  // Verify user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw ApiError.notFound('Conversation not found.');
  }
  if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
    throw ApiError.forbidden('You are not a participant in this conversation.');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  return messages.reverse();
};

const sendMessage = async (conversationId, senderId, { content, attachments }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw ApiError.notFound('Conversation not found.');
  }
  if (!conversation.participants.some((p) => p.toString() === senderId.toString())) {
    throw ApiError.forbidden('You are not a participant in this conversation.');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    readBy: [senderId],
    attachments: attachments || [],
  });

  // Update conversation last message
  conversation.lastMessage = {
    content,
    sender: senderId,
    createdAt: new Date(),
  };

  // Increment unread count for other participants
  conversation.participants.forEach((p) => {
    if (p.toString() !== senderId.toString()) {
      const current = conversation.unreadCounts.get(p.toString()) || 0;
      conversation.unreadCounts.set(p.toString(), current + 1);
    }
  });

  await conversation.save();

  // Notify other participants
  const otherParticipants = conversation.participants.filter(
    (p) => p.toString() !== senderId.toString()
  );

  for (const participantId of otherParticipants) {
    await notificationService.create({
      userId: participantId,
      type: 'new_message',
      title: 'New Message',
      message: content.substring(0, 100),
      data: { conversationId: conversation._id, fromUser: senderId },
    });
  }

  return message.populate('sender', 'name avatar');
};

const markAsRead = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw ApiError.notFound('Conversation not found.');
  }
  if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
    throw ApiError.forbidden('You are not a participant in this conversation.');
  }

  // Reset unread count
  conversation.unreadCounts.set(userId.toString(), 0);
  await conversation.save();

  // Mark messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    },
    { $addToSet: { readBy: userId } }
  );

  return { message: 'Messages marked as read.' };
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
};
