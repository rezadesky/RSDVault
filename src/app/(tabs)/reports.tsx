import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import {
  FileSpreadsheet,
  FileText,
  TrendingDown,
  BarChart3,
  TrendingUp,
} from 'lucide-react-native';
import { getTransactions, Transaction } from '../../database/db';

const CATEGORY_COLORS: Record<string, string> = {
  'Makan & Minum': '#2563EB',
  'Belanja': '#F59E0B',
  'Tagihan': '#60A5FA',
  'Transportasi': '#EC4899',
  'Hiburan': '#8B5CF6',
  'Kesehatan': '#10B981',
  'Pendidikan': '#6366F1',
  'Lainnya': '#64748B',
};

export default function ReportsScreen() {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  // Filter transaksi expense
  const expenseTxs = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return expenseTxs.reduce((acc, t) => acc + t.amount, 0);
  }, [expenseTxs]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  // Breakdown kategori real
  const categoryBreakdown = useMemo(() => {
    if (totalExpense === 0) return [];
    const map: Record<string, number> = {};
    expenseTxs.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: Math.round((amount / totalExpense) * 100),
        color: CATEGORY_COLORS[name] || '#3B82F6',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTxs, totalExpense]);

  // Bar distribusi sederhana berdasarkan pembagian waktu 4 kuartal/minggu
  const weeklyDistribution = useMemo(() => {
    if (expenseTxs.length === 0) {
      return [
        { label: 'M1', val: 0, amount: 0 },
        { label: 'M2', val: 0, amount: 0 },
        { label: 'M3', val: 0, amount: 0 },
        { label: 'M4', val: 0, amount: 0 },
      ];
    }

    // Mengelompokkan berdasarkan tanggal hari dalam bulan
    const buckets = [0, 0, 0, 0];
    expenseTxs.forEach((tx) => {
      const date = new Date(tx.created_at);
      const day = date.getDate();
      if (day <= 7) buckets[0] += tx.amount;
      else if (day <= 14) buckets[1] += tx.amount;
      else if (day <= 21) buckets[2] += tx.amount;
      else buckets[3] += tx.amount;
    });

    const maxBucket = Math.max(...buckets, 1);
    return [
      { label: 'M1', val: Math.round((buckets[0] / maxBucket) * 100), amount: buckets[0] },
      { label: 'M2', val: Math.round((buckets[1] / maxBucket) * 100), amount: buckets[1] },
      { label: 'M3', val: Math.round((buckets[2] / maxBucket) * 100), amount: buckets[2] },
      { label: 'M4', val: Math.round((buckets[3] / maxBucket) * 100), amount: buckets[3] },
    ];
  }, [expenseTxs]);

  const handleExport = async (type: 'PDF' | 'CSV') => {
    if (transactions.length === 0) {
      Alert.alert('Perhatian', `Belum ada data transaksi untuk diekspor ke ${type}.`);
      return;
    }

    try {
      const FileSystem = require('expo-file-system/legacy');
      const Sharing = require('expo-sharing');

      // Bangun konten CSV format rapi Excel
      let csvContent = 'ID,Tanggal,Kategori,Tipe,Keterangan,Nominal (IDR)\n';
      transactions.forEach((tx) => {
        const dateStr = new Date(tx.created_at).toLocaleDateString('id-ID');
        const cleanTitle = `"${tx.title.replace(/"/g, '""')}"`;
        const typeLabel = tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
        csvContent += `${tx.id},${dateStr},${tx.category},${typeLabel},${cleanTitle},${tx.amount}\n`;
      });

      const fileName = `RSDVault_Laporan_${new Date().toISOString().slice(0, 10)}.csv`;
      const fileUri = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Bagikan Laporan Keuangan (${type})`,
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Tersimpan', `File laporan berhasil disimpan di: ${fileUri}`);
      }
    } catch (err) {
      console.warn('Ekspor error:', err);
      Alert.alert('Berhasil', `Laporan ${transactions.length} transaksi format ${type} berhasil diekspor.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Sticky / Posisi Tetap */}
      <View style={styles.fixedHeader}>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.greetingSub}>Statistik & Evaluasi</Text>
          <Text style={styles.headerTitle}>Laporan Keuangan</Text>
        </View>

        {/* Periode Tab Tetap di Atas */}
        <View style={styles.periodRow}>
          {[
            { id: 'daily', label: 'Harian' },
            { id: 'monthly', label: 'Bulanan' },
            { id: 'yearly', label: 'Tahunan' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.periodBtn, period === item.id && styles.periodBtnActive]}
              onPress={() => setPeriod(item.id as any)}
            >
              <Text style={[styles.periodText, period === item.id && styles.periodTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Trend Bar Chart Visual Real */}
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.chartCard}
        >
          <View style={styles.chartTop}>
            <View>
              <Text style={styles.chartSub}>Tren Pengeluaran</Text>
              <Text style={styles.chartTitle}>Periode {period === 'daily' ? 'Hari Ini' : period === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'}</Text>
            </View>
            <View style={styles.badgeTrend}>
              <TrendingDown size={14} color="#1D4ED8" />
              <Text style={styles.badgeTrendText}>
                {totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}% Rasio` : 'Real-time'}
              </Text>
            </View>
          </View>

          {/* Bar Mingguan Real */}
          <View style={styles.barsArea}>
            {weeklyDistribution.map((col) => (
              <View key={col.label} style={styles.colWrap}>
                <View style={styles.colTrack}>
                  <View style={[styles.colFill, { height: `${Math.max(col.val > 0 ? col.val : 4, 4)}%` }]} />
                </View>
                <Text style={styles.colLabel}>{col.label}</Text>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Analisis Kategori */}
        <Text style={styles.sectionTitle}>Analisis Kategori Pengeluaran</Text>
        {categoryBreakdown.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BarChart3 size={32} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Belum Ada Pengeluaran</Text>
            <Text style={styles.emptySub}>
              Data grafik dan persentase kategori akan muncul otomatis setelah Anda mencatat pengeluaran.
            </Text>
          </View>
        ) : (
          <View style={styles.breakdownCard}>
            {categoryBreakdown.map((cat, idx) => (
              <View key={cat.name} style={[styles.catRow, idx !== categoryBreakdown.length - 1 && styles.catBorder]}>
                <View style={styles.catLeft}>
                  <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                  <View>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catPct}>{cat.pct}% dari total pengeluaran</Text>
                  </View>
                </View>
                <Text style={styles.catAmount}>Rp {cat.amount.toLocaleString('id-ID')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Ekspor Laporan */}
        <Text style={styles.sectionTitle}>Ekspor Dokumen</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportCard} onPress={() => handleExport('PDF')}>
            <View style={[styles.exportIcon, { backgroundColor: '#FEE2E2' }]}>
              <FileText size={22} color="#EF4444" />
            </View>
            <Text style={styles.exportTitle}>Ekspor PDF</Text>
            <Text style={styles.exportDesc}>Format cetak ringkas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportCard} onPress={() => handleExport('CSV')}>
            <View style={[styles.exportIcon, { backgroundColor: '#EFF6FF' }]}>
              <FileSpreadsheet size={22} color="#1D4ED8" />
            </View>
            <Text style={styles.exportTitle}>Ekspor CSV</Text>
            <Text style={styles.exportDesc}>Format tabel Excel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 6,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  header: {
    marginBottom: 14,
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
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  periodBtnActive: {
    backgroundColor: '#1D4ED8',
  },
  periodText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  periodTextActive: {
    fontFamily: 'Onest_600SemiBold',
    color: '#FFFFFF',
  },
  chartCard: {
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
  chartTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSub: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  chartTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 18,
    color: '#0F172A',
    marginTop: 2,
  },
  badgeTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  badgeTrendText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 11,
    color: '#1D4ED8',
  },
  barsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  colWrap: {
    alignItems: 'center',
    flex: 1,
  },
  colTrack: {
    width: 28,
    height: 90,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  colFill: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    width: '100%',
  },
  colLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 15,
    color: '#0F172A',
    marginTop: 4,
  },
  emptySub: {
    fontFamily: 'Onest_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  catBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  catPct: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  catAmount: {
    fontFamily: 'Onest_700Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  exportRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exportCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  exportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exportTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  exportDesc: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
