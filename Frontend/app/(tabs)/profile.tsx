import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { removeToken, removeUser, getToken } from '../../utils/storage';
import { useState, useEffect } from 'react';
import { getProfile } from '../../utils/api';
import { API_URL } from '../../api/api_url';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.replace('/signin');
          return;
        }
        const data = await getProfile(token);
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const accountItems = [
    { title: 'Personal information', icon: 'person' as const, onPress: () => router.push('/personal-info') },
    { title: 'Payments and payouts', icon: 'payment' as const, onPress: () => router.push('/payments') },
  ];

  const preferencesItems = [
    { title: 'Translation', icon: 'translate' as const },
    { title: 'Notifications', icon: 'notifications' as const },
    { title: 'Privacy and sharing', icon: 'security' as const },
  ];  const hostingItems = userData?.roles?.includes('host')
    ? [
        { title: 'View Host Dashboard', icon: 'dashboard' as const, onPress: () => router.push('/(hosttabs)') },
        { title: 'Resource center', icon: 'help' as const },
      ]
    : [
        { title: 'List your space', icon: 'add-home' as const, onPress: () => router.push('/list-your-space') },
        { title: 'Resource center', icon: 'help' as const },
      ];

  const renderMenuItem = (item: { title: string; icon: keyof typeof MaterialIcons.glyphMap, onPress?: () => void }) => (
    <TouchableOpacity key={item.title} className="flex-row items-center py-4" onPress={item.onPress}>
      <MaterialIcons name={item.icon} size={24} color="#000" />
      <Text className="flex-1 text-base ml-3">{item.title}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#717171" />
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: { title: string; icon: keyof typeof MaterialIcons.glyphMap, onPress?: () => void }[]) => (
    <View className="mb-8">
      <Text className="text-lg font-semibold mb-2">{title}</Text>
      <View className="border-t border-gray-200">
        {items.map(item => renderMenuItem(item))}
      </View>
    </View>
  );

  const handleLogout = async () => {
    await removeToken();
    await removeUser();
    router.replace('/signin');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-4">Profile</Text>
          
          <TouchableOpacity 
            className="flex-row items-center mb-6"
            onPress={() => router.push('/personal-info')}
          >
            {userData?.profilePhoto ? (
              <Image
                source={{ uri: `${API_URL}${userData.profilePhoto}` }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
                <MaterialIcons name="person" size={32} color="#9ca3af" />
              </View>
            )}
            <View className="ml-4">
              <Text className="text-xl font-semibold">
                {userData ? `${userData.firstName} ${userData.lastName}` : 'Guest User'}
              </Text>
              <Text className="text-gray-500">Show profile</Text>
            </View>
          </TouchableOpacity>

          <View className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="stars" size={24} color="#FF385C" />
              <Text className="text-lg font-semibold ml-2">Complete your profile</Text>
            </View>
            <Text className="text-gray-600 mb-3">Add more information to increase your chances of getting bookings.</Text>
            <TouchableOpacity className="bg-[#FF385C] py-2 px-4 rounded-lg self-start">
              <Text className="text-white font-semibold">Get started</Text>
            </TouchableOpacity>
          </View>

          {renderSection('Account', accountItems)}
          {renderSection('Hosting', hostingItems)}
          {renderSection('Preferences', preferencesItems)}

          <TouchableOpacity className="mt-6 mb-8" onPress={handleLogout}>
            <Text className="text-[#FF385C] font-semibold text-lg">Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}