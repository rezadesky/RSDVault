import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import {
  useFonts,
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
  Onest_800ExtraBold,
} from '@expo-google-fonts/onest';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../database/db';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
    Onest_800ExtraBold,
  });

  useEffect(() => {
    try {
      initDatabase();
    } catch (e) {
      console.warn('initDatabase in RootLayout error:', e);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.webContainer}>
        <View style={styles.mobileFrame}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="setup-profile" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    backgroundColor: '#1E293B', // Background canvas luar (slate dark aesthetic)
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  mobileFrame: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
});
