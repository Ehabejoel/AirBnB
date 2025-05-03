import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PersonalProfileScreen() {
  const router = useRouter();

  const stats = [
    { label: 'Reviews', value: '127' },
    { label: 'Years hosting', value: '3' },
    { label: 'Identity verified', value: 'Yes' },
  ];

  const reviews = [
    {
      author: 'Sarah M.',
      date: 'October 2023',
      text: 'James was an excellent host! The place was exactly as described.',
      rating: 5,
    },
    {
      author: 'Michael R.',
      date: 'September 2023',
      text: 'Great communication and very professional. Would definitely recommend!',
      rating: 5,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="p-4">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => alert('Change profile picture')}
              className="relative shadow-lg"
              style={{
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                className="w-28 h-28 border-[3px] border-white"
                style={{
                  backgroundColor: '#f3f4f6',
                }}
              />
              <View className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md">
                <MaterialIcons name="edit" size={20} color="#FF385C" />
              </View>
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold">James Smith</Text>
              <Text className="text-gray-500">Joined in 2020</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-6 pb-6 border-b border-gray-200">
            {stats.map((stat, index) => (
              <View key={index} className="items-center">
                <Text className="text-lg font-bold">{stat.value}</Text>
                <Text className="text-gray-500">{stat.label}</Text>
              </View>
            ))}
          </View>

          <View className="py-6 border-b border-gray-200">
            <Text className="text-lg font-bold mb-4">About</Text>
            <Text className="text-gray-600 leading-6">
              Hi, I'm James! I'm a passionate traveler and host. I love meeting new people and helping them discover the best of what my city has to offer.
            </Text>
          </View>

          <View className="py-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold">Reviews</Text>
              <Text className="text-[#FF385C]">See all</Text>
            </View>
            
            {reviews.map((review, index) => (
              <View key={index} className="mb-4 pb-4 border-b border-gray-200">
                <View className="flex-row items-center mb-2">
                  <Text className="font-semibold">{review.author}</Text>
                  <Text className="text-gray-500 ml-2">{review.date}</Text>
                </View>
                <Text className="text-gray-600">{review.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}