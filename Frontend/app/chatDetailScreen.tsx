import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, TouchableOpacity, View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useChatContext } from '../contexts/ChatContext';

const ChatDetailScreen = () => {
  const { channelId, channelName } = useLocalSearchParams();
  const chatContext = useChatContext();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    if (channelId) {
      chatContext.joinChannel(channelId as string);
      chatContext.loadChannelMessages(channelId as string).finally(() => setLoading(false));
    }
  }, [channelId]);

  const handleSend = () => {
    if (input.trim() && channelId) {
      chatContext.sendMessage(channelId as string, input.trim());
      setInput('');
    }
  };

  const channelMessages = chatContext.messages.get(channelId as string) || [];

  if (!chatContext.isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="wifi-off" size={64} color="#9CA3AF" />
          <Text className="text-xl font-medium mt-4">Unable to connect to chat</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {channelName || 'Chat'}
          </Text>
        </View>
      </View>
      {/* Chat Interface */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={channelMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className={`mb-2 ${item.user.id === chatContext.currentUser?.id ? 'items-end' : 'items-start'}`}>
                <View className={`px-4 py-2 rounded-lg ${item.user.id === chatContext.currentUser?.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Text className="text-base text-gray-800">{item.text}</Text>
                </View>
                <Text className="text-xs text-gray-400 mt-1">
                  {item.user.firstName} {item.user.lastName}
                </Text>
              </View>
            )}
            contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'flex-end' }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
        {/* Message Input */}
        <View className="flex-row items-center p-3 border-t border-gray-200 bg-white">
          <TextInput
            className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-base"
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend} className="ml-2">
            <MaterialIcons name="send" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;
