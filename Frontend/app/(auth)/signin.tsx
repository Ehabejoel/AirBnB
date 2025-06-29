import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { signIn } from '../../utils/api';
import { storeToken, storeUser } from '../../utils/storage';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const response = await signIn({ email, password });
      await storeToken(response.token);
      await storeUser(response.user);
      router.replace('/(tabs)');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-4">
        {/* Logo or Icon */}
        <View className="mb-8 items-center">
          {/* <Image
            source={require('../../assets/logo.png')}
            style={{ width: 64, height: 64, marginBottom: 12, borderRadius: 16 }}
            resizeMode="contain"
          /> */}
          <Text className="text-4xl font-extrabold mb-1 text-[#FF385C]">Welcome back</Text>
          <Text className="text-gray-600 text-lg">Sign in to your account</Text>
        </View>

        {/* Form Container */}
        <View className="w-full bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 pr-12"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
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

          <TouchableOpacity
            className={`bg-[#FF385C] py-3 rounded-xl mt-4 shadow-md ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-2 text-gray-400 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600">Don't have an account?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity className="ml-1">
                <Text className="text-[#FF385C] font-semibold">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}