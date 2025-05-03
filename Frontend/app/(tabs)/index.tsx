import React, { useState } from 'react';
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
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';

interface Category {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

interface Listing {
  id: string;
  location: string;
  distance: string;
  dates: string;
  price: string;
  nights: string;
  rating: number;
  isFavorite: string;
  image: string;
}

interface SavedListings {
  [key: string]: boolean;
}

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Top cities');
  const [savedListings, setSavedListings] = useState<SavedListings>({});

  const categories: Category[] = [
    { name: 'Top cities', icon: 'location-city' },
    { name: 'Icons', icon: 'museum' },
    { name: 'Countryside', icon: 'cottage' },
    { name: 'National parks', icon: 'forest' },
    { name: 'Islands', icon: 'waves' },
  ];

  const listings: Listing[] = [
    {
      id: '1',
      location: 'Medellin, Colombia',
      distance: '9,639 kilometres away',
      dates: '15-20 Jun',
      price: '£799 GBP',
      nights: 'for 5 nights',
      rating: 4.94,
      isFavorite: 'Guest favourite',
      image: 'https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: '2',
      location: 'Barcelona, Spain',
      distance: '1,325 kilometres away',
      dates: '10-15 Jul',
      price: '€650 EUR',
      nights: 'for 5 nights',
      rating: 4.88,
      isFavorite: '',
      image: 'https://images.pexels.com/photos/6908368/pexels-photo-6908368.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  const toggleSaved = (id: string): void => {
    setSavedListings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  const renderListingItem = ({ item }: { item: Listing }) => (
    <View className="mb-6">
      <TouchableOpacity 
        className="relative"
        onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })}
      >
        <Image
          source={{ uri: item.image }}
          className="w-full h-72 rounded-xl"
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => toggleSaved(item.id)}
          className="absolute top-4 right-4"
        >
          <MaterialIcons
            name={savedListings[item.id] ? "favorite" : "favorite-border"}
            size={24}
            color={savedListings[item.id] ? "#FF385C" : "#000"}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <View className="mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-medium">{item.location}</Text>
          <View className="flex-row items-center">
            <MaterialIcons name="star" size={16} color="#000" />
            <Text className="ml-1">{item.rating}</Text>
          </View>
        </View>
        <Text className="text-gray-500">{item.distance}</Text>
        <Text className="text-gray-500">{item.dates}</Text>
        <View className="flex-row items-center">
          <Text className="text-base font-medium">{item.price}</Text>
          <Text className="text-gray-500 ml-1">{item.nights}</Text>
        </View>
      </View>
    </View>
  );

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
            data={listings}
            renderItem={renderListingItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <View className="absolute bottom-[90px] self-center z-50">
        <TouchableOpacity className="flex-row items-center justify-center bg-gray-900 py-3 px-4.5 rounded-full shadow-lg">
          <Text className="text-white font-semibold text-sm mr-1.5">Map</Text>
          <MaterialIcons name="map" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

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