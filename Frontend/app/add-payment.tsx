import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState } from 'react';

export default function AddPaymentScreen() {
  const [paymentType, setPaymentType] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const handleSubmit = () => {
    // TODO: Implement payment method addition logic
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Add Payment Method' }} />
      
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Select Payment Type</Text>
          <TouchableOpacity 
            className={`p-4 border rounded-lg mb-2 ${paymentType === 'MTN' ? 'border-[#FF385C]' : 'border-gray-200'}`}
            onPress={() => setPaymentType('MTN')}
          >
            <View className="flex-row items-center">
              <Image 
                source={require('../assets/images/MTN-logo.jpg')} 
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
              <Text className="font-semibold ml-3">MTN Mobile Money</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`p-4 border rounded-lg ${paymentType === 'Orange' ? 'border-[#FF385C]' : 'border-gray-200'}`}
            onPress={() => setPaymentType('Orange')}
          >
            <View className="flex-row items-center">
              <Image 
                source={require('../assets/images/orange-money-logo.png')} 
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
              <Text className="font-semibold ml-3">Orange Money</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Phone Number</Text>
          <View className="flex-row items-center">
            <View className="bg-gray-100 p-4 rounded-l-lg border-t border-b border-l border-gray-200">
              <Text>+237</Text>
            </View>
            <TextInput
              className="flex-1 p-4 border-t border-b border-r border-gray-200 rounded-r-lg"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-[#FF385C] p-4 rounded-lg"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center font-semibold">Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}