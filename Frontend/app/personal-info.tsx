import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getProfile, updateProfilePhoto } from '../utils/api';
import { getToken } from '../utils/storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from 'api/api_url';

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  identityVerified?: boolean;
  profilePhoto?: string;
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [pressedIndex, setPressedIndex] = useState(-1);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.log('No token found, redirecting to login');
          router.replace('/signin');
          return;
        }
        const data = await getProfile(token);
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const token = await getToken();
        if (!token) {
          router.replace('/signin');
          return;
        }

        const formData = new FormData();
        formData.append('photo', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-photo.jpg',
        } as any);

        const updatedUser = await updateProfilePhoto(token, formData);
        setUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo');
    }
  };

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{error}</Text>
        <TouchableOpacity onPress={() => router.replace('/signin')}>
          <Text className="text-blue-500">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <Text className="text-2xl font-bold mb-2">Personal information</Text>
            <Text className="text-gray-500">Update your info to help hosts and guests get to know you</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <TouchableOpacity 
              onPress={handleUploadPhoto}
              className="items-center justify-center py-4"
            >
              {userData?.profilePhoto ? (
                <View>
                  <Image 
                    source={{ 
                      uri: `${API_URL}${userData.profilePhoto}`
                    }} 
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                    resizeMode="cover"
                    onLoadStart={() => console.log('Image loading started')}
                    onLoad={() => console.log('Image loaded successfully')}
                    onLoadEnd={() => console.log('Image loading ended')}
                    onError={(error) => {
                      console.log('Image loading error:', error.nativeEvent);
                      console.log('Attempted image URL:', `${API_URL}${userData.profilePhoto}`);
                    }}
                  />
                </View>
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
                  <MaterialIcons name="person" size={40} color="#9ca3af" />
                </View>
              )}
              <Text className="text-blue-500 font-medium mt-2">Change profile photo</Text>
            </TouchableOpacity>

            {renderInfoItem("Full name", userData ? `${userData.firstName} ${userData.lastName}` : "Not provided", 0)}
            {renderInfoItem("Email", userData?.email || "Not provided", 1)}
            {renderInfoItem("Phone number", userData?.phoneNumber || "Not provided", 2)}
            {renderInfoItem("Address", userData?.address || "Not provided", 3)}
            {renderInfoItem("Emergency contact", userData?.emergencyContact || "Not provided", 4)}
            {renderInfoItem("Identity verification", userData?.identityVerified ? "Verified" : "Not verified", 5)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}