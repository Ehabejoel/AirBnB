import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function WishlistScreen() {
  const collections = [
    { id: '1', title: 'Summer 2024', count: 12, image: 'https://images.pexels.com/photos/1450363/pexels-photo-1450363.jpeg' },
    { id: '2', title: 'Beach Houses', count: 5, image: 'https://images.pexels.com/photos/1179156/pexels-photo-1179156.jpeg' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-2xl font-bold">Wishlists</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="bg-gray-100 rounded-2xl p-4 mb-8">
            <Text className="text-xl font-semibold mb-2">Create your first wishlist</Text>
            <Text className="text-gray-600 mb-4">As you search, tap the heart icon to save your favorite places and Experiences to a wishlist.</Text>
            <TouchableOpacity 
              onPress={() => router.replace('/')}
              className="bg-black py-3 px-5 rounded-lg self-start"
            >
              <Text className="text-white font-semibold">Start searching</Text>
            </TouchableOpacity>
          </View>

          {collections.map((collection) => (
            <TouchableOpacity key={collection.id} className="mb-6">
              <View className="relative">
                <Image
                  source={{ uri: collection.image }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
                <View className="absolute bottom-4 left-4">
                  <Text className="text-white text-xl font-bold">{collection.title}</Text>
                  <Text className="text-white">{collection.count} saved items</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}