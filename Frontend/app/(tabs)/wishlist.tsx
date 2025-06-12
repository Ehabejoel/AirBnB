import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getMyWishlist } from '../../utils/api';
import { getToken } from '../../utils/storage';
import { API_URL } from '../../api/api_url';

interface Property {
  _id: string;
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
  };
  price: number;
  images: string[];
}

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await getMyWishlist(token);
      setWishlist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={fetchWishlist}
          className="mt-4 bg-black py-3 px-5 rounded-lg"
        >
          <Text className="text-white font-semibold">Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-2xl font-bold">Wishlists</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">          {wishlist.length === 0 ? (
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
          ) : (
            wishlist.map((property) => (
              <TouchableOpacity 
                key={property._id} 
                className="mb-6"
                onPress={() => router.push({ pathname: "/listing/[id]", params: { id: property._id } })}
              >
                <View className="relative">
                  <Image
                    source={{ uri: `${API_URL}${property.images[0]}` }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                  />                <View className="absolute bottom-4 left-4">
                    <Text className="text-white text-xl font-bold">{property.title}</Text>
                    <Text className="text-white">{property.price} FCFA per night</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}