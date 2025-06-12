// InboxScreen.js
import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function InboxScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const messages = [
    {
      id: '1',
      user: 'Maria Host',
      avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
      lastMessage: 'Your booking is confirmed! Check-in details will be sent closer to your stay.',
      time: '2d ago',
      unread: true
    },
    {
      id: '2',
      user: 'John Support',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastMessage: 'Hi! How can I help you today?',
      time: '1w ago',
      unread: false
    },
    {
      id: '3',
      user: 'Lisa Travel Agent',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      lastMessage: 'I found some amazing deals for your trip to Barcelona next month!',
      time: '3d ago',
      unread: true
    },
    {
      id: '4',
      user: 'Robert Properties',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      lastMessage: 'Thank you for your interest. The property is still available for your dates.',
      time: '5d ago',
      unread: false
    },
    {
      id: '5',
      user: 'Emma Concierge',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      lastMessage: 'Your dinner reservation has been confirmed for Friday at 8pm.',
      time: '1w ago',
      unread: false
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold">Messages</Text>
          <View className="flex-row">
            <TouchableOpacity className="mr-4">
              <MaterialIcons name="filter-list" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialIcons name="more-vert" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View className="bg-gray-100 rounded-full flex-row items-center px-4 py-2 mb-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search messages"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Message List */}
      <ScrollView className="flex-1">
        {messages.length > 0 ? (
          <View>
            {messages.map((message) => (
              <TouchableOpacity 
                key={message.id} 
                className={`flex-row items-center p-4 border-b border-gray-100 ${message.unread ? 'bg-gray-50' : ''}`}
                onPress={() => navigation.navigate('ChatDetail', { user: message.user, avatar: message.avatar })}
              >
                <View className="relative">
                  <Image
                    source={{ uri: message.avatar }}
                    className="w-14 h-14 rounded-full"
                  />
                  {message.unread && (
                    <View className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                  )}
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`font-semibold text-base ${message.unread ? 'text-black' : 'text-gray-700'}`}>
                      {message.user}
                    </Text>
                    <Text className="text-gray-500 text-xs">{message.time}</Text>
                  </View>
                  <Text 
                    numberOfLines={1} 
                    className={`${message.unread ? 'text-black font-medium' : 'text-gray-500'} text-sm`}
                  >
                    {message.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="p-4">
            <View className="bg-gray-100 rounded-2xl p-6 items-center">
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="gray" />
              <Text className="text-xl font-semibold mb-2 mt-4">No messages yet</Text>
              <Text className="text-gray-600 mb-4 text-center">
                When you book a trip or experience, messages from your host will show up here.
              </Text>
              <TouchableOpacity className="bg-blue-500 py-3 px-6 rounded-lg">
                <Text className="text-white font-semibold">Start exploring</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating New Message Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="create-outline" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
