import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const ListingDetails = () => {
  const { id } = useLocalSearchParams();
  
  // Mock data - in a real app, fetch this based on the id
  const listing = {
    title: "Luxury Villa with Ocean View",
    location: "Cape Town, Western Cape, South Africa",
    images: [
      "https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    ],
    rating: 4.94,
    reviews: 186,
    price: "£433",
    originalPrice: "£486",
    description: "Stunning villa with panoramic ocean views, featuring modern amenities and private pool.",
    host: "Maria",
    hostJoined: "2019",
    availability: "16 – 21 Jun",
    nights: 5,
    amenities: [
      { icon: "water", name: "Ocean view" },
      { icon: "ship", name: "Harbour view" },
      { icon: "utensils", name: "Kitchen" },
      { icon: "wifi", name: "Wifi" },
      { icon: "laptop", name: "Dedicated workspace" },
    ],
    totalAmenities: 60
  };

interface SectionHeaderProps {
    title: string;
}

const renderSectionHeader = (title: string): React.ReactElement => (
    <Text className="text-2xl font-medium mb-3">{title}</Text>
);

  const renderDivider = () => (
    <View className="my-6 h-[1px] bg-gray-200" />
  );

  const renderRightArrow = () => (
    <MaterialIcons name="chevron-right" size={24} color="#717171" />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image 
            source={{ uri: listing.images[0] }}
            className="w-full h-72"
            resizeMode="cover"
          />
          <TouchableOpacity 
            className="absolute top-4 left-4 bg-white rounded-full p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="absolute top-4 right-4 bg-white rounded-full p-2"
          >
            <MaterialIcons name="favorite-border" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <Text className="text-2xl font-semibold">{listing.title}</Text>
          <View className="flex-row items-center mt-2">
            <MaterialIcons name="star" size={16} color="#000" />
            <Text className="ml-1">{listing.rating}</Text>
            <Text className="mx-1">·</Text>
            <Text className="underline">{listing.reviews} reviews</Text>
            <Text className="mx-1">·</Text>
            <Text className="underline">{listing.location}</Text>
          </View>

          {renderDivider()}

          {/* What this place offers */}
          <View className="mb-4">
            <Text className="text-2xl font-medium mb-4">What this place offers</Text>
            <View className="space-y-4">
              {listing.amenities.map((amenity, index) => (
                <View key={index} className="flex-row items-center">
                  <FontAwesome5 name={amenity.icon} size={18} color="#000" />
                  <Text className="ml-4 text-base">{amenity.name}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity className="mt-4 border border-gray-900 rounded-lg py-3">
              <Text className="text-center font-medium">Show all {listing.totalAmenities} amenities</Text>
            </TouchableOpacity>
          </View>

          {renderDivider()}

          {/* Where you'll be */}
          <View className="mb-4">
            <Text className="text-2xl font-medium mb-3">Where you'll be</Text>
            <View className="bg-gray-100 h-48 mb-2 rounded-lg overflow-hidden">
              {/* This would be a map component in a real app */}
              <View className="bg-gray-200 h-full w-full items-center justify-center">
                <Text className="text-gray-500">Map of {listing.location}</Text>
              </View>
            </View>
            <Text className="text-base font-medium">{listing.location}</Text>
            <Text className="text-gray-500 mt-1">Exact location provided after booking.</Text>
          </View>

          {renderDivider()}

          {/* Availability section */}
          <TouchableOpacity className="flex-row justify-between items-center mb-6">
            {renderSectionHeader("Availability")}
            {renderRightArrow()}
          </TouchableOpacity>
          <Text className="text-base mb-2">{listing.availability}</Text>

          {renderDivider()}

          {/* Cancellation policy */}
          <TouchableOpacity className="flex-row justify-between items-center mb-6">
            {renderSectionHeader("Cancellation policy")}
            {renderRightArrow()}
          </TouchableOpacity>
          <Text className="text-base mb-2">Free cancellation for 24 hours. Cancel before 9 Jun for a partial refund.</Text>
          <Text className="text-base text-gray-500 mb-2">Review this Host's full policy for details.</Text>

          {renderDivider()}

          {/* House rules */}
          <View className="mb-4">
            {renderSectionHeader("House rules")}
            <View className="space-y-2">
              <Text className="text-base">Check-in after 15:00</Text>
              <Text className="text-base">Checkout before 10:00</Text>
              <Text className="text-base">2 guests maximum</Text>
              <TouchableOpacity>
                <Text className="text-base font-medium underline mt-2">Show more</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderDivider()}

          {/* Safety & property */}
          <View className="mb-4">
            {renderSectionHeader("Safety & property")}
            <View className="space-y-2">
              <Text className="text-base">Pool/hot tub without a gate or lock</Text>
              <Text className="text-base">Heights without rails or protection</Text>
              <Text className="text-base">Carbon monoxide alarm</Text>
              <TouchableOpacity>
                <Text className="text-base font-medium underline mt-2">Show more</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderDivider()}

          {/* Report this listing */}
          <TouchableOpacity className="flex-row items-center mb-6">
            <FontAwesome5 name="flag" size={16} color="#000" className="mr-2" />
            <Text className="text-base font-medium underline ml-2">Report this listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky price and reserve button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-end">
              <Text className="text-xl font-semibold">{listing.price} GBP</Text>
              <Text className="text-base line-through text-gray-500 ml-2">{listing.originalPrice} GBP</Text>
            </View>
            <Text className="text-base">For {listing.nights} nights · {listing.availability}</Text>
          </View>
          <TouchableOpacity className="bg-[#FF385C] px-8 py-3 rounded-lg">
            <Text className="text-white font-semibold text-base">Reserve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ListingDetails;