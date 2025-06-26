import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createProperty } from '../utils/api';
import { getToken } from '../utils/storage';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Memoized FormField component
const FormField = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    error = '',
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric';
    multiline?: boolean;
    numberOfLines?: number;
    error?: string;
  }) => (
    <View className="mb-4">
      <Text className="text-base font-medium mb-1">{label}</Text>
      <TextInput
        className={`border ${error ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg text-base`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error ? <Text className="text-red-500 text-sm mt-1">{error}</Text> : null}
    </View>
  )
);

// Memoized HouseRuleInput component
const HouseRuleInput = React.memo(
  ({
    value,
    onChangeText,
    onSubmitEditing,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    onSubmitEditing: () => void;
  }) => (
    <TextInput
      className="flex-1 border border-gray-300 p-3 rounded-l-lg"
      value={value}
      onChangeText={onChangeText}
      placeholder="Add a house rule"
      blurOnSubmit={false}
      onSubmitEditing={onSubmitEditing}
      returnKeyType="done"
    />
  )
);

export default function CreateListingScreen() {
  // Basic listing information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState(new Date());
  const [availableTo, setAvailableTo] = useState(new Date());
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);

  // New additions
  const [propertyType, setPropertyType] = useState('apartment');
  const [guestCapacity, setGuestCapacity] = useState('');
  const [houseRules, setHouseRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [hostMobileNumber, setHostMobileNumber] = useState('');

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Amenities
  const [amenities, setAmenities] = useState({
    wifi: false,
    kitchen: false,
    ac: false,
    tv: false,
    parking: false,
    pool: false,
    washer: false,
    dryer: false,
    heating: false,
    workspace: false,
    gym: false,
    breakfast: false,
    evCharging: false,
    hotTub: false,
    bbqGrill: false,
    fireplace: false,
    patio: false,
    security: false,
  });

  // Property type options
  const propertyTypes = [
    { label: 'Apartment', value: 'apartment' },
    { label: 'House', value: 'house' },
    { label: 'Villa', value: 'villa' },
    { label: 'Condo', value: 'condo' },
    { label: 'Cabin', value: 'cabin' },
    { label: 'Tiny house', value: 'tiny_house' },
    { label: 'Boat', value: 'boat' },
    { label: 'Camper/RV', value: 'camper' },
  ];

  // Interfaces
  interface Amenities {
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
  }

  type AmenityKey = keyof Amenities;

  // Toggle amenity selection
  const toggleAmenity = (amenity: AmenityKey): void => {
    setAmenities({
      ...amenities,
      [amenity]: !amenities[amenity],
    });
  };

  // Add a new house rule
  const addHouseRule = (): void => {
    if (newRule.trim() === '') return;
    setHouseRules([...houseRules, newRule.trim()]);
    setNewRule('');
    Keyboard.dismiss();
  };

  // Remove a house rule
  const removeHouseRule = (index: number): void => {
    const updatedRules = [...houseRules];
    updatedRules.splice(index, 1);
    setHouseRules(updatedRules);
  };

  // Image selection
  const selectImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to upload images.');
      return;
    }
    setIsUploadingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload images. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = (index: number): void => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  // Form validation
  const validateForm = (): boolean => {
    let formErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!title.trim()) {
      formErrors.title = 'Title is required';
      isValid = false;
    }
    if (!description.trim()) {
      formErrors.description = 'Description is required';
      isValid = false;
    } else if (description.length < 20) {
      formErrors.description = 'Description must be at least 20 characters';
      isValid = false;
    }
    if (!streetAddress.trim()) {
      formErrors.streetAddress = 'Street address is required';
      isValid = false;
    }
    if (!city.trim()) {
      formErrors.city = 'City is required';
      isValid = false;
    }
    if (!state.trim()) {
      formErrors.state = 'State/Province is required';
      isValid = false;
    }
    if (!country.trim()) {
      formErrors.country = 'Country is required';
      isValid = false;
    }
    if (!zipCode.trim()) {
      formErrors.zipCode = 'Postal/ZIP code is required';
      isValid = false;
    }
    if (!price.trim()) {
      formErrors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      formErrors.price = 'Price must be a positive number';
      isValid = false;
    }
    if (!bedrooms.trim()) {
      formErrors.bedrooms = 'Number of bedrooms is required';
      isValid = false;
    } else if (isNaN(Number(bedrooms)) || Number(bedrooms) < 1) {
      formErrors.bedrooms = 'Bedrooms must be at least 1';
      isValid = false;
    }
    if (!bathrooms.trim()) {
      formErrors.bathrooms = 'Number of bathrooms is required';
      isValid = false;
    } else if (isNaN(Number(bathrooms)) || Number(bathrooms) < 1) {
      formErrors.bathrooms = 'Bathrooms must be at least 1';
      isValid = false;
    }
    if (!guestCapacity.trim()) {
      formErrors.guestCapacity = 'Guest capacity is required';
      isValid = false;
    } else if (isNaN(Number(guestCapacity)) || Number(guestCapacity) < 1) {
      formErrors.guestCapacity = 'Guest capacity must be at least 1';
      isValid = false;
    }
    if (images.length === 0) {
      formErrors.images = 'At least one image is required';
      isValid = false;
    }
    if (!hostMobileNumber.trim()) {
      formErrors.hostMobileNumber = 'Mobile money/orange number is required';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };
  // Form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const propertyData = {
        title,
        description,
        location: {
          streetAddress,
          city,
          state,
          country,
          zipCode,
        },
        propertyType,
        price: Number(price),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        guestCapacity: Number(guestCapacity),
        images,
        amenities,
        houseRules,
        availableFrom: availableFrom.toISOString(),
        availableTo: availableTo.toISOString(),
        hostMobileNumber,
      };

      await createProperty(token, propertyData);
      Alert.alert('Success', 'Your listing has been created!', [
        { text: 'OK' },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checkbox component for amenities
  const AmenityCheckbox = ({ title, value, onToggle }: { title: string; value: boolean; onToggle: () => void }) => (
    <TouchableOpacity className="flex-row items-center mb-2" onPress={onToggle}>
      <View className={`h-6 w-6 border border-gray-300 rounded mr-2 items-center justify-center ${value ? 'bg-[#FF385C]' : 'bg-white'}`}>
        {value && <MaterialIcons name="check" size={16} color="white" />}
      </View>
      <Text className="text-base">{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4">Create New Listing</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 p-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <FormField
            label="Listing Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a catchy title"
            error={errors.title}
          />
          <FormField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your property"
            multiline
            numberOfLines={4}
            error={errors.description}
          />
          <Text className="text-xl font-semibold mb-2">Address Information</Text>
          <FormField
            label="Street Address"
            value={streetAddress}
            onChangeText={setStreetAddress}
            placeholder="123 Main Street"
            error={errors.streetAddress}
          />
          <FormField
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="London"
            error={errors.city}
          />
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <FormField
                label="State/Province"
                value={state}
                onChangeText={setState}
                placeholder="England"
                error={errors.state}
              />
            </View>
            <View className="flex-1 ml-2">
              <FormField
                label="Postal/ZIP Code"
                value={zipCode}
                onChangeText={setZipCode}
                placeholder="SW1A 1AA"
                error={errors.zipCode}
              />
            </View>
          </View>
          <FormField
            label="Country"
            value={country}
            onChangeText={setCountry}
            placeholder="United Kingdom"
            error={errors.country}
          />
          <Text className="text-base font-medium mb-1">Property Type</Text>
          <View className="border border-gray-300 rounded-lg mb-4">
            <Picker<string>
              selectedValue={propertyType}
              onValueChange={(itemValue: string) => setPropertyType(itemValue)}
            >
              {propertyTypes.map((type: { label: string; value: string }) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
          <FormField
            label="Price per night (Fcfa)"
            value={price}
            onChangeText={setPrice}
            placeholder="100"
            keyboardType="numeric"
            error={errors.price}
          />
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <FormField
                label="Bedrooms"
                value={bedrooms}
                onChangeText={setBedrooms}
                placeholder="2"
                keyboardType="numeric"
                error={errors.bedrooms}
              />
            </View>
            <View className="flex-1 ml-2">
              <FormField
                label="Bathrooms"
                value={bathrooms}
                onChangeText={setBathrooms}
                placeholder="1"
                keyboardType="numeric"
                error={errors.bathrooms}
              />
            </View>
          </View>
          <FormField
            label="Guest Capacity"
            value={guestCapacity}
            onChangeText={setGuestCapacity}
            placeholder="4"
            keyboardType="numeric"
            error={errors.guestCapacity}
          />
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-base font-medium mb-1">Available From</Text>
              <TouchableOpacity
                className={`border ${errors.availableFrom ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg`}
                onPress={() => setShowFromDate(true)}
              >
                <Text>{availableFrom.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showFromDate && (
                <DateTimePicker
                  value={availableFrom}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFromDate(false);
                    if (selectedDate) {
                      setAvailableFrom(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
              {errors.availableFrom && <Text className="text-red-500 text-sm mt-1">{errors.availableFrom}</Text>}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-base font-medium mb-1">Available To</Text>
              <TouchableOpacity
                className={`border ${errors.availableTo ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg`}
                onPress={() => setShowToDate(true)}
              >
                <Text>{availableTo.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showToDate && (
                <DateTimePicker
                  value={availableTo}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowToDate(false);
                    if (selectedDate) {
                      setAvailableTo(selectedDate);
                    }
                  }}
                  minimumDate={availableFrom}
                />
              )}
              {errors.availableTo && <Text className="text-red-500 text-sm mt-1">{errors.availableTo}</Text>}
            </View>
          </View>
          <Text className="text-base font-medium mb-3">Amenities</Text>
          <View className="flex-row flex-wrap mb-4">
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Wi-Fi" value={amenities.wifi} onToggle={() => toggleAmenity('wifi')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Kitchen" value={amenities.kitchen} onToggle={() => toggleAmenity('kitchen')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Air Conditioning" value={amenities.ac} onToggle={() => toggleAmenity('ac')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="TV" value={amenities.tv} onToggle={() => toggleAmenity('tv')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Parking" value={amenities.parking} onToggle={() => toggleAmenity('parking')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Pool" value={amenities.pool} onToggle={() => toggleAmenity('pool')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Washer" value={amenities.washer} onToggle={() => toggleAmenity('washer')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Dryer" value={amenities.dryer} onToggle={() => toggleAmenity('dryer')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Heating" value={amenities.heating} onToggle={() => toggleAmenity('heating')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Workspace" value={amenities.workspace} onToggle={() => toggleAmenity('workspace')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Gym" value={amenities.gym} onToggle={() => toggleAmenity('gym')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Breakfast" value={amenities.breakfast} onToggle={() => toggleAmenity('breakfast')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="EV Charging" value={amenities.evCharging} onToggle={() => toggleAmenity('evCharging')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Hot Tub" value={amenities.hotTub} onToggle={() => toggleAmenity('hotTub')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="BBQ Grill" value={amenities.bbqGrill} onToggle={() => toggleAmenity('bbqGrill')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Fireplace" value={amenities.fireplace} onToggle={() => toggleAmenity('fireplace')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Patio" value={amenities.patio} onToggle={() => toggleAmenity('patio')} />
            </View>
            <View className="w-1/2 mb-2">
              <AmenityCheckbox title="Security" value={amenities.security} onToggle={() => toggleAmenity('security')} />
            </View>
          </View>
          <Text className="text-base font-medium mb-3">House Rules</Text>
          {houseRules.length > 0 && (
            <View className="mb-4">
              {houseRules.map((rule, index) => (
                <View key={index} className="flex-row items-center mb-2 bg-gray-100 p-2 rounded">
                  <Text className="flex-1">{rule}</Text>
                  <TouchableOpacity onPress={() => removeHouseRule(index)}>
                    <MaterialIcons name="close" size={18} color="gray" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View className="flex-row mb-4">
            <HouseRuleInput value={newRule} onChangeText={setNewRule} onSubmitEditing={addHouseRule} />
            <TouchableOpacity className="bg-[#FF385C] px-4 justify-center rounded-r-lg" onPress={addHouseRule}>
              <Text className="text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-base font-medium mb-3">Photos</Text>
          {errors.images && <Text className="text-red-500 text-sm mb-2">{errors.images}</Text>}
          {images.length > 0 && (
            <ScrollView horizontal className="mb-4">
              {images.map((uri, index) => (
                <View key={index} className="mr-3 relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded" />
                  <TouchableOpacity
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                    onPress={() => removeImage(index)}
                  >
                    <MaterialIcons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity
            className="border border-dashed border-gray-300 p-4 rounded-lg items-center justify-center mb-6"
            onPress={selectImages}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator color="#FF385C" />
            ) : (
              <>
                <MaterialIcons name="add-photo-alternate" size={36} color="#FF385C" />
                <Text className="text-[#FF385C] mt-2">Add Photos</Text>
              </>
            )}
          </TouchableOpacity>
          <FormField
            label="Mobile Money/Orange Number"
            value={hostMobileNumber}
            onChangeText={setHostMobileNumber}
            placeholder="Enter your mobile money or orange number"
            keyboardType="numeric"
            error={errors.hostMobileNumber}
          />
          <TouchableOpacity
            className={`bg-[#FF385C] p-4 rounded-lg items-center justify-center mb-8 ${isSubmitting ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">List Property</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}