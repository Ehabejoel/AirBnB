import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createBooking, checkAvailability } from '../../utils/api';
import { getToken } from '../../utils/storage';

const BookingScreen = () => {
  const { propertyId, title, price, image } = useLocalSearchParams();
  
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = parseFloat(Array.isArray(price) ? price[0] : price || '0');
  const totalPrice = nights * basePrice;
  const serviceFee = Math.round(totalPrice * 0.1);
  const taxes = Math.round(totalPrice * 0.05);
  const totalAmount = totalPrice + serviceFee + taxes;

  useEffect(() => {
    checkPropertyAvailability();
  }, [checkInDate, checkOutDate]);

  const checkPropertyAvailability = async () => {
    if (!propertyId || checkOutDate <= checkInDate) return;
    
    setCheckingAvailability(true);
    try {
      const checkIn = checkInDate.toISOString().split('T')[0];
      const checkOut = checkOutDate.toISOString().split('T')[0];
      const availability = await checkAvailability(propertyId, checkIn, checkOut);
      setIsAvailable(availability.available);
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBooking = async () => {
    if (!isAvailable) {
      Alert.alert('Error', 'Property is not available for selected dates');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number for payment');
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Please sign in to make a booking');
      }

      const bookingData = {
        propertyId,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        numberOfGuests,
        paymentMethod,
        paymentDetails: {
          phoneNumber
        },
        specialRequests: specialRequests.trim() || undefined
      };

      const booking = await createBooking(token, bookingData);
      
      Alert.alert(
        'Booking Request Sent!',
        'Your booking request has been sent to the host. You will receive a notification once they respond.',
        [
          {
            text: 'View Bookings',
            onPress: () => router.push('/(tabs)/bookings')
          }
        ]
      );    } catch (error) {
      Alert.alert('Booking Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };  const renderDatePicker = (
    value: Date,
    onChange: (event: any, selectedDate?: Date) => void,
    show: boolean,
    setShow: (show: boolean) => void,
    title: string,
    minimumDate?: Date
  ) => (
    <View className="mb-4">
      <Text className="text-base font-medium mb-2">{title}</Text>
      <TouchableOpacity
        className="border border-gray-300 p-3 rounded-lg"
        onPress={() => setShow(true)}
      >
        <Text className="text-base">{value.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );

  const renderGuestSelector = () => (
    <View className="mb-4">
      <Text className="text-base font-medium mb-2">Number of Guests</Text>
      <View className="flex-row items-center justify-between border border-gray-300 p-3 rounded-lg">
        <TouchableOpacity
          onPress={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <MaterialIcons name="remove" size={20} color="#666" />
        </TouchableOpacity>
        <Text className="text-lg font-medium">{numberOfGuests}</Text>
        <TouchableOpacity
          onPress={() => setNumberOfGuests(numberOfGuests + 1)}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <MaterialIcons name="add" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentMethod = () => (
    <View className="mb-4">
      <Text className="text-base font-medium mb-2">Payment Method</Text>
      <View className="space-y-2">
        {['MTN', 'Orange'].map((method) => (
          <TouchableOpacity
            key={method}
            className={`p-3 border rounded-lg flex-row items-center ${
              paymentMethod === method ? 'border-[#FF385C] bg-red-50' : 'border-gray-300'
            }`}
            onPress={() => setPaymentMethod(method)}
          >
            <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
              paymentMethod === method ? 'border-[#FF385C] bg-[#FF385C]' : 'border-gray-300'
            }`} />
            <Text className="text-base">{method} Mobile Money</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="mt-3">
        <Text className="text-sm font-medium mb-1">Phone Number</Text>
        <View className="flex-row">
          <View className="bg-gray-100 px-3 py-3 rounded-l-lg border border-r-0 border-gray-300">
            <Text>+237</Text>
          </View>
          <TextInput
            className="flex-1 border border-gray-300 px-3 py-3 rounded-r-lg"
            placeholder="6XXXXXXXX"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={9}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4">Book Your Stay</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Property Info */}
        <View className="flex-row mb-6">
          {image && (
            <Image
              source={{ uri: Array.isArray(image) ? image[0] : image }}
              className="w-20 h-20 rounded-lg"
              resizeMode="cover"
            />
          )}
          <View className="flex-1 ml-3">
            <Text className="text-lg font-semibold">{title}</Text>
            <Text className="text-[#FF385C] font-medium">{price} FCFA per night</Text>
          </View>
        </View>

        {/* Availability Status */}
        {checkingAvailability ? (
          <View className="flex-row items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <ActivityIndicator size="small" color="#666" />
            <Text className="ml-2 text-gray-600">Checking availability...</Text>
          </View>
        ) : !isAvailable ? (
          <View className="flex-row items-center mb-4 p-3 bg-red-50 rounded-lg">
            <MaterialIcons name="error" size={20} color="#dc2626" />
            <Text className="ml-2 text-red-600">Not available for selected dates</Text>
          </View>
        ) : (
          <View className="flex-row items-center mb-4 p-3 bg-green-50 rounded-lg">
            <MaterialIcons name="check-circle" size={20} color="#16a34a" />
            <Text className="ml-2 text-green-600">Available for selected dates</Text>
          </View>
        )}        {/* Date Selection */}
        {renderDatePicker(
          checkInDate,
          setCheckInDate,
          showCheckInPicker,
          setShowCheckInPicker,
          'Check-in Date',
          new Date()
        )}

        {renderDatePicker(
          checkOutDate,
          setCheckOutDate,
          showCheckOutPicker,
          setShowCheckOutPicker,
          'Check-out Date',
          checkInDate
        )}

        {/* Guest Selection */}
        {renderGuestSelector()}

        {/* Payment Method */}
        {renderPaymentMethod()}

        {/* Special Requests */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Special Requests (Optional)</Text>
          <TextInput
            className="border border-gray-300 p-3 rounded-lg h-20"
            placeholder="Any special requests or requirements..."
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Price Breakdown */}
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold mb-3">Price Breakdown</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text>{price} FCFA x {nights} nights</Text>
              <Text>{totalPrice.toLocaleString()} FCFA</Text>
            </View>
            <View className="flex-row justify-between">
              <Text>Service fee</Text>
              <Text>{serviceFee.toLocaleString()} FCFA</Text>
            </View>
            <View className="flex-row justify-between">
              <Text>Taxes</Text>
              <Text>{taxes.toLocaleString()} FCFA</Text>
            </View>
            <View className="border-t border-gray-300 pt-2">
              <View className="flex-row justify-between">
                <Text className="font-semibold">Total</Text>
                <Text className="font-semibold">{totalAmount.toLocaleString()} FCFA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          className={`bg-[#FF385C] p-4 rounded-lg items-center mb-8 ${
            (!isAvailable || isLoading) ? 'opacity-50' : ''
          }`}
          onPress={handleBooking}
          disabled={!isAvailable || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              Request to Book
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingScreen;
