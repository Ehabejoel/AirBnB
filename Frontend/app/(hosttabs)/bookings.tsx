import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function BookingsScreen() {
  const [bookingRequests, setBookingRequests] = useState([
    {
      id: '1',
      guestName: 'John Smith',
      dates: 'Jun 15-20, 2024',
      property: 'Luxury Villa',
      status: 'Pending',
      price: '$1,200'
    },
    {
      id: '2',
      guestName: 'Sarah Wilson',
      dates: 'Jul 1-5, 2024',
      property: 'Beach House',
      status: 'Pending',
      price: '$800'
    }
  ]);

  const [confirmedBookings, setConfirmedBookings] = useState([
    {
      id: '3',
      guestName: 'Mike Johnson',
      dates: 'May 10-15, 2024',
      property: 'Mountain Cabin',
      status: 'Confirmed',
      price: '$950'
    }
  ]);

  const handleAccept = (bookingId: string) => {
    const bookingToAccept = bookingRequests.find(booking => booking.id === bookingId);
    if (bookingToAccept) {
      const updatedBooking = { ...bookingToAccept, status: 'Confirmed' };
      setConfirmedBookings([...confirmedBookings, updatedBooking]);
      setBookingRequests(bookingRequests.filter(booking => booking.id !== bookingId));
    }
  };

  const handleDeny = (bookingId: string) => {
    setBookingRequests(bookingRequests.filter(booking => booking.id !== bookingId));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-6">Bookings</Text>

        <View className="bg-gray-50 p-4 rounded-xl mb-6">
          <Text className="text-lg font-semibold mb-4">Booking Requests</Text>
          {bookingRequests.map(booking => (
            <View key={booking.id} className="bg-white p-4 rounded-lg mb-2">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="font-semibold">{booking.guestName}</Text>
                  <Text className="text-gray-500">{booking.dates}</Text>
                  <Text className="text-gray-500">{booking.property}</Text>
                  <Text className="font-medium mt-1">{booking.price}</Text>
                </View>
                <View className="bg-yellow-100 px-3 py-1 rounded">
                  <Text className="text-yellow-700">{booking.status}</Text>
                </View>
              </View>
              <View className="flex-row justify-end space-x-2">
                <TouchableOpacity 
                  onPress={() => handleDeny(booking.id)}
                  className="bg-red-100 px-4 py-2 rounded"
                >
                  <Text className="text-red-700 font-medium">Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleAccept(booking.id)}
                  className="bg-green-100 px-4 py-2 rounded"
                >
                  <Text className="text-green-700 font-medium">Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-gray-50 p-4 rounded-xl">
          <Text className="text-lg font-semibold mb-4">Confirmed Bookings</Text>
          {confirmedBookings.map(booking => (
            <View key={booking.id} className="bg-white p-4 rounded-lg mb-2">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="font-semibold">{booking.guestName}</Text>
                  <Text className="text-gray-500">{booking.dates}</Text>
                  <Text className="text-gray-500">{booking.property}</Text>
                  <Text className="font-medium mt-1">{booking.price}</Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded">
                  <Text className="text-green-700">{booking.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}