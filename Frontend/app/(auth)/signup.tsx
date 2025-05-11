import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { signUp } from '../../utils/api';
import { storeToken, storeUser } from '../../utils/storage';

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      
      // Only send the required fields to match backend expectations
      const userData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim(),  // Send fullName directly
        phoneNumber: formData.phoneNumber,
        address: formData.address
      };

      console.log('Attempting signup with:', { ...userData, password: '***' });
      const response = await signUp(userData);
      await storeToken(response.token);
      await storeUser(response.user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="mb-8">
          <Text className="text-4xl font-bold mb-2">Create account</Text>
          <Text className="text-gray-600 text-lg">Join our community</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Confirm your password"
                value={formData.passwordConfirm}
                onChangeText={(text) => setFormData({ ...formData, passwordConfirm: text })}
                secureTextEntry={!showPasswordConfirm}
              />
              <TouchableOpacity
                className="absolute right-4 top-3"
                onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                <MaterialIcons
                  name={showPasswordConfirm ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium">Address</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter your address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
            />
          </View>

          <TouchableOpacity
            className="bg-[#FF385C] py-3 rounded-lg mt-4"
            onPress={handleSignUp}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600">Already have an account?</Text>
            <Link href="/signin" asChild>
              <TouchableOpacity className="ml-1">
                <Text className="text-[#FF385C] font-semibold">Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}