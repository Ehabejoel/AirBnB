import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TripsScreen() {
  const upcomingTrips = [
    {
      id: '1',
      location: 'Medellin, Colombia',
      dates: 'Jun 15-20',
      image: 'https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'Confirmed'
    }
  ];

  const pastTrips = [
    {
      id: '2',
      location: 'Barcelona, Spain',
      dates: 'Mar 10-15',
      image: 'https://images.pexels.com/photos/6908368/pexels-photo-6908368.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'Completed'
    }
  ];

  const renderTrip = (trip: any) => (
    <TouchableOpacity key={trip.id} className="mb-6">
      <View className="relative">
        <Image
          source={{ uri: trip.image }}
          className="w-full h-48 rounded-xl"
          resizeMode="cover"
        />
        <View className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
          <Text className="font-medium">{trip.status}</Text>
        </View>
      </View>
      <View className="mt-2">
        <Text className="text-lg font-semibold">{trip.location}</Text>
        <Text className="text-gray-500">{trip.dates}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-2xl font-bold">Trips</Text>
      </View>

      <ScrollView className="flex-1">
        {upcomingTrips.length === 0 && pastTrips.length === 0 ? (
          <View className="p-4">
            <View className="bg-gray-100 rounded-2xl p-4">
              <Text className="text-xl font-semibold mb-2">No trips yet</Text>
              <Text className="text-gray-600 mb-4">Time to dust off your bags and start planning your next adventure</Text>
              <TouchableOpacity className="bg-[#FF385C] py-3 px-5 rounded-lg self-start">
                <Text className="text-white font-semibold">Start searching</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="p-4">
            {upcomingTrips.length > 0 && (
              <View className="mb-8">
                <Text className="text-lg font-semibold mb-4">Upcoming trips</Text>
                {upcomingTrips.map(renderTrip)}
              </View>
            )}
            
            {pastTrips.length > 0 && (
              <View>
                <Text className="text-lg font-semibold mb-4">Where you've been</Text>
                {pastTrips.map(renderTrip)}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}