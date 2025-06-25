const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Generate chat authentication info for Socket.IO
router.get('/token', auth, chatController.generateChatToken);

// Get user's chat channels
router.get('/channels', auth, chatController.getUserChannels);

// Create a chat channel for a booking
router.post('/booking/:bookingId/channel', auth, chatController.createBookingChannel);

// Get messages for a specific channel
router.get('/channels/:channelId/messages', auth, chatController.getChannelMessages);

// Get online users
router.get('/online-users', auth, chatController.getOnlineUsers);

// Check if specific user is online
router.get('/users/:userId/online', auth, chatController.checkUserOnline);

module.exports = router;
