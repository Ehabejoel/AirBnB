import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getHostBookings, updateBookingStatus } from '../../utils/api';
import { getToken } from '../../utils/storage';

interface Booking {
  _id: string;
  guest: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  property: {
    title: string;
    images: string[];
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
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const token = await getToken();
      if (token) {
        const response = await getHostBookings(token);
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

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    setProcessingBookingId(bookingId);
    try {
      const token = await getToken();
      if (token) {
        await updateBookingStatus(token, bookingId, status);
        // Update local state
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: status as any }
            : booking
        ));
        Alert.alert(
          'Success', 
          `Booking ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully`
        );
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
    } finally {
      setProcessingBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const confirmedBookings = bookings.filter(booking => 
    ['confirmed', 'completed'].includes(booking.status)
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
          <Text className="mt-2 text-gray-600">Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-bold mb-6">Bookings</Text>

        {/* Pending Requests */}
        <View className="bg-gray-50 p-4 rounded-xl mb-6">
          <Text className="text-lg font-semibold mb-4">
            Booking Requests ({pendingBookings.length})
          </Text>
          {pendingBookings.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No pending booking requests
            </Text>
          ) : (
            pendingBookings.map(booking => (
              <View key={booking._id} className="bg-white p-4 rounded-lg mb-2">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="font-semibold">
                      {booking.guest.firstName} {booking.guest.lastName}
                    </Text>
                    <Text className="text-gray-500">
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </Text>
                    <Text className="text-gray-500">{booking.property.title}</Text>
                    <Text className="text-gray-500">
                      {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                    </Text>
                    <Text className="font-medium mt-1">
                      {booking.totalAmount.toLocaleString()} FCFA
                    </Text>
                    {booking.specialRequests && (
                      <Text className="text-sm text-gray-600 mt-1">
                        Special requests: {booking.specialRequests}
                      </Text>
                    )}
                  </View>
                  <View className={`px-3 py-1 rounded ${getStatusColor(booking.status)}`}>
                    <Text className="capitalize">{booking.status}</Text>
                  </View>
                </View>
                <View className="flex-row justify-end space-x-2">
                  <TouchableOpacity 
                    onPress={() => handleUpdateStatus(booking._id, 'rejected')}
                    className="bg-red-100 px-4 py-2 rounded"
                    disabled={processingBookingId === booking._id}
                  >
                    {processingBookingId === booking._id ? (
                      <ActivityIndicator size="small" color="#dc2626" />
                    ) : (
                      <Text className="text-red-700 font-medium">Reject</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleUpdateStatus(booking._id, 'confirmed')}
                    className="bg-green-100 px-4 py-2 rounded"
                    disabled={processingBookingId === booking._id}
                  >
                    {processingBookingId === booking._id ? (
                      <ActivityIndicator size="small" color="#16a34a" />
                    ) : (
                      <Text className="text-green-700 font-medium">Accept</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Confirmed Bookings */}
        <View className="bg-gray-50 p-4 rounded-xl">
          <Text className="text-lg font-semibold mb-4">
            Confirmed Bookings ({confirmedBookings.length})
          </Text>
          {confirmedBookings.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No confirmed bookings
            </Text>
          ) : (
            confirmedBookings.map(booking => (
              <View key={booking._id} className="bg-white p-4 rounded-lg mb-2">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold">
                      {booking.guest.firstName} {booking.guest.lastName}
                    </Text>
                    <Text className="text-gray-500">
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </Text>
                    <Text className="text-gray-500">{booking.property.title}</Text>
                    <Text className="text-gray-500">
                      {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                    </Text>
                    <Text className="font-medium mt-1">
                      {booking.totalAmount.toLocaleString()} FCFA
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded ${getStatusColor(booking.status)}`}>
                    <Text className="capitalize">{booking.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}