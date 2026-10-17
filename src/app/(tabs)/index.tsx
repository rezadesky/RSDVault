import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import {
  Eye,
  EyeOff,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Plus,
} from 'lucide-react-native';
import {
  initDatabase,
  getTransactions,
  insertTransaction,
  getUserProfile,
  Transaction,
  UserProfile,
} from '../../database/db';

const CATEGORIES = ['Makan & Minum', 'Transportasi', 'Belanja', 'Gaji', 'Tagihan', 'Lainnya'];

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Pengguna RSDVault',
    role: 'Personal (Pengguna Pribadi)',
    email: 'pengguna@rsdvault.app',
    monthly_income_target: 10000000,
    currency: 'IDR (Rp)',
    avatar_uri: '',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');

  const loadData = () => {
    setProfile(getUserProfile());
    setTransactions(getTransactions());
  };

  useEffect(() => {
    initDatabase();
    loadData();
  }, []);

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    if (!raw) {
      setAmountStr('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmountStr(num.toLocaleString('id-ID'));
  };

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'income') inc += tx.amount;
      else exp += tx.amount;
    });
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp };
  }, [transactions]);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        map[t.category] = (map[t.category] || 0) + t.amount;
        total += t.amount;
      }
    });

    const colors = ['#2563EB', '#60A5FA', '#F59E0B', '#EC4899', '#10B981', '#94A3B8'];
    return Object.entries(map).map(([name, amount], idx) => ({
      name,
      amount,
      pct: total > 0 ? `${Math.round((amount / total) * 100)}%` : '0%',
      color: colors[idx % colors.length],
    }));
  }, [transactions]);

  const handleSave = () => {
    const cleanAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!title.trim()) {
      Alert.alert('Perhatian', 'Nama transaksi harus diisi');
      return;
    }
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      Alert.alert('Perhatian', 'Nominal harus lebih dari 0');
      return;
    }

    let categoryToSave = category;
    if (category === 'Lainnya' && customCategory.trim()) {
      categoryToSave = customCategory.trim();
    }

    insertTransaction(title.trim(), cleanAmount, type, categoryToSave);
    setTitle('');
    setAmountStr('');
    setCustomCategory('');
    setModalVisible(false);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. Header Profile Bar (Sticky / Posisi Tetap Tidak Ikut Scroll) */}
      <View style={styles.fixedTopBar}>
        <TouchableOpacity
          style={styles.profileLeft}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={styles.logoWrap}>
            {profile.avatar_uri ? (
              <Image
                source={{ uri: profile.avatar_uri }}
                style={styles.logoImage}
              />
            ) : (
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            )}
          </View>
          <View>
            <Text style={styles.greetingText}>Halo, Selamat Datang</Text>
            <Text style={styles.profileNameText}>{profile.name}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterIconButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <SlidersHorizontal size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Month Pill Selector */}
        <TouchableOpacity
          style={styles.monthPill}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/reports')}
        >
          <View style={styles.monthPillLeft}>
            <Calendar size={15} color="#2563EB" />
            <Text style={styles.monthPillText}>Oktober 2026</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        {/* 3. Card Saldo & Arus Kas */}
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Saldo</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {showBalance ? <Eye size={18} color="#DBEAFE" /> : <EyeOff size={18} color="#DBEAFE" />}
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {showBalance ? formatRupiah(balance) : '••••••••••'}
          </Text>

          <View style={styles.cashflowRow}>
            {/* Pemasukan */}
            <View style={styles.cashflowItem}>
              <View style={styles.cashflowTitleRow}>
                <View style={[styles.dotIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <ArrowDownLeft size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.cashflowLabel}>Pemasukan</Text>
              </View>
              <Text style={styles.cashflowValue}>
                {formatRupiah(totalIncome)}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            {/* Pengeluaran */}
            <View style={styles.cashflowItem}>
              <View style={styles.cashflowTitleRow}>
                <View style={[styles.dotIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <ArrowUpRight size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.cashflowLabel}>Pengeluaran</Text>
              </View>
              <Text style={styles.cashflowValue}>
                {formatRupiah(totalExpense)}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* 4. Ringkasan Pengeluaran (Dihitung Real-time dari Transaksi) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ringkasan Pengeluaran</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reports')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.breakdownCard}>
          <View style={styles.donutArea}>
            <View style={styles.donutRing}>
              <View style={styles.donutInnerCircle}>
                <Text style={styles.donutCenterValue}>{formatRupiah(totalExpense)}</Text>
                <Text style={styles.donutCenterMonth}>Okt 2026</Text>
              </View>
            </View>
          </View>

          <View style={styles.donutLegend}>
            {categoryBreakdown.length === 0 ? (
              <Text style={styles.noBreakdownText}>Belum ada catatan pengeluaran.</Text>
            ) : (
              categoryBreakdown.map((item) => (
                <View key={item.name} style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendColorDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendName}>{item.name}</Text>
                  </View>
                  <Text style={styles.legendPct}>{item.pct}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* 5. Transaksi Terbaru */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum Ada Catatan Transaksi</Text>
            <Text style={styles.emptyText}>
              Tekan tombol (+) di pojok kanan bawah untuk menambah transaksi pertamamu.
            </Text>
          </View>
        ) : (
          transactions.slice(0, 5).map((item, idx) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: idx * 40 }}
              style={styles.txRowCard}
            >
              <View style={[styles.txIconBox, { backgroundColor: item.type === 'income' ? '#EFF6FF' : '#FEF2F2' }]}>
                {item.type === 'income' ? (
                  <ArrowDownLeft size={18} color="#2563EB" />
                ) : (
                  <ArrowUpRight size={18} color="#EF4444" />
                )}
              </View>

              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txSub}>
                  {item.category} •{' '}
                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>

              <Text
                style={[
                  styles.txAmount,
                  { color: item.type === 'income' ? '#2563EB' : '#EF4444' },
                ]}
              >
                {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
              </Text>
            </MotiView>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity
        style={styles.fabBtn}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal Tambah Transaksi */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Transaksi</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonExpenseActive]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                  Pengeluaran
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonIncomeActive]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Jumlah (Rp)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={amountStr}
              onChangeText={handleAmountChange}
            />

            <Text style={styles.inputLabel}>Keterangan</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Makan siang, Kopi"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Kategori</Text>
            <View style={styles.categoryWrap}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {category === 'Lainnya' && (
              <View style={{ marginTop: 8, marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Nama Kategori Kustom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Sedekah, Investasi"
                  placeholderTextColor="#94A3B8"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                />
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
              <Text style={styles.submitButtonText}>Simpan</Text>
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
    paddingTop: 8,
    paddingBottom: 90,
  },
  fixedTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  topProfileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  greetingText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  profileNameText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginTop: 1,
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  monthPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  monthPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthPillText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#1E293B',
  },
  balanceCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    color: '#BFDBFE',
  },
  balanceAmount: {
    fontFamily: 'Onest_800ExtraBold',
    fontSize: 30,
    color: '#FFFFFF',
    marginVertical: 12,
    letterSpacing: -0.6,
  },
  cashflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  cashflowItem: {
    flex: 1,
  },
  cashflowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dotIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashflowLabel: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#DBEAFE',
  },
  cashflowValue: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  seeAllText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 12,
    color: '#2563EB',
  },
  breakdownCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  donutArea: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 10,
    borderColor: '#2563EB',
    borderTopColor: '#60A5FA',
    borderRightColor: '#F59E0B',
    borderBottomColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInnerCircle: {
    alignItems: 'center',
  },
  donutCenterValue: {
    fontFamily: 'Onest_700Bold',
    fontSize: 11,
    color: '#0F172A',
  },
  donutCenterMonth: {
    fontFamily: 'Onest_400Regular',
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  donutLegend: {
    flex: 1,
    gap: 6,
  },
  noBreakdownText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#475569',
  },
  legendPct: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 12,
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  txRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  txSub: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  txAmount: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    maxWidth: 480,
  },
  modalHeader: {
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonExpenseActive: {
    backgroundColor: '#FEE2E2',
  },
  typeButtonIncomeActive: {
    backgroundColor: '#DBEAFE',
  },
  typeButtonText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  typeButtonTextActive: {
    color: '#0F172A',
  },
  inputLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
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
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
  },
  categoryChipText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#475569',
  },
  categoryChipTextActive: {
    fontFamily: 'Onest_600SemiBold',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
