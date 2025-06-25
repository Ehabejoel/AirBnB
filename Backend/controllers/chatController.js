const socketChatService = require('../services/socketChatService');
const User = require('../models/user');
const Booking = require('../models/booking');
const { Channel, Message } = require('../models/chat');

// Generate authentication info for Socket.IO chat
exports.generateChatToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For Socket.IO, we just need to return user info and socket URL
    // You can implement JWT token generation here if needed for additional security
    
    res.json({
      userId: userId,
      socketUrl: process.env.SOCKET_URL || `http://localhost:${process.env.PORT || 5000}`,
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error generating chat authentication:', error);
    res.status(500).json({ error: 'Failed to generate chat authentication' });
  }
};

// Get user's chat channels
exports.getUserChannels = async (req, res) => {
  try {
    const userId = req.user.id;
    const channels = await socketChatService.getUserChannels(userId);
    
    // Format channel data for frontend
    const channelData = channels.map(channel => ({
      id: channel.id,
      type: channel.type,
      name: channel.name,
      lastMessage: channel.lastMessage,
      memberCount: channel.members.length,
      members: channel.members.map(member => ({
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        profilePhoto: member.profilePhoto
      })),
      bookingId: channel.bookingId,
      propertyTitle: channel.propertyTitle,
      createdAt: channel.createdAt
    }));

    res.json({ channels: channelData });
  } catch (error) {
    console.error('Error getting user channels:', error);
    res.status(500).json({ error: 'Failed to get channels' });
  }
};

// Create a chat channel for a booking
exports.createBookingChannel = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('property', 'title')
      .populate('guest', 'firstName lastName email profilePhoto')
      .populate('host', 'firstName lastName email profilePhoto');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is either the host or guest
    const userId = req.user.id;
    if (userId !== booking.host._id.toString() && userId !== booking.guest._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to create channel for this booking' });
    }

    // Create channel using Socket.IO service
    const channel = await socketChatService.createBookingChannel(
      bookingId,
      booking.host._id.toString(),
      booking.guest._id.toString(),
      booking.property.title
    );

    res.json({
      channelId: channel.id,
      channelType: channel.type,
      success: true
    });
  } catch (error) {
    console.error('Error creating booking channel:', error);
    res.status(500).json({ error: 'Failed to create booking channel' });
  }
};

// Get messages for a specific channel
exports.getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await socketChatService.getChannelMessages(
      channelId, 
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message._id,
      channelId: message.channelId,
      text: message.text,
      user: {
        id: message.user._id,
        firstName: message.user.firstName,
        lastName: message.user.lastName,
        profilePhoto: message.user.profilePhoto
      },
      messageType: message.messageType,
      createdAt: message.createdAt,
      readBy: message.readBy
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error getting channel messages:', error);
    res.status(500).json({ error: 'Failed to get channel messages' });
  }
};

// Get online users
exports.getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = socketChatService.getOnlineUsers();
    res.json({ onlineUsers });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({ error: 'Failed to get online users' });
  }
};

// Check if user is online
exports.checkUserOnline = async (req, res) => {
  try {
    const { userId } = req.params;
    const isOnline = socketChatService.isUserOnline(userId);
    res.json({ userId, isOnline });
  } catch (error) {
    console.error('Error checking user online status:', error);
    res.status(500).json({ error: 'Failed to check user online status' });
  }
};
