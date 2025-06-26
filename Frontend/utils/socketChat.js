import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/api_url';

class SocketChatClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.listeners = new Map(); // Store event listeners
    this.messageCallbacks = new Map(); // Store message callbacks by channel
  }

  // Initialize socket connection
  async connect() {
    try {
      // Get auth token and user info
      const token = await AsyncStorage.getItem('@auth_token');
      const userData = await AsyncStorage.getItem('@user_data');
      
      if (!token || !userData) {
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(userData);
      this.userId = user.id;

      // Connect to Socket.IO server
      const socketUrl = API_URL.replace('/api', ''); // Remove /api from URL for socket connection
      
      this.socket = io(socketUrl, {
        transports: ['websocket'],
        upgrade: true
      });

      // Set up event listeners
      this.setupEventListeners();

      // Authenticate with server
      this.socket.emit('authenticate', {
        token: token
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.isConnected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.isConnected = false;
      this.emit('connection_status', { connected: false });
    });

    this.socket.on('authenticated', (data) => {
      console.log('Socket authentication successful:', data);
      this.emit('authenticated', data);
    });

    this.socket.on('authentication_error', (error) => {
      console.error('Socket authentication error:', error);
      this.emit('authentication_error', error);
    });

    this.socket.on('new_message', (message) => {
      console.log('New message received:', message);
      this.emit('new_message', message);
      
      // Call channel-specific callback if exists
      const channelCallback = this.messageCallbacks.get(message.channelId);
      if (channelCallback) {
        channelCallback(message);
      }
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('joined_channel', (data) => {
      console.log('Joined channel:', data);
      this.emit('joined_channel', data);
    });

    this.socket.on('join_channel_error', (error) => {
      console.error('Join channel error:', error);
      this.emit('join_channel_error', error);
    });

    this.socket.on('message_error', (error) => {
      console.error('Message error:', error);
      this.emit('message_error', error);
    });
  }

  // Join a specific channel
  joinChannel(channelId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_channel', { channelId });
    }
  }

  // Send a message
  sendMessage(channelId, text, messageType = 'text') {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        channelId,
        text,
        messageType
      });
    }
  }

  // Start typing indicator
  startTyping(channelId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { channelId });
    }
  }

  // Stop typing indicator
  stopTyping(channelId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { channelId });
    }
  }

  // Mark message as read
  markMessageRead(channelId, messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_read', { channelId, messageId });
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Set message callback for specific channel
  setChannelMessageCallback(channelId, callback) {
    this.messageCallbacks.set(channelId, callback);
  }

  // Remove message callback for channel
  removeChannelMessageCallback(channelId) {
    this.messageCallbacks.delete(channelId);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      this.messageCallbacks.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId
    };
  }
}

// Export a singleton instance
export default new SocketChatClient();
