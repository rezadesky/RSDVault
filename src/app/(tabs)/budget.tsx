import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { PieChart, Plus, AlertCircle, CheckCircle2, X, Trash2, Wallet } from 'lucide-react-native';
import {
  getBudgets,
  upsertBudget,
  deleteBudget,
  getTransactions,
  getUserProfile,
  updateUserProfile,
  Budget,
  Transaction,
} from '../../database/db';

const SUGGESTED_CATEGORIES = [
  'Makan & Minum',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
];

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [cycleMode, setCycleMode] = useState<'weekly' | 'monthly'>('weekly');
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('Makan & Minum');
  const [newLimit, setNewLimit] = useState('');
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});

  const handleLimitChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    if (!raw) {
      setNewLimit('');
      return;
    }
    const num = parseInt(raw, 10);
    setNewLimit(num.toLocaleString('id-ID'));
  };

  const loadData = () => {
    const profile = getUserProfile();
    if (profile.cycle_mode) {
      setCycleMode(profile.cycle_mode);
    }

    const budgetList = getBudgets();
    setBudgets(budgetList);

    // Hitung pengeluaran real dari transaksi sesuai cycleMode
    const txs = getTransactions();
    const map: Record<string, number> = {};

    const now = new Date();
    // Awal minggu (Senin)
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Awal bulan
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeCycle = profile.cycle_mode || cycleMode;
    const thresholdDate = activeCycle === 'weekly' ? startOfWeek : startOfMonth;

    txs.forEach((tx) => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.created_at);
        if (txDate >= thresholdDate) {
          map[tx.category] = (map[tx.category] || 0) + tx.amount;
        }
      }
    });
    setSpentMap(map);
  };

  useEffect(() => {
    loadData();
  }, [cycleMode]);

  const handleToggleCycle = (mode: 'weekly' | 'monthly') => {
    setCycleMode(mode);
    const profile = getUserProfile();
    updateUserProfile({ ...profile, cycle_mode: mode });
  };

  const totalLimit = useMemo(() => budgets.reduce((acc, b) => acc + b.limit_amount, 0), [budgets]);
  const totalSpent = useMemo(() => {
    return budgets.reduce((acc, b) => acc + (spentMap[b.category] || 0), 0);
  }, [budgets, spentMap]);

  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const handleAddBudget = () => {
    const lim = parseInt(newLimit.replace(/[^0-9]/g, ''), 10);
    if (!newCategory.trim()) {
      Alert.alert('Perhatian', 'Pilih atau masukkan nama kategori.');
      return;
    }
    if (isNaN(lim) || lim <= 0) {
      Alert.alert('Perhatian', 'Batas anggaran harus lebih dari 0.');
      return;
    }

    upsertBudget(newCategory.trim(), lim);
    setNewLimit('');
    setModalVisible(false);
    loadData();
    Alert.alert('Berhasil', `Anggaran ${newCategory} berhasil disimpan.`);
  };

  const handleDeleteBudget = (id: number, catName: string) => {
    Alert.alert('Hapus Anggaran', `Hapus batasan anggaran untuk "${catName}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteBudget(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Sticky / Posisi Tetap */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greetingSub}>Perencanaan Keuangan</Text>
            <Text style={styles.headerTitle}>
              {cycleMode === 'weekly' ? 'Anggaran Mingguan' : 'Anggaran Bulanan'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => {
              setNewCategory('Makan & Minum');
              setNewLimit('');
              setModalVisible(true);
            }}
          >
            <Plus size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Atur</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Siklus Keuangan: Mingguan vs Bulanan */}
        <View style={styles.cycleToggleContainer}>
          <TouchableOpacity
            style={[
              styles.cycleTab,
              cycleMode === 'weekly' && styles.cycleTabActive,
            ]}
            onPress={() => handleToggleCycle('weekly')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cycleTabText,
                cycleMode === 'weekly' && styles.cycleTabTextActive,
              ]}
            >
              Mingguan (Uang Saku)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cycleTab,
              cycleMode === 'monthly' && styles.cycleTabActive,
            ]}
            onPress={() => handleToggleCycle('monthly')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cycleTabText,
                cycleMode === 'monthly' && styles.cycleTabTextActive,
              ]}
            >
              Bulanan (Gaji)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ringkasan Anggaran Utama */}
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.cardHeader}>
            <PieChart size={18} color="#1D4ED8" />
            <Text style={styles.cardHeaderTitle}>
              {cycleMode === 'weekly' ? 'Sisa Anggaran Minggu Ini' : 'Sisa Anggaran Bulan Ini'}
            </Text>
          </View>

          <Text style={styles.remainingAmount}>
            Rp {totalRemaining.toLocaleString('id-ID')}
          </Text>

          {/* Progress Bar Utama */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, overallPercentage)}%`,
                    backgroundColor: overallPercentage > 90 ? '#EF4444' : '#1D4ED8',
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                Terpakai: Rp {totalSpent.toLocaleString('id-ID')}
              </Text>
              <Text style={[styles.progressText, { color: overallPercentage > 90 ? '#EF4444' : '#64748B' }]}>
                {overallPercentage}%
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Batas Per Kategori */}
        <View style={styles.categoryTitleRow}>
          <Text style={styles.sectionTitle}>Batas Per Kategori</Text>
          <Text style={styles.catCountBadge}>{budgets.length} Kategori</Text>
        </View>

        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Wallet size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Anggaran</Text>
            <Text style={styles.emptySub}>
              Tekan tombol "+ Atur" di atas untuk menetapkan batas anggaran {cycleMode === 'weekly' ? 'mingguan' : 'bulanan'} Anda.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.emptyActionText}>Tambah Anggaran Baru</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgets.map((item, index) => {
            const spent = spentMap[item.category] || 0;
            const itemPct = item.limit_amount > 0 ? Math.round((spent / item.limit_amount) * 100) : 0;
            const isOver = spent >= item.limit_amount;
            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50 }}
                style={styles.categoryCard}
              >
                <View style={styles.catHeader}>
                  <Text style={styles.catName}>{item.category}</Text>
                  <View style={styles.badgeWrap}>
                    {isOver ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                        <AlertCircle size={12} color="#EF4444" />
                        <Text style={[styles.statusText, { color: '#DC2626' }]}>Habis</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF' }]}>
                        <CheckCircle2 size={12} color="#2563EB" />
                        <Text style={[styles.statusText, { color: '#1D4ED8' }]}>Aman</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteBudget(item.id, item.category)}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={15} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.spentLabel}>
                    Rp {spent.toLocaleString('id-ID')}
                    <Text style={styles.limitLabel}> / Rp {item.limit_amount.toLocaleString('id-ID')}</Text>
                  </Text>
                  <Text style={styles.pctText}>{itemPct}%</Text>
                </View>

                <View style={styles.catBarBg}>
                  <View
                    style={[
                      styles.catBarFill,
                      {
                        width: `${Math.min(100, itemPct)}%`,
                        backgroundColor: isOver ? '#EF4444' : itemPct > 75 ? '#F59E0B' : '#1D4ED8',
                      },
                    ]}
                  />
                </View>
              </MotiView>
            );
          })
        )}
      </ScrollView>

      {/* Modal Tambah/Atur Anggaran */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Atur Batas Anggaran</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Pilih Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catSelectRow}>
              {SUGGESTED_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, newCategory === cat && styles.catChipActive]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.catChipText, newCategory === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Batas Maksimal Bulanan (Rp)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 1.500.000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={newLimit}
              onChangeText={handleLimitChange}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddBudget}>
              <Text style={styles.saveBtnText}>Simpan Anggaran</Text>
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
    paddingBottom: 24,
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cycleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
  },
  cycleTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  cycleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cycleTabText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  cycleTabTextActive: {
    fontFamily: 'Onest_700Bold',
    color: '#1D4ED8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  addBtnText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  remainingAmount: {
    fontFamily: 'Onest_800ExtraBold',
    fontSize: 26,
    color: '#0F172A',
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  catCountBadge: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: 'Onest_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  emptyActionText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catName: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 15,
    color: '#0F172A',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 11,
  },
  deleteBtn: {
    padding: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  spentLabel: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  limitLabel: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  pctText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  catBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
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
  inputLabel: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#334155',
    marginBottom: 8,
  },
  catSelectRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#1D4ED8',
  },
  catChipText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Onest_600SemiBold',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Onest_500Medium',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
