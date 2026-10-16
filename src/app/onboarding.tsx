import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import {
  Wallet,
  PieChart,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Check,
} from 'lucide-react-native';

const SLIDES = [
  {
    id: 1,
    title: 'Kelola Keuangan dengan Lebih Mudah',
    description:
      'Catat setiap pemasukan, pengeluaran, dan mutasi saldo Anda secara instan dalam genggaman.',
    icon: Wallet,
    iconColor: '#1D4ED8',
    iconBg: '#EFF6FF',
    badge: 'PENCATATAN INSTAN',
  },
  {
    id: 2,
    title: 'Kontrol Anggaran Bulanan & Batas Belanja',
    description:
      'Tentukan batas maksimal per kategori agar pengeluaran tidak boros dan arus kas tetap sehat.',
    icon: PieChart,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    badge: 'SMART BUDGETING',
  },
  {
    id: 3,
    title: 'Analisis Finansial & Laporan Lengkap',
    description:
      'Dapatkan grafik evaluasi tren harian, bulanan, dan ekspor laporan ke format PDF atau Excel.',
    icon: BarChart3,
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    badge: 'LAPORAN REAL-TIME',
  },
  {
    id: 4,
    title: '100% Offline & Privat di Perangkat',
    description:
      'Data keuangan Anda tersimpan privat di database lokal perangkat tanpa cloud atau server pihak ketiga.',
    icon: ShieldCheck,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    badge: 'PRIVASI MAKSIMAL',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSlide = SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;
  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace('/setup-profile');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    router.replace('/setup-profile');
  };

  return (
    <View style={styles.webWrapper}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Top Bar: Logo Mini + Tombol Lewati */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoMini}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>RSDVault</Text>
          </View>

          {!isLast && (
            <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.skipText}>Lewati</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Illustration Card */}
        <View style={styles.illustrationArea}>
          <MotiView
            key={`slide-ill-${currentSlide.id}`}
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.bigIconCircle, { backgroundColor: currentSlide.iconBg }]}
          >
            <IconComponent size={64} color={currentSlide.iconColor} />
          </MotiView>

          <View style={styles.featureBadge}>
            <Text style={[styles.featureBadgeText, { color: currentSlide.iconColor }]}>
              {currentSlide.badge}
            </Text>
          </View>
        </View>

        {/* Text Content Area */}
        <MotiView
          key={`slide-text-${currentSlide.id}`}
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.contentArea}
        >
          <Text style={styles.titleText}>{currentSlide.title}</Text>
          <Text style={styles.descText}>{currentSlide.description}</Text>
        </MotiView>

        {/* Bottom Navigation Controls */}
        <View style={styles.bottomControl}>
          {/* 4 Dots Indicator */}
          <View style={styles.dotsRow}>
            {SLIDES.map((slide, idx) => {
              const active = idx === currentIndex;
              return (
                <View
                  key={slide.id}
                  style={[
                    styles.dot,
                    active && styles.dotActive,
                  ]}
                />
              );
            })}
          </View>

          {/* Action Button (Panah / Mulai) */}
          <TouchableOpacity
            style={[styles.actionBtn, isLast && styles.actionBtnFinish]}
            activeOpacity={0.85}
            onPress={handleNext}
          >
            {isLast ? (
              <View style={styles.finishContent}>
                <Text style={styles.finishText}>Mulai Sekarang</Text>
                <Check size={18} color="#FFFFFF" />
              </View>
            ) : (
              <ArrowRight size={22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMini: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  brandName: {
    fontFamily: 'Onest_800ExtraBold',
    fontSize: 16,
    color: '#0F172A',
  },
  skipText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  illustrationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  bigIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    marginBottom: 20,
  },
  featureBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featureBadgeText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  contentArea: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  titleText: {
    fontFamily: 'Onest_800ExtraBold',
    fontSize: 24,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 32,
  },
  descText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  bottomControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#1D4ED8',
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnFinish: {
    width: 'auto',
    paddingHorizontal: 22,
    borderRadius: 28,
  },
  finishContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finishText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
