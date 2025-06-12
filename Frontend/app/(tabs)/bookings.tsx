import { View, Text, FlatList, Dimensions, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../../utils/api';
import { getToken } from '../../utils/storage';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../../api/api_url';

interface Booking {
  _id: string;
  property: {
    _id: string;
    title: string;
    images: string[];
    location: {
      city: string;
      country: string;
    };
  };
  host: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  paymentStatus: string;
  specialRequests?: string;
}

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const token = await getToken();
      if (token) {
        const response = await getMyBookings(token);
        setBookings(response.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => confirmCancelBooking(bookingId)
        }
      ]
    );
  };

  const confirmCancelBooking = async (bookingId: string) => {
    setCancellingBookingId(bookingId);
    try {
      const token = await getToken();
      if (token) {
        await cancelBooking(token, bookingId, 'Cancelled by guest');
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' as any }
            : booking
        ));
        Alert.alert('Success', 'Booking cancelled successfully');
      }    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'confirmed': return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700' };
      case 'cancelled': return { bg: 'bg-gray-100', text: 'text-gray-700' };
      case 'completed': return { bg: 'bg-blue-100', text: 'text-blue-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusColors = getStatusColor(item.status);
    const canCancel = ['pending', 'confirmed'].includes(item.status);
    const checkInDate = new Date(item.checkInDate);
    const now = new Date();
    const hoursToCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const canCancelBasedOnTime = hoursToCheckIn > 24;

    return (
      <TouchableOpacity 
        className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
        onPress={() => router.push(`/propertydetails/${item.property._id}`)}
      >
        <Image 
          source={{ 
            uri: item.property.images[0] 
              ? `${API_URL}${item.property.images[0]}`
              : 'https://via.placeholder.com/300x200'
          }} 
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-lg font-semibold">{item.property.title}</Text>
              <Text className="text-gray-500">
                {item.property.location.city}, {item.property.location.country}
              </Text>
              <Text className="text-gray-500 mt-1">
                Host: {item.host.firstName} {item.host.lastName}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded ${statusColors.bg}`}>
              <Text className={`text-sm font-medium capitalize ${statusColors.text}`}>
                {item.status}
              </Text>
            </View>
          </View>
          
          <View className="border-t border-gray-200 pt-3 mt-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Check-in:</Text>
              <Text className="font-medium">{formatDate(item.checkInDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Check-out:</Text>
              <Text className="font-medium">{formatDate(item.checkOutDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Guests:</Text>
              <Text className="font-medium">
                {item.numberOfGuests} guest{item.numberOfGuests > 1 ? 's' : ''}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Total Amount:</Text>
              <Text className="font-semibold text-lg">
                {item.totalAmount.toLocaleString()} FCFA
              </Text>
            </View>
            
            {item.specialRequests && (
              <View className="mt-3 p-3 bg-gray-50 rounded">
                <Text className="text-sm text-gray-600">
                  Special Requests: {item.specialRequests}
                </Text>
              </View>
            )}

            {canCancel && canCancelBasedOnTime && (
              <TouchableOpacity
                className="mt-3 bg-red-50 border border-red-200 p-3 rounded flex-row items-center justify-center"
                onPress={() => handleCancelBooking(item._id)}
                disabled={cancellingBookingId === item._id}
              >
                {cancellingBookingId === item._id ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={20} color="#dc2626" />
                    <Text className="text-red-600 font-medium ml-2">Cancel Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {canCancel && !canCancelBasedOnTime && (
              <View className="mt-3 p-3 bg-gray-50 rounded">
                <Text className="text-sm text-gray-600 text-center">
                  Cancellation not allowed (less than 24 hours to check-in)
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF385C" />
        <Text className="mt-2 text-gray-600">Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold">Your Bookings</Text>
        <Text className="text-gray-600 mt-1">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {bookings.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <MaterialIcons name="event-busy" size={64} color="#9CA3AF" />
          <Text className="text-xl font-medium mt-4 mb-2">No bookings yet</Text>
          <Text className="text-gray-600 text-center mb-6">
            When you book a stay, your reservations will appear here.
          </Text>
          <TouchableOpacity
            className="bg-[#FF385C] px-6 py-3 rounded-lg"
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text className="text-white font-semibold">Start Exploring</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingItem}
          className="flex-1 p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
