import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter
import 'react-native-reanimated';
import '../global.css';
import { getToken } from '../utils/storage';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { ChatProvider } from '../contexts/ChatContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter(); // Initialize router

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
  });

  const checkAuth = async () => {
    try {
      console.time('getToken');
      const token = await getToken();
      console.timeEnd('getToken');
      console.log('Auth token:', token);
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  // Navigate when isAuthenticated changes
  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace('(tabs)'); // Navigate to (tabs) if authenticated
    } else if (isAuthenticated === false) {
      router.replace('(auth)'); // Navigate to (auth) if not authenticated
    }
  }, [isAuthenticated, router]);

  if (!loaded || isLoading || isAuthenticated === null) {
    return null; // Keep splash screen visible
  }

  return (
    <ChatProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="chatDetailSreen" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </ChatProvider>
  );
}