import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-4">Explore</Text>
          
          <View className="space-y-4">
            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-lg font-semibold mb-2">File-based routing</Text>
              <Text className="text-gray-600">
                This app uses Expo Router for file-based routing. Check the app directory structure to understand the routing.
              </Text>
            </View>

            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-lg font-semibold mb-2">Cross-platform</Text>
              <Text className="text-gray-600">
                This app works on Android, iOS, and web platforms with a single codebase.
              </Text>
            </View>

            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-lg font-semibold mb-2">Styling with NativeWind</Text>
              <Text className="text-gray-600">
                The app uses NativeWind (Tailwind CSS) for styling components.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
