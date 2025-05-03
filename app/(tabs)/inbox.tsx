import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function InboxScreen() {
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
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold">Inbox</Text>
          <TouchableOpacity>
            <MaterialIcons name="filter-list" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {messages.length > 0 ? (
          <View>
            {messages.map((message) => (
              <TouchableOpacity 
                key={message.id} 
                className={`flex-row items-center p-4 border-b border-gray-100 ${message.unread ? 'bg-gray-50' : ''}`}
              >
                <Image
                  source={{ uri: message.avatar }}
                  className="w-12 h-12 rounded-full"
                />
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`font-semibold ${message.unread ? 'text-black' : 'text-gray-600'}`}>
                      {message.user}
                    </Text>
                    <Text className="text-gray-500 text-sm">{message.time}</Text>
                  </View>
                  <Text 
                    numberOfLines={2} 
                    className={`${message.unread ? 'text-black' : 'text-gray-500'}`}
                  >
                    {message.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="p-4">
            <View className="bg-gray-100 rounded-2xl p-4">
              <Text className="text-xl font-semibold mb-2">No messages yet</Text>
              <Text className="text-gray-600 mb-4">When you book a trip or experience, messages from your host will show up here.</Text>
              <TouchableOpacity className="bg-black py-3 px-5 rounded-lg self-start">
                <Text className="text-white font-semibold">Start exploring</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}