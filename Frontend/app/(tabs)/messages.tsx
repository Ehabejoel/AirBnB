import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Chat, ChannelList, Channel, MessageList, MessageInput } from 'stream-chat-react-native';
import { useChatContext } from '../../contexts/ChatContext';
import { getUserChannels } from '../../utils/api';
import { getToken } from '../../utils/storage';

interface ChatChannel {
  id: string;
  type: string;
  name?: string;
  lastMessage?: string;
  memberCount?: number;
  members?: any;
  bookingId?: string;
  propertyTitle?: string;
}

const ChatScreen = () => {
  const { chatClient, isConnected, isLoading } = useChatContext();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isConnected && chatClient) {
      loadChannels();
    }
  }, [isConnected, chatClient]);

  const loadChannels = async () => {
    try {
      const token = await getToken();
      if (token && chatClient) {
        const channelData = await getUserChannels();
        setChannels(channelData.channels || []);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      Alert.alert('Error', 'Failed to load chat conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChannels();
  };
  const handleChannelPress = (channel: ChatChannel) => {
    router.push({
      pathname: '/chatDetailScreen',
      params: {
        channelId: channel.id,
        channelType: channel.type,
        channelName: channel.name,
      },
    });
  };

  const formatLastMessage = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChannelItem = ({ item }: { item: ChatChannel }) => (
    <TouchableOpacity
      className="bg-white p-4 border-b border-gray-200 flex-row items-center"
      onPress={() => handleChannelPress(item)}
    >
      <View className="w-12 h-12 bg-[#FF385C] rounded-full items-center justify-center mr-3">
        <MaterialIcons name="home" size={24} color="white" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-base" numberOfLines={1}>
          {item.name || `Booking Chat`}
        </Text>
        {item.propertyTitle && (
          <Text className="text-gray-600 text-sm" numberOfLines={1}>
            {item.propertyTitle}
          </Text>
        )}
        <Text className="text-gray-500 text-xs mt-1">
          {formatLastMessage(item.lastMessage)}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (isLoading || loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
          <Text className="mt-2 text-gray-600">Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialIcons name="wifi-off" size={64} color="#9CA3AF" />
          <Text className="text-xl font-medium mt-4 text-center">
            Unable to connect to chat
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Please check your internet connection and try again
          </Text>
          <TouchableOpacity
            className="bg-[#FF385C] px-6 py-3 rounded-lg mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-4">Messages</Text>
        </View>
      </View>

      {channels.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <MaterialIcons name="chat-bubble-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-medium mt-4 text-center">
            No conversations yet
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            When you have confirmed bookings, you'll be able to chat with hosts or guests here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={channels}
          renderItem={renderChannelItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;
