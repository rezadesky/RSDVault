import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Shield,
  Coins,
  Palette,
  HardDriveDownload,
  HardDriveUpload,
  ChevronRight,
  Edit3,
  Briefcase,
  Mail,
  Target,
  X,
  Check,
  Camera,
} from 'lucide-react-native';
import {
  getUserProfile,
  updateUserProfile,
  exportAllDataJSON,
  importAllDataJSON,
  UserProfile,
} from '../../database/db';

const ROLES_LIST = [
  'Personal (Pengguna Pribadi)',
  'Freelancer / Kreator',
  'Software Engineer',
  'Pebisnis / Wirausaha',
  'Investor / Trader',
  'Karyawan Swasta',
  'Mahasiswa',
];

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Pengguna RSDVault',
    role: 'Personal (Pengguna Pribadi)',
    email: 'pengguna@rsdvault.app',
    monthly_income_target: 10000000,
    currency: 'IDR (Rp)',
    avatar_uri: '',
  });

  const [isBioActive, setIsBioActive] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Form Edit State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTargetStr, setEditTargetStr] = useState('');
  const [editCurrency, setEditCurrency] = useState('IDR (Rp)');
  const [editAvatarUri, setEditAvatarUri] = useState<string>('');
  const [editCycleMode, setEditCycleMode] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    const data = getUserProfile();
    setProfile(data);
  }, []);

  const openEditModal = () => {
    setEditName(profile.name);
    setEditRole(profile.role);
    setEditEmail(profile.email);
    setEditTargetStr(profile.monthly_income_target.toString());
    setEditCurrency(profile.currency);
    setEditAvatarUri(profile.avatar_uri || '');
    setEditCycleMode(profile.cycle_mode || 'monthly');
    setEditModalVisible(true);
  };

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
        setEditAvatarUri(pickerResult.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memilih gambar.');
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Perhatian', 'Nama tidak boleh kosong');
      return;
    }

    const cleanTarget = parseInt(editTargetStr.replace(/[^0-9]/g, ''), 10) || 0;

    const updated: UserProfile = {
      name: editName.trim(),
      role: editRole.trim() || 'Pengguna Pribadi',
      email: editEmail.trim() || 'user@rsdvault.app',
      monthly_income_target: cleanTarget,
      currency: editCurrency,
      avatar_uri: editAvatarUri,
      cycle_mode: editCycleMode,
    };

    updateUserProfile(updated);
    setProfile(updated);
    setEditModalVisible(false);
    Alert.alert('Berhasil', 'Profil dan foto berhasil diperbarui.');
  };

  const handleBackup = async () => {
    try {
      const FileSystem = require('expo-file-system/legacy');
      const Sharing = require('expo-sharing');

      const jsonStr = exportAllDataJSON();
      const fileName = `RSDVault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      const fileUri = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Cadangkan Database RSDVault',
        });
      } else {
        Alert.alert('Cadangan Berhasil', `File cadangan tersimpan di: ${fileUri}`);
      }
    } catch (err) {
      console.warn('Backup error:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mencadangkan data.');
    }
  };

  const handleRestore = async () => {
    try {
      const DocumentPicker = require('expo-document-picker');
      const FileSystem = require('expo-file-system/legacy');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(selectedUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const success = importAllDataJSON(fileContent);
      if (success) {
        setProfile(getUserProfile());
        Alert.alert('Sukses', 'Data keuangan dan profil berhasil dipulihkan dari cadangan.');
      } else {
        Alert.alert('Format Tidak Valid', 'File yang dipilih bukan cadangan resmi RSDVault.');
      }
    } catch (err) {
      console.warn('Restore error:', err);
      Alert.alert('Gagal', 'Gagal memulihkan file cadangan.');
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Profil Sticky / Posisi Tetap */}
      <View style={styles.fixedHeader}>
        <Text style={styles.greetingSub}>Pengaturan Akun</Text>
        <Text style={styles.headerTitle}>Profil & Preferensi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card Modern Profesional */}
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.profileCard}
        >
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.8}
            onPress={openEditModal}
          >
            {profile.avatar_uri ? (
              <Image
                source={{ uri: profile.avatar_uri }}
                style={styles.avatarPhoto}
              />
            ) : (
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.avatarLogo}
                resizeMode="contain"
              />
            )}
            <View style={styles.cameraBadge}>
              <Camera size={11} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {profile.name}
              </Text>
            </View>

            <View style={styles.roleTag}>
              <Briefcase size={12} color="#1D4ED8" />
              <Text style={styles.roleText} numberOfLines={1}>
                {profile.role}
              </Text>
            </View>

            <View style={styles.emailTag}>
              <Mail size={12} color="#64748B" />
              <Text style={styles.emailText} numberOfLines={1}>
                {profile.email}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editIconBtn}
            activeOpacity={0.8}
            onPress={openEditModal}
          >
            <Edit3 size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </MotiView>

        {/* Target Finansial Ringkas */}
        <View style={styles.targetBanner}>
          <View style={styles.targetIconCircle}>
            <Target size={18} color="#1D4ED8" />
          </View>
          <View style={styles.targetInfo}>
            <Text style={styles.targetLabel}>
              {profile.cycle_mode === 'weekly' ? 'Target Uang Saku Mingguan' : 'Target Pendapatan Bulanan'}
            </Text>
            <Text style={styles.targetValue}>
              Rp {profile.monthly_income_target.toLocaleString('id-ID')}
            </Text>
          </View>
          <TouchableOpacity onPress={openEditModal}>
            <Text style={styles.targetEditAction}>Ubah</Text>
          </TouchableOpacity>
        </View>

        {/* Preferensi Umum */}
        <Text style={styles.sectionTitle}>Preferensi Umum</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
            <View style={styles.menuLeft}>
              <Target size={18} color="#1D4ED8" />
              <View>
                <Text style={styles.menuLabel}>Siklus Keuangan</Text>
                <Text style={styles.menuDesc}>
                  {profile.cycle_mode === 'weekly' ? 'Mingguan (Mahasiswa / Uang Saku)' : 'Bulanan (Karyawan / Gaji)'}
                </Text>
              </View>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>
                {profile.cycle_mode === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </Text>
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
            <View style={styles.menuLeft}>
              <Coins size={18} color="#D97706" />
              <Text style={styles.menuLabel}>Mata Uang</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>{profile.currency}</Text>
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Tema Tampilan', 'Aplikasi saat ini menggunakan tema Light Modern (RSDVault Royal Blue).')}
          >
            <View style={styles.menuLeft}>
              <Palette size={18} color="#2563EB" />
              <Text style={styles.menuLabel}>Tema Tampilan</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>Light Modern (RSDVault)</Text>
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Keamanan */}
        <Text style={styles.sectionTitle}>Keamanan</Text>
        <View style={styles.menuGroup}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Shield size={18} color="#1D4ED8" />
              <View>
                <Text style={styles.menuLabel}>Kunci Biometrik / PIN</Text>
                <Text style={styles.menuDesc}>Amankan data saat buka aplikasi</Text>
              </View>
            </View>
            <Switch
              value={isBioActive}
              onValueChange={(val) => {
                setIsBioActive(val);
                Alert.alert('Keamanan', val ? 'Kunci Biometrik / PIN diaktifkan.' : 'Kunci Biometrik dinonaktifkan.');
              }}
              trackColor={{ false: '#CBD5E1', true: '#1D4ED8' }}
              thumbColor={isBioActive ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Cadangan & Pulihkan */}
        <Text style={styles.sectionTitle}>Backup & Restore</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={handleBackup}>
            <View style={styles.menuLeft}>
              <HardDriveDownload size={18} color="#1D4ED8" />
              <View>
                <Text style={styles.menuLabel}>Cadangkan Data</Text>
                <Text style={styles.menuDesc}>Ekspor database lokal ke file JSON</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleRestore}>
            <View style={styles.menuLeft}>
              <HardDriveUpload size={18} color="#2563EB" />
              <View>
                <Text style={styles.menuLabel}>Pulihkan Data</Text>
                <Text style={styles.menuDesc}>Impor riwayat transaksi dari cadangan</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>



        {/* Footer RSDVault Branding */}
        <View style={styles.appVersionBox}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.appVersionText}>RSDVault</Text>
          <Text style={styles.appSubText}>PERSONAL FINANCE MANAGEMENT • v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Modal Edit Profil Lengkap dengan Upload Foto */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Edit Profil Pengguna</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {/* Upload Foto Preview & Button */}
              <View style={styles.photoUploadSection}>
                <View style={styles.photoPreviewWrap}>
                  {editAvatarUri ? (
                    <Image source={{ uri: editAvatarUri }} style={styles.photoPreview} />
                  ) : (
                    <Image
                      source={require('../../../assets/icon.png')}
                      style={styles.photoPreview}
                      resizeMode="contain"
                    />
                  )}
                </View>

                <TouchableOpacity style={styles.pickPhotoBtn} onPress={handlePickImage}>
                  <Camera size={16} color="#1D4ED8" />
                  <Text style={styles.pickPhotoBtnText}>Pilih Foto dari Galeri</Text>
                </TouchableOpacity>

                {editAvatarUri ? (
                  <TouchableOpacity onPress={() => setEditAvatarUri('')}>
                    <Text style={styles.removePhotoText}>Hapus Foto Kustom</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Nama Lengkap */}
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama Anda..."
                placeholderTextColor="#94A3B8"
                value={editName}
                onChangeText={setEditName}
              />

              {/* Email */}
              <Text style={styles.inputLabel}>Alamat Email</Text>
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={editEmail}
                onChangeText={setEditEmail}
              />

              {/* Role / Profesi */}
              <Text style={styles.inputLabel}>Peran / Profesi</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Software Engineer, Pebisnis"
                placeholderTextColor="#94A3B8"
                value={editRole}
                onChangeText={setEditRole}
              />

              {/* Pilihan Cepat Role */}
              <View style={styles.roleChipsWrap}>
                {ROLES_LIST.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleChip,
                      editRole === r && styles.roleChipActive,
                    ]}
                    onPress={() => setEditRole(r)}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        editRole === r && styles.roleChipTextActive,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Siklus Keuangan */}
              <Text style={styles.inputLabel}>Siklus Keuangan</Text>
              <View style={styles.currencyRow}>
                <TouchableOpacity
                  style={[
                    styles.currencyPill,
                    editCycleMode === 'weekly' && styles.currencyPillActive,
                  ]}
                  onPress={() => setEditCycleMode('weekly')}
                >
                  <Text
                    style={[
                      styles.currencyPillText,
                      editCycleMode === 'weekly' && styles.currencyPillTextActive,
                    ]}
                  >
                    Mingguan (Uang Saku)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.currencyPill,
                    editCycleMode === 'monthly' && styles.currencyPillActive,
                  ]}
                  onPress={() => setEditCycleMode('monthly')}
                >
                  <Text
                    style={[
                      styles.currencyPillText,
                      editCycleMode === 'monthly' && styles.currencyPillTextActive,
                    ]}
                  >
                    Bulanan (Gaji)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Target Finansial */}
              <Text style={styles.inputLabel}>
                {editCycleMode === 'weekly' ? 'Target Uang Saku Mingguan (Rp)' : 'Target Pendapatan Bulanan (Rp)'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={editCycleMode === 'weekly' ? 'Contoh: 500000' : 'Contoh: 15000000'}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={editTargetStr}
                onChangeText={setEditTargetStr}
              />

              {/* Mata Uang */}
              <Text style={styles.inputLabel}>Mata Uang Utama</Text>
              <View style={styles.currencyRow}>
                {['IDR (Rp)', 'USD ($)', 'EUR (€)', 'SGD (S$)'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.currencyPill,
                      editCurrency === c && styles.currencyPillActive,
                    ]}
                    onPress={() => setEditCurrency(c)}
                  >
                    <Text
                      style={[
                        styles.currencyPillText,
                        editCurrency === c && styles.currencyPillTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  header: {
    marginBottom: 16,
  },
  greetingSub: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 22,
    color: '#0F172A',
    marginTop: 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarLogo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarPhoto: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1D4ED8',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontFamily: 'Onest_700Bold',
    fontSize: 17,
    color: '#0F172A',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  roleText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#1D4ED8',
  },
  emailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  emailText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 20,
    gap: 12,
  },
  targetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetInfo: {
    flex: 1,
  },
  targetLabel: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  targetValue: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#1D4ED8',
    marginTop: 2,
  },
  targetEditAction: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 12,
    color: '#1D4ED8',
  },
  sectionTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 4,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuLabel: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  menuDesc: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 8,
  },
  resetButtonText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  appVersionBox: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 10,
  },
  footerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginBottom: 6,
  },
  appVersionText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  appSubText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  photoUploadSection: {
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  photoPreviewWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1D4ED8',
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  pickPhotoBtnText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 12,
    color: '#1D4ED8',
  },
  removePhotoText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    color: '#EF4444',
  },
  inputLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    fontFamily: 'Onest_400Regular',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  roleChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  roleChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleChipActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
  },
  roleChipText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#475569',
  },
  roleChipTextActive: {
    fontFamily: 'Onest_600SemiBold',
    color: '#FFFFFF',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  currencyPill: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currencyPillActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
  },
  currencyPillText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  currencyPillTextActive: {
    fontFamily: 'Onest_600SemiBold',
    color: '#FFFFFF',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  saveBtnText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
