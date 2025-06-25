const { Channel, Message, Typing } = require('../models/chat');
const User = require('../models/user');
const mongoose = require('mongoose');

class SocketChatService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  // Initialize Socket.IO
  initialize(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication and join
      socket.on('authenticate', async (data) => {
        try {
          const { userId, token } = data;
          // You can add JWT token verification here if needed
          
          this.connectedUsers.set(userId, socket.id);
          socket.userId = userId;
          
          // Join user to their channels
          const userChannels = await this.getUserChannels(userId);
          userChannels.forEach(channel => {
            socket.join(channel.id);
          });

          socket.emit('authenticated', { success: true });
          console.log(`User ${userId} authenticated and joined channels`);
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authentication_error', { error: error.message });
        }
      });

      // Handle joining a specific channel
      socket.on('join_channel', async (data) => {
        try {
          const { channelId } = data;
          const channel = await Channel.findOne({ id: channelId });
          if (channel) {
            const memberIds = (channel.members || []).filter(Boolean).map(id => id.toString());
            if (memberIds.includes(socket.userId.toString())) {
              socket.join(channelId);
              socket.emit('joined_channel', { channelId, success: true });
            } else {
              socket.emit('join_channel_error', { error: 'Unauthorized or channel not found' });
            }
          } else {
            socket.emit('join_channel_error', { error: 'Channel not found' });
          }
        } catch (error) {
          console.error('Join channel error:', error);
          socket.emit('join_channel_error', { error: error.message });
        }
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { channelId, text, messageType = 'text' } = data;
          // Verify user is member of channel
          const channel = await Channel.findOne({ id: channelId });
          if (!channel) {
            socket.emit('message_error', { error: 'Channel not found' });
            return;
          }
          const memberIds = (channel.members || []).filter(Boolean).map(id => id.toString());
          if (!memberIds.includes(socket.userId.toString())) {
            socket.emit('message_error', { error: 'Unauthorized to send message' });
            return;
          }

          // Create message
          const message = new Message({
            channelId,
            text,
            user: socket.userId,
            messageType
          });

          await message.save();
          await message.populate('user', 'firstName lastName profilePhoto');

          // Update channel's last message time
          await Channel.findOneAndUpdate(
            { id: channelId },
            { lastMessage: new Date() }
          );

          // Emit to all channel members
          this.io.to(channelId).emit('new_message', {
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
          });

        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('message_error', { error: error.message });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', async (data) => {
        try {
          const { channelId } = data;
          
          // Verify user is member of channel
          const channel = await Channel.findOne({ id: channelId });
          if (!channel || !channel.members.includes(socket.userId)) {
            return;
          }

          // Save typing indicator
          await Typing.findOneAndUpdate(
            { channelId, user: socket.userId },
            { channelId, user: socket.userId, isTyping: true },
            { upsert: true, new: true }
          );

          // Emit to other channel members
          socket.to(channelId).emit('user_typing', {
            userId: socket.userId,
            channelId,
            isTyping: true
          });

        } catch (error) {
          console.error('Typing start error:', error);
        }
      });

      socket.on('typing_stop', async (data) => {
        try {
          const { channelId } = data;
          
          // Remove typing indicator
          await Typing.deleteOne({ channelId, user: socket.userId });

          // Emit to other channel members
          socket.to(channelId).emit('user_typing', {
            userId: socket.userId,
            channelId,
            isTyping: false
          });

        } catch (error) {
          console.error('Typing stop error:', error);
        }
      });

      // Handle marking messages as read
      socket.on('mark_read', async (data) => {
        try {
          const { channelId, messageId } = data;
          
          await Message.findByIdAndUpdate(
            messageId,
            {
              $addToSet: {
                readBy: {
                  user: socket.userId,
                  readAt: new Date()
                }
              }
            }
          );

          // Emit read receipt to channel
          this.io.to(channelId).emit('message_read', {
            messageId,
            userId: socket.userId,
            readAt: new Date()
          });

        } catch (error) {
          console.error('Mark read error:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  // Create a channel for a booking
  async createBookingChannel(bookingId, hostId, guestId, propertyTitle) {
    try {
      const channelId = `booking-${bookingId}`;
      // Check if channel already exists
      let channel = await Channel.findOne({ id: channelId });
      if (!channel) {
        channel = new Channel({
          id: channelId,
          name: `${propertyTitle} - Booking Discussion`,
          members: [mongoose.Types.ObjectId(hostId), mongoose.Types.ObjectId(guestId)],
          bookingId,
          propertyTitle,
          createdBy: mongoose.Types.ObjectId(hostId)
        });
        await channel.save();
        // Send welcome message
        const welcomeMessage = new Message({
          channelId,
          text: `🏠 Welcome to your booking discussion for "${propertyTitle}"! Feel free to ask any questions about your stay.`,
          user: mongoose.Types.ObjectId(hostId), // System message from host
          messageType: 'system'
        });
        await welcomeMessage.save();
      }
      return channel;
    } catch (error) {
      console.error('Error creating booking channel:', error);
      throw error;
    }
  }

  // Get channels for a user
  async getUserChannels(userId) {
    try {
      const channels = await Channel.find({
        members: userId
      })
      .populate('members', 'firstName lastName profilePhoto')
      .populate('bookingId', 'checkIn checkOut')
      .sort({ lastMessage: -1 });

      return channels;
    } catch (error) {
      console.error('Error getting user channels:', error);
      throw error;
    }
  }

  // Get messages for a channel
  async getChannelMessages(channelId, userId, limit = 50, offset = 0) {
    try {
      // Verify user is member of channel
      const channel = await Channel.findOne({ id: channelId });
      if (!channel || !channel.members.includes(userId)) {
        throw new Error('Unauthorized to access channel messages');
      }

      const messages = await Message.find({ channelId })
        .populate('user', 'firstName lastName profilePhoto')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting channel messages:', error);
      throw error;
    }
  }

  // Add user to channel
  async addUserToChannel(channelId, userId) {
    try {
      const channel = await Channel.findOneAndUpdate(
        { id: channelId },
        { $addToSet: { members: userId } },
        { new: true }
      );

      // If user is online, make them join the socket room
      const socketId = this.connectedUsers.get(userId);
      if (socketId && this.io) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(channelId);
        }
      }

      return channel;
    } catch (error) {
      console.error('Error adding user to channel:', error);
      throw error;
    }
  }

  // Remove user from channel
  async removeUserFromChannel(channelId, userId) {
    try {
      const channel = await Channel.findOneAndUpdate(
        { id: channelId },
        { $pull: { members: userId } },
        { new: true }
      );

      // If user is online, make them leave the socket room
      const socketId = this.connectedUsers.get(userId);
      if (socketId && this.io) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(channelId);
        }
      }

      return channel;
    } catch (error) {
      console.error('Error removing user from channel:', error);
      throw error;
    }
  }

  // Get online status of users
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketChatService();
