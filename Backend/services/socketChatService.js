const { Channel, Message, Typing } = require('../models/chat');
const User = require('../models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Use environment variable or fallback secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

class SocketChatService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // AUTHENTICATE
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          console.log('Authenticating with data:', data);

          if (!token) {
            socket.emit('authentication_error', { error: 'Token is required' });
            return;
          }

          // Decode JWT
          const decoded = jwt.verify(token, JWT_SECRET);
          const userId = decoded.id;

          if (!userId) {
            socket.emit('authentication_error', { error: 'Invalid token: user ID missing' });
            return;
          }

          this.connectedUsers.set(userId, socket.id);
          socket.userId = userId;

          const userChannels = await this.getUserChannels(userId);
          userChannels.forEach(channel => {
            socket.join(channel.id);
          });

          socket.emit('authenticated', { success: true });
          console.log(`User ${userId} authenticated and joined channels`);
        } catch (error) {
          console.error('Socket authentication error:', error);
          socket.emit('authentication_error', { error: error.message });
        }
      });

      // JOIN CHANNEL
      socket.on('join_channel', async (data) => {
        try {
          const { channelId } = data;

          if (!socket.userId) {
            socket.emit('join_channel_error', { error: 'User not authenticated' });
            return;
          }

          const channel = await Channel.findOne({ id: channelId });
          if (!channel) {
            socket.emit('join_channel_error', { error: 'Channel not found' });
            return;
          }

          const memberIds = (channel.members || []).map(id => id.toString());
          if (memberIds.includes(socket.userId.toString())) {
            socket.join(channelId);
            socket.emit('joined_channel', { channelId, success: true });
          } else {
            socket.emit('join_channel_error', { error: 'Unauthorized to join this channel' });
          }
        } catch (error) {
          console.error('Join channel error:', error);
          socket.emit('join_channel_error', { error: error.message });
        }
      });

      // SEND MESSAGE
      socket.on('send_message', async (data) => {
        try {
          const { channelId, text, messageType = 'text' } = data;
          const channel = await Channel.findOne({ id: channelId });

          if (!channel) {
            socket.emit('message_error', { error: 'Channel not found' });
            return;
          }

          const memberIds = (channel.members || []).map(id => id.toString());
          if (!memberIds.includes(socket.userId?.toString())) {
            socket.emit('message_error', { error: 'Unauthorized to send message' });
            return;
          }

          const message = new Message({
            channelId,
            text,
            user: socket.userId,
            messageType
          });

          await message.save();
          await message.populate('user', 'firstName lastName profilePhoto');

          await Channel.findOneAndUpdate({ id: channelId }, { lastMessage: new Date() });

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

      // TYPING START
      socket.on('typing_start', async ({ channelId }) => {
        try {
          const channel = await Channel.findOne({ id: channelId });
          if (!channel || !channel.members.includes(socket.userId)) return;

          await Typing.findOneAndUpdate(
            { channelId, user: socket.userId },
            { channelId, user: socket.userId, isTyping: true },
            { upsert: true, new: true }
          );

          socket.to(channelId).emit('user_typing', {
            userId: socket.userId,
            channelId,
            isTyping: true
          });
        } catch (error) {
          console.error('Typing start error:', error);
        }
      });

      // TYPING STOP
      socket.on('typing_stop', async ({ channelId }) => {
        try {
          await Typing.deleteOne({ channelId, user: socket.userId });

          socket.to(channelId).emit('user_typing', {
            userId: socket.userId,
            channelId,
            isTyping: false
          });
        } catch (error) {
          console.error('Typing stop error:', error);
        }
      });

      // MARK MESSAGE READ
      socket.on('mark_read', async ({ channelId, messageId }) => {
        try {
          await Message.findByIdAndUpdate(messageId, {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          });

          this.io.to(channelId).emit('message_read', {
            messageId,
            userId: socket.userId,
            readAt: new Date()
          });
        } catch (error) {
          console.error('Mark read error:', error);
        }
      });

      // DISCONNECT
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  async createBookingChannel(bookingId, hostId, guestId, propertyTitle) {
    try {
      const channelId = `booking-${bookingId}`;
      let channel = await Channel.findOne({ id: channelId });

      if (!channel) {
        channel = new Channel({
          id: channelId,
          name: `${propertyTitle} - Booking Discussion`,
          members: [hostId, guestId],
          bookingId,
          propertyTitle,
          createdBy: hostId
        });
        await channel.save();

        const welcomeMessage = new Message({
          channelId,
          text: `🏠 Welcome to your booking discussion for "${propertyTitle}"!`,
          user: hostId,
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

  async getUserChannels(userId) {
    try {
      return await Channel.find({ members: userId })
        .populate('members', 'firstName lastName profilePhoto')
        .populate('bookingId', 'checkIn checkOut')
        .sort({ lastMessage: -1 });
    } catch (error) {
      console.error('Error getting user channels:', error);
      throw error;
    }
  }

  async getChannelMessages(channelId, userId, limit = 50, offset = 0) {
    try {
      const channel = await Channel.findOne({ id: channelId });
      if (!channel || !channel.members.includes(userId)) {
        throw new Error('Unauthorized to access channel messages');
      }

      const messages = await Message.find({ channelId })
        .populate('user', 'firstName lastName profilePhoto')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return messages.reverse();
    } catch (error) {
      console.error('Error getting channel messages:', error);
      throw error;
    }
  }

  async addUserToChannel(channelId, userId) {
    try {
      const channel = await Channel.findOneAndUpdate(
        { id: channelId },
        { $addToSet: { members: userId } },
        { new: true }
      );

      const socketId = this.connectedUsers.get(userId);
      if (socketId && this.io) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) socket.join(channelId);
      }

      return channel;
    } catch (error) {
      console.error('Error adding user to channel:', error);
      throw error;
    }
  }

  async removeUserFromChannel(channelId, userId) {
    try {
      const channel = await Channel.findOneAndUpdate(
        { id: channelId },
        { $pull: { members: userId } },
        { new: true }
      );

      const socketId = this.connectedUsers.get(userId);
      if (socketId && this.io) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) socket.leave(channelId);
      }

      return channel;
    } catch (error) {
      console.error('Error removing user from channel:', error);
      throw error;
    }
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketChatService();
