import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useChatContext } from '../../contexts/ChatContext';
import { getUserChannels } from '../../utils/api';

interface ChannelMember {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
}

interface ChatChannel {
  id: string;
  type: string;
  name?: string;
  lastMessage?: string;
  memberCount?: number;
  members?: ChannelMember[];
  bookingId?: string;
  propertyTitle?: string;
}

export default function HostInboxScreen() {
  const { isConnected, chatClient } = useChatContext();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected && chatClient) {
      loadChannels();
    }
  }, [isConnected, chatClient]);

  const loadChannels = async () => {
    try {
      const channelData = await getUserChannels();
      setChannels(channelData.channels || []);
    } catch (error) {
      setChannels([]);
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

  const renderChannelItem = ({ item }: { item: ChatChannel }) => (
    <TouchableOpacity
      className="bg-white p-4 border-b border-gray-200 flex-row items-center"
      onPress={() => handleChannelPress(item)}
    >
      <Image
        source={{ uri: item.members?.find((m: ChannelMember) => m.id !== chatClient?.userId)?.profilePhoto || 'https://ui-avatars.com/api/?name=User' }}
        className="w-12 h-12 rounded-full mr-3"
      />
      <View className="flex-1">
        <Text className="font-semibold" numberOfLines={1}>{item.name}</Text>
        <Text className="text-gray-600" numberOfLines={1}>{item.lastMessage ? 'New message' : 'No messages yet'}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Text className="text-lg font-semibold ml-4">Host Messages</Text>
        </View>
      </View>
      {channels.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <MaterialIcons name="chat-bubble-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-medium mt-4 text-center">
            No conversations yet
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            When you have confirmed bookings, you'll be able to chat with guests here.
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
}