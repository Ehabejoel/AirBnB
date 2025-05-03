import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [pressedIndex, setPressedIndex] = useState(-1);

  const renderInfoItem = (label: string, value: string, index: number) => (
    <TouchableOpacity 
      className={`border-b border-gray-200 pb-4 px-4 rounded-xl mb-2 ${
        pressedIndex === index ? 'bg-gray-50' : ''
      }`}
      onPressIn={() => setPressedIndex(index)}
      onPressOut={() => setPressedIndex(-1)}
      style={{
        transform: [{ scale: pressedIndex === index ? 0.98 : 1 }],
      }}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-sm">{label}</Text>
          <Text className="text-lg mt-1 font-medium">{value}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* <TouchableOpacity 
            onPress={() => router.back()}
            className="flex-row items-center mb-6 bg-white p-3 rounded-full w-24 shadow-sm"
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
            <Text className="text-lg ml-2">Back</Text>
          </TouchableOpacity> */}

          <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <Text className="text-2xl font-bold mb-2">Personal information</Text>
            <Text className="text-gray-500">Update your info to help hosts and guests get to know you</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            {renderInfoItem("Legal name", "James Smith", 0)}
            {renderInfoItem("Email", "james.smith@example.com", 1)}
            {renderInfoItem("Phone number", "+1 234 567 8900", 2)}
            {renderInfoItem("Address", "123 Main St, New York, NY 10001", 3)}
            {renderInfoItem("Emergency contact", "Not provided", 4)}
            {renderInfoItem("Identity verification", "Not verified", 5)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}