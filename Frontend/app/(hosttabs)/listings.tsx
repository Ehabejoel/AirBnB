import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { getMyProperties } from '../../utils/api';
import { getToken } from '../../utils/storage';
import { API_URL } from '../../api/api_url';

interface Location {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Property {
  _id: string;
  title: string;
  description: string;
  location: Location;
  price: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

export default function ListingsScreen() {
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      const properties = await getMyProperties(token);
      setListings(properties);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListings();
  }, []);

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Your Listings</Text>
          <TouchableOpacity 
          className="bg-[#FF385C] p-4 rounded-lg flex-row items-center justify-center mb-6"
          onPress={() => router.push('/create-listing')}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Create New Listing</Text>
        </TouchableOpacity>        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#FF385C" className="mt-4" />
          ) : listings.length === 0 ? (
            <Text className="text-gray-500 text-center mt-4">No listings found</Text>
          ) : (
            listings.map(listing => (
              <TouchableOpacity
                key={listing._id}
                className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
              >                <Image                  source={{ uri: `${API_URL}${listing.images[0]}` }}
                  className="w-full h-64"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                      <Text className="text-lg font-semibold">{listing.title}</Text>
                      <Text className="text-gray-500">{listing.location.city}, {listing.location.country}</Text>
                      <Text className="text-gray-700 mt-1">Fcfa {listing.price}/night</Text>
                      <Text className="text-gray-500 mt-1">{listing.bedrooms} beds · {listing.bathrooms} baths</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}