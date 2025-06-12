import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function InsightsScreen() {  const metrics = [
    { title: 'Occupancy Rate', value: '78%', trend: '+5%' },
    { title: 'Average Daily Rate', value: '433,000 FCFA', trend: '+23,000 FCFA' },
    { title: 'Monthly Revenue', value: '2,540,000 FCFA', trend: '+340,000 FCFA' },
    { title: 'Guest Satisfaction', value: '4.9', trend: '+0.2' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Insights</Text>

        <ScrollView>
          <View className="flex-row flex-wrap justify-between">
            {metrics.map((metric, index) => (
              <View key={index} className="w-[48%] bg-gray-50 p-4 rounded-lg mb-4">
                <Text className="text-gray-600">{metric.title}</Text>
                <Text className="text-2xl font-bold mt-1">{metric.value}</Text>
                <View className="flex-row items-center mt-2">
                  <MaterialIcons 
                    name={metric.trend.startsWith('+') ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={metric.trend.startsWith('+') ? '#22C55E' : '#EF4444'} 
                  />
                  <Text className={`ml-1 ${metric.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.trend}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="mt-4">
            <Text className="text-lg font-semibold mb-4">Performance Tips</Text>
            <View className="bg-blue-50 p-4 rounded-lg">
              <Text className="text-blue-800">
                Your listing's performance is above average. Consider increasing your nightly rate during peak season.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}