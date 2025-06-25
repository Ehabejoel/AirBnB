const { StreamChat } = require('stream-chat');

class StreamChatService {
  constructor() {
    // You'll need to replace these with your actual Stream Chat credentials
    // Sign up at https://getstream.io/chat/ to get these
    this.apiKey = process.env.STREAM_API_KEY || '4kxsyhk6vb5z';
    this.apiSecret = process.env.STREAM_API_SECRET || '5sqdpa4yxwejn4fxjuem5dkqds2td66r5mjj3pz6ycmam8mynqfcsxwduyt4zz87';
        
    try {
      this.client = StreamChat.getInstance(this.apiKey, this.apiSecret);
    } catch (error) {
      console.error('Failed to initialize Stream Chat client:', error);
      this.client = null;
    }
  }
  // Generate a token for a user
  generateUserToken(userId) {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }
    return this.client.createToken(userId);
  }

  // Create or get user
  async createUser(userId, userData) {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }
    
    try {
      await this.client.upsertUser({
        id: userId,
        name: `${userData.firstName} ${userData.lastName}`,
        image: userData.profilePhoto || `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=ff385c&color=fff`,
        ...userData
      });
      return true;
    } catch (error) {
      console.error('Error creating Stream user:', error);
      throw error;
    }
  }

  // Create a channel for a booking
  async createBookingChannel(bookingId, hostId, guestId, propertyTitle) {
    try {
      const channelId = `booking-${bookingId}`;
      
      const channel = this.client.channel('messaging', channelId, {
        name: `${propertyTitle} - Booking Discussion`,
        members: [hostId, guestId],
        created_by_id: hostId,
        booking_id: bookingId,
        property_title: propertyTitle
      });

      await channel.create();
      
      // Send a welcome message
      await channel.sendMessage({
        text: `🏠 Welcome to your booking discussion for "${propertyTitle}"! Feel free to ask any questions about your stay.`,
        user_id: 'system'
      });

      return channel;
    } catch (error) {
      console.error('Error creating booking channel:', error);
      throw error;
    }
  }

  // Get channels for a user
  async getUserChannels(userId) {
    try {
      const filter = {
        type: 'messaging',
        members: { $in: [userId] }
      };
      
      const sort = { last_message_at: -1 };
      const channels = await this.client.queryChannels(filter, sort);
      
      return channels;
    } catch (error) {
      console.error('Error getting user channels:', error);
      throw error;
    }
  }

  // Add user to channel
  async addUserToChannel(channelId, userId) {
    try {
      const channel = this.client.channel('messaging', channelId);
      await channel.addMembers([userId]);
      return true;
    } catch (error) {
      console.error('Error adding user to channel:', error);
      throw error;
    }
  }

  // Remove user from channel
  async removeUserFromChannel(channelId, userId) {
    try {
      const channel = this.client.channel('messaging', channelId);
      await channel.removeMembers([userId]);
      return true;
    } catch (error) {
      console.error('Error removing user from channel:', error);
      throw error;
    }
  }
}

module.exports = new StreamChatService();
