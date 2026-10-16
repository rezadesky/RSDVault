import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';

export default function SplashScreen() {
  const router = useRouter();
  const [progressWidth, setProgressWidth] = useState(25);

  useEffect(() => {
    // Animasi progress bar loading
    const timerProgress = setTimeout(() => {
      setProgressWidth(140);
    }, 300);

    // Cek apakah sudah pernah onboarding & setup profil
    const checkOnboardingStatus = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
        setTimeout(() => {
          if (completed === 'true') {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        }, 1800);
      } catch (e) {
        setTimeout(() => {
          router.replace('/onboarding');
        }, 1800);
      }
    };

    checkOnboardingStatus();

    return () => {
      clearTimeout(timerProgress);
    };
  }, []);

  return (
    <View style={styles.webWrapper}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Konten Center: Logo + Teks RSDVault */}
        <View style={styles.centerContent}>
          {/* Animasi Logo Pop-in */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.logoWrap}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </MotiView>

          {/* Animasi Teks App Title */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.textWrap}
          >
            <Text style={styles.appTitle}>RSDVault</Text>
            <Text style={styles.appTagline}>PERSONAL FINANCE MANAGEMENT</Text>
          </MotiView>

          {/* Animasi Loading Bar Halus */}
          <View style={styles.loadingTrack}>
            <MotiView
              animate={{ width: progressWidth }}
              style={styles.loadingBar}
            />
          </View>
        </View>

        {/* Footer Security Badge */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>100% Offline & Private</Text>
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  textWrap: {
    alignItems: 'center',
  },
  appTitle: {
    fontFamily: 'Onest_800ExtraBold',
    fontSize: 34,
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 11,
    color: '#1D4ED8', // Royal Blue
    letterSpacing: 1.6,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  loadingTrack: {
    width: 140,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 36,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#1D4ED8',
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 36,
  },
  footerText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
});
