import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  User,
} from 'lucide-react-native';

export default function TabLayout() {
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  // Hitung padding bawah dinamis agar navigation bar HP (Android 3 tombol / iOS bar) tidak menutupi tab bar
  const bottomInset = isWeb ? 8 : Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);
  const barHeight = isWeb ? 66 : 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#1D4ED8', // Royal Blue
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: barHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontFamily: 'Onest_600SemiBold',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transaksi',
          tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Anggaran',
          tabBarIcon: ({ color, size }) => <PieChart size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
