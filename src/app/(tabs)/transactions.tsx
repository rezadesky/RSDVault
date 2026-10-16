import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  X,
  Plus,
} from 'lucide-react-native';
import {
  getTransactions,
  insertTransaction,
  deleteTransaction,
  Transaction,
} from '../../database/db';

const CATEGORIES = ['Semua', 'Makan & Minum', 'Transportasi', 'Belanja', 'Gaji', 'Tagihan', 'Transfer', 'Lainnya'];

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('Makan & Minum');
  const [customCategory, setCustomCategory] = useState('');

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    if (!raw) {
      setAmountStr('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmountStr(num.toLocaleString('id-ID'));
  };

  const loadData = () => {
    setTransactions(getTransactions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = tx.title.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedFilter === 'all' ? true : tx.type === selectedFilter;
      const matchCategory = selectedCategory === 'Semua' ? true : tx.category === selectedCategory;
      return matchSearch && matchType && matchCategory;
    });
  }, [transactions, search, selectedFilter, selectedCategory]);

  const handleSave = () => {
    const cleanAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!title.trim()) {
      Alert.alert('Perhatian', 'Keterangan harus diisi');
      return;
    }
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      Alert.alert('Perhatian', 'Nominal harus lebih dari 0');
      return;
    }

    const typeToSave = modalType === 'transfer' ? 'expense' : modalType;
    let categoryToSave = modalType === 'transfer' ? 'Transfer' : category;
    if (modalType !== 'transfer' && category === 'Lainnya' && customCategory.trim()) {
      categoryToSave = customCategory.trim();
    }

    insertTransaction(title.trim(), cleanAmount, typeToSave, categoryToSave);
    setTitle('');
    setAmountStr('');
    setCustomCategory('');
    setModalVisible(false);
    loadData();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Hapus Transaksi', 'Yakin ingin menghapus catatan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header & Quick Action Buttons */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaksi</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={() => {
              setModalType('expense');
              setCategory('Makan & Minum');
              setModalVisible(true);
            }}
          >
            <ArrowUpRight size={14} color="#EF4444" />
            <Text style={[styles.quickBtnText, { color: '#DC2626' }]}>Pengeluaran</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#EFF6FF' }]}
            onPress={() => {
              setModalType('income');
              setCategory('Gaji');
              setModalVisible(true);
            }}
          >
            <ArrowDownLeft size={14} color="#2563EB" />
            <Text style={[styles.quickBtnText, { color: '#1D4ED8' }]}>Pemasukan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#F1F5F9' }]}
            onPress={() => {
              setModalType('transfer');
              setCategory('Transfer');
              setModalVisible(true);
            }}
          >
            <ArrowLeftRight size={14} color="#0F172A" />
            <Text style={[styles.quickBtnText, { color: '#0F172A' }]}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pencarian */}
      <View style={styles.searchBar}>
        <Search size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari transaksi atau kategori..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'expense', 'income'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tabItem, selectedFilter === item && styles.tabItemActive]}
            onPress={() => setSelectedFilter(item)}
          >
            <Text
              style={[
                styles.tabItemText,
                selectedFilter === item && styles.tabItemTextActive,
              ]}
            >
              {item === 'all' ? 'Semua' : item === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Kategori Horizontal */}
      <View style={styles.categoryScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.catPill,
                selectedCategory === item && styles.catPillActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.catPillText,
                  selectedCategory === item && styles.catPillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Daftar Transaksi */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Tidak ada transaksi yang cocok</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.txCard}
          >
            <View style={[styles.txIconBox, { backgroundColor: item.type === 'income' ? '#EFF6FF' : '#FEF2F2' }]}>
              {item.category === 'Transfer' ? (
                <ArrowLeftRight size={18} color="#2563EB" />
              ) : item.type === 'income' ? (
                <ArrowDownLeft size={18} color="#2563EB" />
              ) : (
                <ArrowUpRight size={18} color="#EF4444" />
              )}
            </View>

            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txCategory}>
                {item.category} •{' '}
                {new Date(item.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>

            <View style={styles.txRight}>
              <Text
                style={[
                  styles.txAmount,
                  { color: item.type === 'income' ? '#2563EB' : '#EF4444' },
                ]}
              >
                {item.type === 'income' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={15} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </MotiView>
        )}
      />

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
              <Text style={styles.modalTitle}>
                Tambah {modalType === 'expense' ? 'Pengeluaran' : modalType === 'income' ? 'Pemasukan' : 'Transfer'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nominal (Rp)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 150.000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={amountStr}
              onChangeText={handleAmountChange}
            />

            <Text style={styles.inputLabel}>Keterangan</Text>
            <TextInput
              style={styles.input}
              placeholder="Keterangan transaksi..."
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            {modalType !== 'transfer' && (
              <>
                <Text style={styles.inputLabel}>Kategori</Text>
                <View style={styles.catGrid}>
                  {CATEGORIES.filter((c) => c !== 'Semua' && c !== 'Transfer').map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catGridItem, category === cat && styles.catGridItemActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catGridText,
                          category === cat && styles.catGridTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {category === 'Lainnya' && (
                  <View style={{ marginTop: 10, marginBottom: 14 }}>
                    <Text style={styles.inputLabel}>Tulis Nama Kategori Kustom</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Contoh: Sedekah, Hiburan, Investasi"
                      placeholderTextColor="#94A3B8"
                      value={customCategory}
                      onChangeText={setCustomCategory}
                    />
                  </View>
                )}
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Simpan</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 14,
    gap: 4,
  },
  quickBtnText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Onest_400Regular',
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 10,
    marginLeft: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabItemText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  tabItemTextActive: {
    fontFamily: 'Onest_600SemiBold',
    color: '#1D4ED8',
  },
  categoryScroll: {
    marginTop: 12,
    paddingLeft: 20,
    marginBottom: 6,
  },
  catPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
  },
  catPillText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  catPillTextActive: {
    fontFamily: 'Onest_600SemiBold',
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  txCard: {
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
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  txCategory: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 17,
    color: '#0F172A',
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
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 18,
  },
  catGridItem: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catGridItemActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
  },
  catGridText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#475569',
  },
  catGridTextActive: {
    fontFamily: 'Onest_600SemiBold',
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
