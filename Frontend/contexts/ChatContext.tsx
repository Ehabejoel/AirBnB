import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import socketChatClient from '../utils/socketChat';
import { getChatAuth, getUserChannels, getChannelMessages } from '../utils/api';
import { getUser } from '../utils/storage';

interface Message {
  id: string;
  channelId: string;
  text: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  messageType: string;
  createdAt: string;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
}

interface Channel {
  id: string;
  type: string;
  name: string;
  lastMessage: string;
  memberCount: number;
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }>;
  bookingId?: string;
  propertyTitle?: string;
  createdAt: string;
}

interface TypingUser {
  userId: string;
  channelId: string;
  isTyping: boolean;
}

interface ChatContextType {
  isConnected: boolean;
  isLoading: boolean;
  channels: Channel[];
  messages: Map<string, Message[]>;
  typingUsers: TypingUser[];
  currentUser: any;
  chatClient?: any; // Add this line
  initializeChat: () => Promise<void>;
  disconnectChat: () => void;
  joinChannel: (channelId: string) => void;
  sendMessage: (channelId: string, text: string) => void;
  loadChannelMessages: (channelId: string, limit?: number, offset?: number) => Promise<void>;
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
  markMessageRead: (channelId: string, messageId: string) => void;
  refreshChannels: () => Promise<void>;
}

interface ChatProviderProps {
  children: ReactNode;
}

const ChatContext = createContext<ChatContextType>({
  isConnected: false,
  isLoading: false,
  channels: [],
  messages: new Map(),
  typingUsers: [],
  currentUser: null,
  initializeChat: async () => {},
  disconnectChat: () => {},
  joinChannel: () => {},
  sendMessage: () => {},
  loadChannelMessages: async () => {},
  startTyping: () => {},
  stopTyping: () => {},
  markMessageRead: () => {},
  refreshChannels: async () => {},
});

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const initializeChat = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔄 Initializing Socket.IO chat...');
      
      const user = await getUser();
      if (!user) {
        console.log('❌ No user found');
        return;
      }

      setCurrentUser(user);

      // Set up socket event listeners
      socketChatClient.on('connection_status', (data: { connected: boolean }) => {
        setIsConnected(data.connected);
      });

      socketChatClient.on('authenticated', (data: any) => {
        console.log('✅ Chat authenticated successfully');
        setIsConnected(true);
        refreshChannels();
      });

      socketChatClient.on('new_message', (message: Message) => {
        setMessages((prev) => {
          const channelMessages = prev.get(message.channelId) || [];
          const newMap = new Map(prev);
          newMap.set(message.channelId, [...channelMessages, message]);
          return newMap;
        });
      });

      socketChatClient.on('user_typing', (data: TypingUser) => {
        setTypingUsers((prev) => {
          const filtered = prev.filter(u => !(u.userId === data.userId && u.channelId === data.channelId));
          if (data.isTyping) {
            return [...filtered, data];
          }
          return filtered;
        });
      });

      socketChatClient.on('message_read', (data: { channelId: string; messageId: string; userId: string; readAt: string }) => {
        setMessages((prev) => {
          const channelMessages = prev.get(data.channelId) || [];
          const updatedMessages = channelMessages.map(msg => {
            if (msg.id === data.messageId) {
              return {
                ...msg,
                readBy: [...msg.readBy, { user: data.userId, readAt: data.readAt }]
              };
            }
            return msg;
          });
          const newMap = new Map(prev);
          newMap.set(data.channelId, updatedMessages);
          return newMap;
        });
      });

      // Connect to socket
      await socketChatClient.connect();
      
    } catch (error) {
      console.error('❌ Chat initialization failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectChat = (): void => {
    socketChatClient.disconnect();
    setIsConnected(false);
    setChannels([]);
    setMessages(new Map());
    setTypingUsers([]);
    setCurrentUser(null);
  };

  const joinChannel = (channelId: string): void => {
    socketChatClient.joinChannel(channelId);
  };

  const sendMessage = (channelId: string, text: string): void => {
    socketChatClient.sendMessage(channelId, text);
  };

  const loadChannelMessages = async (channelId: string, limit: number = 50, offset: number = 0): Promise<void> => {
    try {
      const response = await getChannelMessages(channelId, limit, offset);
      setMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(channelId, response.messages);
        return newMap;
      });
    } catch (error) {
      console.error('Error loading channel messages:', error);
    }
  };

  const startTyping = (channelId: string): void => {
    socketChatClient.startTyping(channelId);
  };

  const stopTyping = (channelId: string): void => {
    socketChatClient.stopTyping(channelId);
  };

  const markMessageRead = (channelId: string, messageId: string): void => {
    socketChatClient.markMessageRead(channelId, messageId);
  };

  const refreshChannels = async (): Promise<void> => {
    try {
      const response = await getUserChannels();
      setChannels(response.channels);
    } catch (error) {
      console.error('Error refreshing channels:', error);
    }
  };

  useEffect(() => {
    // Initialize chat when component mounts
    initializeChat();

    return () => {
      // Cleanup on unmount
      disconnectChat();
    };
  }, []);

  const contextValue: ChatContextType = {
    isConnected,
    isLoading,
    channels,
    messages,
    typingUsers,
    currentUser,
    chatClient: socketChatClient, // Add this line
    initializeChat,
    disconnectChat,
    joinChannel,
    sendMessage,
    loadChannelMessages,
    startTyping,
    stopTyping,
    markMessageRead,
    refreshChannels,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
