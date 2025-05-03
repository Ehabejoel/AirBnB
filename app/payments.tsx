import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';

export default function PaymentsScreen() {
  const paymentMethods = [
    { id: 1, type: 'MTN Mobile Money', phoneNumber: '+237xxxxxxxx', logo: 'mtn' },
    { id: 2, type: 'Orange Money', phoneNumber: '+237xxxxxxxx', logo: 'orange' },
  ];

  const transactions = [
    { id: 1, date: '2023-12-15', amount: 150, description: 'Booking #1234', status: 'completed' },
    { id: 2, date: '2023-12-10', amount: 200, description: 'Booking #1230', status: 'completed' },
    { id: 3, date: '2023-12-05', amount: 175, description: 'Booking #1228', status: 'pending' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Payments & Payouts' }} />
      
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="mb-8">
            <Text className="text-xl font-semibold mb-4">Payment Methods</Text>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                className="flex-row items-center p-4 border border-gray-200 rounded-lg mb-2"
              >
                <Image 
                  source={method.logo === 'mtn' 
                    ? require('../assets/images/MTN-logo.jpg')
                    : require('../assets/images/orange-money-logo.png')
                  }
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold">{method.type}</Text>
                  <Text className="text-gray-500">
                    {method.phoneNumber}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#717171" />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              className="mt-4 flex-row items-center"
              onPress={() => router.push('/add-payment')}
            >
              <MaterialIcons name="add" size={24} color="#FF385C" />
              <Text className="text-[#FF385C] font-semibold ml-2">Add payment method</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-xl font-semibold mb-4">Transaction History</Text>
            {transactions.map(transaction => (
              <View
                key={transaction.id}
                className="p-4 border-b border-gray-200"
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="font-semibold">{transaction.description}</Text>
                    <Text className="text-gray-500">{transaction.date}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-semibold">${transaction.amount}</Text>
                    <Text className="text-sm capitalize text-gray-500">
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}