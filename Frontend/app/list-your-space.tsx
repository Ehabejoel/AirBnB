import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { becomeHost } from '../utils/api';
import { storeUser, getToken } from '../utils/storage';

export default function ListYourSpaceScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Update progress whenever currentStep changes
  useEffect(() => {
    // Calculate progress percentage based on current step
    setProgress((currentStep / (steps.length - 1)) * 100);
  }, [currentStep]);
  const handleBecomeHost = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const updatedUser = await becomeHost(token);
      await storeUser(updatedUser);
      router.push('/(hosttabs)');
    } catch (error) {
      console.error('Error becoming host:', error);
      alert(error instanceof Error ? error.message : 'Failed to become a host. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const steps = [
    {
      title: "What kind of space will you host?",
      subtitle: "Choose the type of property you'll be listing",
      content: (
        <View className="space-y-6">
          <Image 
            source={require('../assets/images/house-min.png')}
            className="w-full h-64 object-cover"
            resizeMode="cover"
          />
          <View className="px-4 space-y-6">
            <Text className="text-2xl font-bold">What kind of place will you host?</Text>
            <View className="flex-row flex-wrap justify-between">
              {['Apartment', 'House', 'Secondary unit', 'Unique space', 'Bed & breakfast'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  className={`w-[48%] p-4 border rounded-xl mb-3 ${
                    selectedType === type ? 'border-black bg-gray-50' : 'border-gray-300'
                  }`}
                  onPress={() => setSelectedType(type)}
                >
                  <Text className={`text-lg ${selectedType === type ? 'font-semibold' : ''}`}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={handleNext}
              className={`py-3 px-6 rounded-lg ${selectedType ? 'bg-black' : 'bg-gray-300'}`}
              disabled={!selectedType}
            >
              <Text className="text-white text-center font-semibold">Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    },
    {
      title: "How often will you host?",
      subtitle: "Select your hosting frequency",
      content: (
        <View className="space-y-6 px-4">
          <Text className="text-2xl font-bold">How often will guests stay at your place?</Text>
          <View className="flex-row flex-wrap justify-between">
            {['All the time', 'Occasionally', 'One-time', 'Not sure yet'].map((frequency) => (
              <TouchableOpacity 
                key={frequency}
                className={`w-[48%] p-4 border rounded-xl mb-3 ${
                  selectedFrequency === frequency ? 'border-black bg-gray-50' : 'border-gray-300'
                }`}
                onPress={() => setSelectedFrequency(frequency)}
              >
                <Text className={`text-lg ${selectedFrequency === frequency ? 'font-semibold' : ''}`}>
                  {frequency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={handleNext}
            className={`py-3 px-6 rounded-lg ${selectedFrequency ? 'bg-black' : 'bg-gray-300'}`}
            disabled={!selectedFrequency}
          >
            <Text className="text-white text-center font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      )
    },
    {
      title: "Start Hosting",
      subtitle: "Begin your journey as a host on our platform",
      content: (
        <View className="space-y-8 px-4">
          <Image 
            source={require('../assets/images/house-min.png')}
            className="w-full h-48 rounded-2xl"
            resizeMode="cover"
          />
          <View className="space-y-4">
            <Text className="text-3xl font-bold text-center">Ready to become a host?</Text>
            <Text className="text-center text-gray-600 text-lg">You'll be hosting a {selectedType.toLowerCase()} {selectedFrequency.toLowerCase()}.</Text>
            <View className="bg-gray-50 p-6 rounded-2xl">
              <Text className="text-gray-800 text-center mb-2">What happens next?</Text>
              <Text className="text-gray-600 text-center">We'll guide you through creating your listing and setting up your hosting preferences.</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleBecomeHost}
            disabled={isLoading}
            className={`py-4 px-8 rounded-full ${isLoading ? 'bg-[#FF385C]/70' : 'bg-[#FF385C]'}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Setting up your host profile..." : "Start Hosting"}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Progress Slider - Airbnb Style */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={handleBack} className="pr-4">
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          
          {/* Progress bar container */}
          <View className="flex-1 h-1 bg-gray-200 rounded-full">
            {/* Animated progress indicator */}
            <View 
              className="h-full bg-black rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </View>

          {/* Step counter */}
          <Text className="pl-4 text-sm font-medium">
            {currentStep + 1}/{steps.length}
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-bold">{steps[currentStep].title}</Text>
          <Text className="text-gray-500">{steps[currentStep].subtitle}</Text>
        </View>
      </View>

      <ScrollView>
        {steps[currentStep].content}
      </ScrollView>
    </SafeAreaView>
  );
}