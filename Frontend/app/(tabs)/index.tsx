import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { API_URL } from '../../api/api_url';
import { addToWishlist, removeFromWishlist, getMyWishlist } from '../../utils/api';
import { getToken } from '../../utils/storage';

interface Category {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

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
  rating?: number;
}

interface SavedListings {
  [key: string]: boolean;
}

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Top cities');
  const [savedListings, setSavedListings] = useState<SavedListings>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchWishlistData();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/properties`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        return; // User not logged in, skip wishlist fetch
      }
      
      const wishlistData = await getMyWishlist(token);
      const savedListingsMap: SavedListings = {};
      
      // Convert wishlist array to savedListings object format
      wishlistData.forEach((property: Property) => {
        savedListingsMap[property._id] = true;
      });
      
      setSavedListings(savedListingsMap);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Don't show error for wishlist fetch failure, just log it
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    await fetchWishlistData();
    setRefreshing(false);
  };

  const categories: Category[] = [
    { name: 'Top cities', icon: 'location-city' },
    { name: 'Icons', icon: 'museum' },
    { name: 'Countryside', icon: 'cottage' },
    { name: 'National parks', icon: 'forest' },
    { name: 'Islands', icon: 'waves' },
  ];

  const toggleSaved = async (id: string): Promise<void> => {
    try {
      const token = await getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      if (savedListings[id]) {
        await removeFromWishlist(token, id);
      } else {
        await addToWishlist(token, id);
      }

      setSavedListings(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className={`items-center justify-center mr-6 ${activeCategory === item.name ? 'border-b-2 border-black' : ''}`}
      onPress={() => setActiveCategory(item.name)}
    >
      <MaterialIcons name={item.icon} size={24} color={activeCategory === item.name ? "#000" : "#717171"} />
      <Text className={`text-xs font-medium mt-1 ${activeCategory === item.name ? 'text-black' : 'text-gray-500'}`}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderListingItem = ({ item }: { item: Property }) => (
    <View className="mb-6">
      <TouchableOpacity 
        className="relative"
        onPress={() => router.push({ pathname: "/propertydetails/[id]", params: { id: item._id } })}
      >
        <Image
          source={{ uri: `${API_URL}${item.images[0]}` }}
          className="w-full h-72 rounded-xl"
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => toggleSaved(item._id)}
          className="absolute top-4 right-4"
        >
          <MaterialIcons
            name={savedListings[item._id] ? "favorite" : "favorite-border"}
            size={24}
            color={savedListings[item._id] ? "#FF385C" : "#000"}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <View className="mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-medium">{item.location.city}, {item.location.country}</Text>
          {item.rating && (
            <View className="flex-row items-center">
              <MaterialIcons name="star" size={16} color="#000" />
              <Text className="ml-1">{item.rating}</Text>
            </View>
          )}
        </View>
        <Text className="text-gray-500">{item.title}</Text>
        <View className="flex-row items-center">
          <Text className="text-base font-medium">{item.price} FCFA</Text>
          <Text className="text-gray-500 ml-1">per night</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="items-center">
          <TouchableOpacity className="flex-row items-center bg-white border border-gray-200 rounded-full px-4.5 py-3 w-full shadow">
            <Ionicons name="search" size={18} color="#000" />
            <Text className="text-base ml-2.5 text-gray-700">Start your search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="pb-20"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF385C"]}
            tintColor="#FF385C"
          />
        }
      >
        <View className="pt-3 pb-4 border-b border-gray-100">
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
          />
        </View>

        <View className="flex-row items-center px-4 py-3.5">
          <View className="bg-red-50 rounded p-1 mr-2">
            <MaterialIcons name="local-offer" size={16} color="#FF385C" />
          </View>
          <Text className="text-sm font-medium text-black">Prices include all fees</Text>
        </View>

        <View className="px-4 pt-2 pb-4">
          <FlatList
            data={properties}
            renderItem={renderListingItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* <View className="absolute bottom-[90px] self-center z-50">
        <TouchableOpacity className="flex-row items-center justify-center bg-gray-900 py-3 px-4.5 rounded-full shadow-lg">
          <Text className="text-white font-semibold text-sm mr-1.5">Map</Text>
          <MaterialIcons name="map" size={18} color="#fff" />
        </TouchableOpacity>
      </View> */}

      <View className="absolute bottom-0 left-0 right-0 bg-white flex-row justify-around pt-2 pb-5 border-t border-gray-100">
        <TouchableOpacity className="items-center relative">
          <Ionicons name="search" size={24} color="#FF385C" />
          <Text className="text-xs mt-1 text-[#FF385C]">Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="heart-outline" size={24} color="#000" />
          <Text className="text-xs mt-1 text-gray-500">Wishlists</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <FontAwesome name="home" size={24} color="#000" />
          <Text className="text-xs mt-1 text-gray-500">Trips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="chatbubble-outline" size={24} color="#000" />
          <Text className="text-xs mt-1 text-gray-500">Messages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center relative">
          <Ionicons name="person-circle-outline" size={24} color="#000" />
          <View className="absolute top-0 right-0 w-2 h-2 bg-[#FF385C] rounded-full" />
          <Text className="text-xs mt-1 text-gray-500">Profile</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center pb-2 bg-white">
        <View className="w-9 h-1.5 bg-black rounded" />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;