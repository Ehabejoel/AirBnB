import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HostDashboard() {  const stats = {
    earnings: '2,540,000 FCFA',
    bookings: 12,
    views: 156,
    occupancyRate: '78%'
  };

  const quickActions = [
    { title: 'Create listing', icon: 'add-home', color: '#FF385C' },
    { title: 'Calendar', icon: 'calendar-today', color: '#00A699' },
    { title: 'Pricing', icon: 'attach-money', color: '#484848' },
    { title: 'Messages', icon: 'message', color: '#767676' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-6">Host Dashboard</Text>

          {/* Stats Overview */}
          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <Text className="text-lg font-semibold mb-4">Overview</Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] bg-white p-4 rounded-lg mb-3">
                <Text className="text-gray-600">Earnings</Text>
                <Text className="text-xl font-bold mt-1">{stats.earnings}</Text>
              </View>
              <View className="w-[48%] bg-white p-4 rounded-lg mb-3">
                <Text className="text-gray-600">Bookings</Text>
                <Text className="text-xl font-bold mt-1">{stats.bookings}</Text>
              </View>
              <View className="w-[48%] bg-white p-4 rounded-lg">
                <Text className="text-gray-600">Views</Text>
                <Text className="text-xl font-bold mt-1">{stats.views}</Text>
              </View>
              <View className="w-[48%] bg-white p-4 rounded-lg">
                <Text className="text-gray-600">Occupancy</Text>
                <Text className="text-xl font-bold mt-1">{stats.occupancyRate}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-4">Quick Actions</Text>
            <View className="flex-row flex-wrap justify-between">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className="w-[48%] bg-gray-50 p-4 rounded-lg mb-3 flex-row items-center"
                >
                  <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                  <Text className="ml-3 font-medium">{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View>
            <Text className="text-lg font-semibold mb-4">Recent Activity</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-gray-600">No recent activity</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}