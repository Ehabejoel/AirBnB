import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { removeToken, removeUser } from '../../utils/storage';

export default function ProfileScreen() {
  const router = useRouter();

  const accountItems = [
    { title: 'Personal information', icon: 'person' as const, onPress: () => router.push('/personal-info') },
    { title: 'Payments and payouts', icon: 'payment' as const, onPress: () => router.push('/payments') },
  ];

  const preferencesItems = [
    { title: 'Translation', icon: 'translate' as const },
    { title: 'Notifications', icon: 'notifications' as const },
    { title: 'Privacy and sharing', icon: 'security' as const },
  ];

  const hostingItems = [
    { title: 'List your space', icon: 'add-home' as const },
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
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-4">Profile</Text>
          
          <TouchableOpacity 
            className="flex-row items-center mb-6"
            onPress={() => router.push('/personal-profile')}
          >
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              className="w-16 h-16 rounded-full"
            />
            <View className="ml-4">
              <Text className="text-xl font-semibold">James Smith</Text>
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