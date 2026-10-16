import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  User,
  Mail,
  Target,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { updateUserProfile, getUserProfile, UserProfile } from '../database/db';

const ROLES_LIST = [
  'Personal (Pengguna Pribadi)',
  'Freelancer / Kreator',
  'Software Engineer',
  'Pebisnis / Wirausaha',
  'Karyawan Swasta',
  'Mahasiswa',
];

export default function SetupProfileScreen() {
  const router = useRouter();
  const current = getUserProfile();

  const [name, setName] = useState(current.name === 'Pengguna RSDVault' ? '' : current.name);
  const [role, setRole] = useState(current.role || 'Personal (Pengguna Pribadi)');
  const [email, setEmail] = useState(current.email === 'pengguna@rsdvault.app' ? '' : current.email);
  const [targetStr, setTargetStr] = useState(
    current.monthly_income_target > 0 ? current.monthly_income_target.toString() : '10000000'
  );
  const [avatarUri, setAvatarUri] = useState<string>(current.avatar_uri || '');

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin galeri untuk memilih foto profil.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets.length > 0) {
        setAvatarUri(pickerResult.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memilih gambar.');
    }
  };

  const handleFinishSetup = () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan nama lengkap atau panggilan Anda.');
      return;
    }

    const cleanTarget = parseInt(targetStr.replace(/[^0-9]/g, ''), 10) || 10000000;

    const updated: UserProfile = {
      name: name.trim(),
      role: role.trim() || 'Personal (Pengguna Pribadi)',
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@rsdvault.app`,
      monthly_income_target: cleanTarget,
      currency: 'IDR (Rp)',
      avatar_uri: avatarUri,
    };

    updateUserProfile(updated);
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    } catch (e) {
      console.warn('Failed to save onboarding flag:', e);
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Fixed Sticky Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerBadge}>
          <Sparkles size={13} color="#1D4ED8" />
          <Text style={styles.headerBadgeText}>LANGKAH TERAKHIR</Text>
        </View>
        <Text style={styles.headerTitle}>Lengkapi Profil Anda</Text>
        <Text style={styles.headerSub}>
          Sesuaikan identitas Anda untuk pengalaman pencatatan keuangan yang dipersonalisasi.
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Foto Profil Avatar Picker */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarWrap}
              activeOpacity={0.8}
              onPress={handlePickImage}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <User size={44} color="#94A3B8" />
                </View>
              )}
              <View style={styles.cameraBtn}>
                <Camera size={15} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage}>
              <Text style={styles.uploadBtnText}>
                {avatarUri ? 'Ganti Foto Profil' : '+ Unggah Foto Profil'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Nama Lengkap */}
          <Text style={styles.inputLabel}>Nama Lengkap / Panggilan *</Text>
          <View style={styles.inputWrap}>
            <User size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Reza Saputra"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Input Email Pribadi */}
          <Text style={styles.inputLabel}>Alamat Email</Text>
          <View style={styles.inputWrap}>
            <Mail size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: reza@email.com (opsional)"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Pilih Profesi / Aktivitas */}
          <Text style={styles.inputLabel}>Profesi / Status Penggunaan</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.roleScrollView}
          >
            {ROLES_LIST.map((r) => {
              const isSelected = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, isSelected && styles.roleChipActive]}
                  onPress={() => setRole(r)}
                  activeOpacity={0.8}
                >
                  {isSelected && <Check size={13} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text style={[styles.roleChipText, isSelected && styles.roleChipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Target Pemasukan Bulanan */}
          <Text style={styles.inputLabel}>Target Pendapatan Bulanan (Rp)</Text>
          <View style={styles.inputWrap}>
            <Target size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: 10000000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={targetStr}
              onChangeText={setTargetStr}
            />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Sticky Footer Button */}
      <View style={styles.fixedFooter}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={handleFinishSetup}
        >
          <Text style={styles.primaryBtnText}>Mulai Gunakan RSDVault</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  fixedHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 8,
  },
  headerBadgeText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 10,
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: 'Onest_800ExtraBold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: 'Onest_400Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uploadBtnText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#1D4ED8',
  },
  inputLabel: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#334155',
    marginBottom: 8,
    marginTop: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Onest_500Medium',
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  roleScrollView: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  roleChipText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Onest_600SemiBold',
  },
  fixedFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    height: 52,
    gap: 8,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
