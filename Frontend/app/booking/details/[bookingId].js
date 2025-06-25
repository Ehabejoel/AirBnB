// filepath: c:\Users\sbdra\Desktop\Projects\airbnb\Frontend\app\booking\details\[bookingId].js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getBookingDetails, cancelBooking, updateBookingStatus } from '../../../utils/api';
import { getToken, getUser } from '../../../utils/storage';
import { API_URL } from '../../../api/api_url';

const BookingDetailsScreen = () => {
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBookingDetails();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const loadBookingDetails = async () => {
    try {
      const token = await getToken();
      if (token && bookingId) {
        const bookingData = await getBookingDetails(token, bookingId);
        setBooking(bookingData);
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: confirmCancelBooking
        }
      ]
    );
  };

  const confirmCancelBooking = async () => {
    setProcessing(true);
    try {
      const token = await getToken();
      if (token) {
        await cancelBooking(token, bookingId, 'Cancelled by guest');
        setBooking({ ...booking, status: 'cancelled' });
        Alert.alert('Success', 'Booking cancelled successfully');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to cancel booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setProcessing(true);
    try {
      const token = await getToken();
      if (token) {
        await updateBookingStatus(token, bookingId, status);
        setBooking({ ...booking, status });
        Alert.alert(
          'Success', 
          `Booking ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully`
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update booking status');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'confirmed': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      case 'cancelled': return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
      case 'completed': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
          <Text className="mt-2 text-gray-600">Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="error" size={64} color="#9CA3AF" />
          <Text className="text-xl font-medium mt-4">Booking not found</Text>
          <TouchableOpacity
            className="bg-[#FF385C] px-6 py-3 rounded-lg mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(booking.status);
  const isHost = user && user._id === booking.host._id;
  const isGuest = user && user._id === booking.guest._id;
  const canCancel = isGuest && ['pending', 'confirmed'].includes(booking.status);
  const canManage = isHost && booking.status === 'pending';

  // Check if cancellation is allowed based on time
  const checkInDate = new Date(booking.checkInDate);
  const now = new Date();
  const hoursToCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancelBasedOnTime = hoursToCheckIn > 24;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4">Booking Details</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Status Banner */}
        <View className={`p-4 m-4 rounded-lg border ${statusColors.bg} ${statusColors.border}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons 
                name={
                  booking.status === 'confirmed' ? 'check-circle' :
                  booking.status === 'pending' ? 'schedule' :
                  booking.status === 'cancelled' || booking.status === 'rejected' ? 'cancel' :
                  'info'
                } 
                size={24} 
                color={statusColors.text.replace('text-', '#')} 
              />
              <Text className={`ml-2 font-semibold capitalize ${statusColors.text}`}>
                {booking.status}
              </Text>
            </View>
            <Text className={`text-sm ${statusColors.text}`}>
              Booking ID: {booking._id.slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Property Info */}
        <View className="p-4">
          <View className="flex-row mb-4">
            <Image
              source={{ 
                uri: booking.property.images[0] 
                  ? `${API_URL}${booking.property.images[0]}`
                  : 'https://via.placeholder.com/300x200'
              }}
              className="w-24 h-24 rounded-lg"
              resizeMode="cover"
            />
            <View className="flex-1 ml-4">
              <Text className="text-xl font-semibold">{booking.property.title}</Text>
              <Text className="text-gray-600 mt-1">
                {booking.property.location?.city}, {booking.property.location?.country}
              </Text>
              <TouchableOpacity
                className="mt-2"
                onPress={() => router.push(`/propertydetails/${booking.property._id}`)}
              >
                <Text className="text-[#FF385C] font-medium">View Property</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest/Host Info */}
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-lg font-semibold mb-3">
              {isHost ? 'Guest Information' : 'Host Information'}
            </Text>
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-[#FF385C] rounded-full items-center justify-center">
                <Text className="text-white font-semibold text-lg">
                  {isHost 
                    ? booking.guest.firstName[0] + booking.guest.lastName[0]
                    : booking.host.firstName[0] + booking.host.lastName[0]
                  }
                </Text>
              </View>
              <View className="ml-3">
                <Text className="font-semibold text-lg">
                  {isHost 
                    ? `${booking.guest.firstName} ${booking.guest.lastName}`
                    : `${booking.host.firstName} ${booking.host.lastName}`
                  }
                </Text>
                <Text className="text-gray-600">
                  {isHost ? 'Guest' : 'Host'}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Details */}
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-lg font-semibold mb-3">Booking Details</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Check-in</Text>
                <Text className="font-medium">{formatDate(booking.checkInDate)}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Check-out</Text>
                <Text className="font-medium">{formatDate(booking.checkOutDate)}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Guests</Text>
                <Text className="font-medium">
                  {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Method</Text>
                <Text className="font-medium">{booking.paymentMethod} Mobile Money</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Status</Text>
                <Text className={`font-medium ${
                  booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {booking.paymentStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Special Requests */}
          {booking.specialRequests && (
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-lg font-semibold mb-2">Special Requests</Text>
              <Text className="text-gray-700">{booking.specialRequests}</Text>
            </View>
          )}

          {/* Price Breakdown */}
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-lg font-semibold mb-3">Price Breakdown</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal</Text>
                <Text className="font-medium">{booking.totalPrice?.toLocaleString() || 'N/A'} FCFA</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Service fee</Text>
                <Text className="font-medium">{booking.serviceFee?.toLocaleString() || 'N/A'} FCFA</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Taxes</Text>
                <Text className="font-medium">{booking.taxes?.toLocaleString() || 'N/A'} FCFA</Text>
              </View>
              
              <View className="border-t border-gray-300 pt-2">
                <View className="flex-row justify-between">
                  <Text className="font-semibold text-lg">Total</Text>
                  <Text className="font-semibold text-lg">{booking.totalAmount.toLocaleString()} FCFA</Text>
                </View>
              </View>
            </View>
          </View>          {/* Action Buttons */}
          <View className="space-y-3 mb-8">
            {/* Chat Button for Confirmed Bookings */}
            {booking.status === 'confirmed' && (
              <TouchableOpacity
                className="bg-[#FF385C] p-4 rounded-lg flex-row items-center justify-center"
                onPress={() => router.push({
                  pathname: '/chatDetailScreen',
                  params: {
                    channelId: `booking-${booking._id}`,
                    channelType: 'messaging',
                    channelName: `${booking.property.title} - Chat`,
                  }
                })}
              >
                <MaterialIcons name="chat" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Chat with {isHost ? 'Guest' : 'Host'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Host Actions */}
            {canManage && (
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-red-50 border border-red-200 p-4 rounded-lg"
                  onPress={() => handleUpdateStatus('rejected')}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#dc2626" />
                  ) : (
                    <Text className="text-red-600 font-semibold text-center">Reject</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-green-50 border border-green-200 p-4 rounded-lg"
                  onPress={() => handleUpdateStatus('confirmed')}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#16a34a" />
                  ) : (
                    <Text className="text-green-600 font-semibold text-center">Accept</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Guest Actions */}
            {canCancel && canCancelBasedOnTime && (
              <TouchableOpacity
                className="bg-red-50 border border-red-200 p-4 rounded-lg flex-row items-center justify-center"
                onPress={handleCancelBooking}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={20} color="#dc2626" />
                    <Text className="text-red-600 font-semibold ml-2">Cancel Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {canCancel && !canCancelBasedOnTime && (
              <View className="p-4 bg-gray-50 rounded-lg">
                <Text className="text-gray-600 text-center">
                  Cancellation not allowed (less than 24 hours to check-in)
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingDetailsScreen;
