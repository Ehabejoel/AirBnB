import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HostInboxScreen() {
  const messages = [
    {
      id: '1',
      guest: 'John Smith',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      message: 'Hi, I have a question about the check-in process.',
      time: '2h ago',
      unread: true,
      booking: 'Jun 15-20'
    },
    {
      id: '2',
      guest: 'Sarah Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      message: 'Thank you for accepting my booking request!',
      time: '1d ago',
      unread: false,
      booking: 'Jul 3-8'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Host Messages</Text>

        <ScrollView>
          {messages.map(message => (
            <TouchableOpacity 
              key={message.id}
              className={`flex-row p-4 rounded-lg mb-3 ${message.unread ? 'bg-gray-50' : 'bg-white'}`}
            >
              <Image
                source={{ uri: message.avatar }}
                className="w-12 h-12 rounded-full"
              />
              <View className="flex-1 ml-3">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-semibold">{message.guest}</Text>
                  <Text className="text-gray-500 text-sm">{message.time}</Text>
                </View>
                <Text className="text-gray-600" numberOfLines={1}>
                  {message.message}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Booking: {message.booking}
                </Text>
              </View>
              {message.unread && (
                <View className="w-2 h-2 rounded-full bg-[#FF385C] mt-2" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}