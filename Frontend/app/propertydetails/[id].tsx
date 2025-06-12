import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { API_URL } from '../../api/api_url';
import Map from '../../components/Map';

interface Property {
  _id: string;
  owner: string;
  title: string;
  description: string;
  rating?: number;
  reviews?: number;
  location: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  propertyType: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  guestCapacity: number;
  amenities: {
    wifi: boolean;
    kitchen: boolean;
    ac: boolean;
    tv: boolean;
    parking: boolean;
    pool: boolean;
    washer: boolean;
    dryer: boolean;
    heating: boolean;
    workspace: boolean;
    gym: boolean;
    breakfast: boolean;
    evCharging: boolean;
    hotTub: boolean;
    bbqGrill: boolean;
    fireplace: boolean;
    patio: boolean;
    security: boolean;
  };
  houseRules: string[];
  images: string[];
  availability: {
    startDate: string;
    endDate: string;
  };
}

const ListingDetails = () => {
  const { id } = useLocalSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_URL}/properties/${id}`);
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error || 'Property not found'}</Text>
        <TouchableOpacity 
          className="mt-4 bg-black px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
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
            source={{ uri: `${API_URL}${property.images[0]}` }}
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
          <Text className="text-2xl font-semibold">{property.title}</Text>
          <View className="flex-row items-center mt-2">
            {property.rating && (
              <>
                <MaterialIcons name="star" size={16} color="#000" />
                <Text className="ml-1">{property.rating}</Text>
                <Text className="mx-1">·</Text>
              </>
            )}
            {property.reviews && (
              <>
                <Text className="underline">{property.reviews} reviews</Text>
                <Text className="mx-1">·</Text>
              </>
            )}
            <Text className="underline">{property.location.city}, {property.location.country}</Text>
          </View>          {renderDivider()}          {/* What this place offers */}
          <View className="mb-4">
            <Text className="text-2xl font-medium mb-4">What this place offers</Text>
            {property.amenities ? (
              <>
                <View className="space-y-4">
                  {Object.entries(property.amenities)
                    .filter(([_, value]) => value)
                    .map(([key], index) => (
                      <View key={index} className="flex-row items-center">
                        <FontAwesome5 
                          name={
                            key === 'wifi' ? 'wifi' :
                            key === 'kitchen' ? 'utensils' :
                            key === 'ac' ? 'snowflake' :
                            key === 'tv' ? 'tv' :
                            key === 'parking' ? 'parking' :
                            key === 'pool' ? 'swimming-pool' :
                            key === 'washer' ? 'washing-machine' :
                            key === 'dryer' ? 'dryer' :
                            key === 'heating' ? 'temperature-high' :
                            key === 'workspace' ? 'laptop' :
                            key === 'gym' ? 'dumbbell' :
                            key === 'breakfast' ? 'coffee' :
                            key === 'evCharging' ? 'charging-station' :
                            key === 'hotTub' ? 'hot-tub' :
                            key === 'bbqGrill' ? 'fire' :
                            key === 'fireplace' ? 'fire-alt' :
                            key === 'patio' ? 'umbrella-beach' :
                            'shield-alt'
                          } 
                          size={18} 
                          color="#000" 
                        />
                        <Text className="ml-4 text-base capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                      </View>
                    ))}
                </View>
                <TouchableOpacity className="mt-4 border border-gray-900 rounded-lg py-3">
                  <Text className="text-center font-medium">Show all amenities</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text className="text-gray-500">No amenities listed</Text>
            )}
          </View>

          {renderDivider()}

          {/* Where you'll be */}
          <View className="mb-4">
            <Text className="text-2xl font-medium mb-3">Where you'll be</Text>
            <View className="bg-gray-100 h-48 mb-2 rounded-lg overflow-hidden">
              <Map 
                latitude={property.location.coordinates?.latitude || 51.5074}
                longitude={property.location.coordinates?.longitude || -0.1278}
                city={property.location.city}
                country={property.location.country}
              />
            </View>
            <Text className="text-base font-medium">{property.location.city}, {property.location.country}</Text>
            <Text className="text-gray-500 mt-1">Exact location provided after booking.</Text>
          </View>

          {renderDivider()}          {/* Availability section */}          <TouchableOpacity className="flex-row justify-between items-center mb-6">
            <View>
              {renderSectionHeader("Availability")}
            </View>
            {renderRightArrow()}
          </TouchableOpacity>
          <View>
            <Text className="text-base mb-2">
              Available from <Text>{new Date(property.availability.startDate).toLocaleDateString()}</Text> to <Text>{new Date(property.availability.endDate).toLocaleDateString()}</Text>
            </Text>
          </View>

          {renderDivider()}

          {/* Cancellation policy */}          <TouchableOpacity className="flex-row justify-between items-center mb-6">
            <View>
              {renderSectionHeader("Cancellation policy")}
            </View>
            {renderRightArrow()}
          </TouchableOpacity>
          <Text className="text-base mb-2">Free cancellation for 24 hours. Cancel before 9 Jun for a partial refund.</Text>
          <Text className="text-base text-gray-500 mb-2">Review this Host's full policy for details.</Text>

          {renderDivider()}          {/* House rules */}
          <View className="mb-4">
            {renderSectionHeader("House rules")}
            <View className="space-y-2">
              {property.houseRules && property.houseRules.length > 0 ? (
                property.houseRules.map((rule, index) => (
                  <Text key={index} className="text-base">{rule}</Text>
                ))
              ) : (
                <Text className="text-gray-500">No house rules specified</Text>
              )}
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
            <Text className="text-xl font-semibold">£{property.price} GBP</Text>
            <Text className="text-base">Per night</Text>
          </View>          <TouchableOpacity 
            className="bg-[#FF385C] px-8 py-3 rounded-lg"
            onPress={() => router.push({
              pathname: '/booking/[propertyId]',
              params: {
                propertyId: id,
                title: property.title,
                price: property.price.toString(),
                image: property.images[0] ? `${API_URL}${property.images[0]}` : null
              }
            })}
          >
            <Text className="text-white font-semibold text-base">Reserve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ListingDetails;