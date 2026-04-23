import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Wine } from 'lucide-react-native';
import Header from '@/components/Header';
import Statistics from '@/components/Statistics';
import BeerCard from '@/components/BeerCard';
import BeerForm from '@/components/BeerForm';
import { useBeerStore } from '@/lib/beerStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

type FilterStatus = 'all' | 'available' | 'consumed';

export default function DashboardScreen() {
  const { beers, stats, fetchBeers, fetchStatistics, isLoading } = useBeerStore();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    const filters: { status?: string; search?: string } = {};
    if (filter !== 'all') filters.status = filter;
    if (search) filters.search = search;
    fetchBeers(filters);
  }, [filter, search, fetchBeers]);

  const filteredBeers = beers.filter((b) => {
    if (filter === 'consumed') return b.consumed;
    if (filter === 'available') return !b.consumed;
    return true;
  });

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: 'all',       label: t('dashboard.filterAll') },
    { key: 'available', label: t('dashboard.filterAvailable') },
    { key: 'consumed',  label: t('dashboard.filterConsumed') },
  ];

  const ListHeader = () => (
    <View style={{ gap: 14, marginBottom: 8 }}>
      <Statistics stats={stats} />

      {/* Title row */}
      <View style={[styles.panelHeader, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.panelLabel, { color: colors.fgMuted }]}>{t('dashboard.inventory')}</Text>
          <Text style={[styles.panelTitle, { color: colors.fg }]}>{t('dashboard.collectionTitle')}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={14} color={colors.fgMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.fg }]}
          placeholder={t('dashboard.searchPlaceholder')}
          placeholderTextColor={colors.fgMuted + '90'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === key ? colors.accent : colors.surface,
                borderColor: filter === key ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setFilter(key)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === key ? colors.accentFg : colors.fgMuted },
            ]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      {isLoading
        ? <ActivityIndicator color={colors.accent} />
        : <>
            <Wine size={40} strokeWidth={1} color={colors.fgMuted} style={{ opacity: 0.3 }} />
            <Text style={[styles.emptyText, { color: colors.fgMuted }]}>{t('dashboard.empty')}</Text>
          </>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['left', 'right']}>
      <Header />

      <FlatList
        data={filteredBeers}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <BeerCard beer={item} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => setShowForm(true)}
        accessibilityLabel={t('dashboard.addBeer')}
      >
        <Plus size={24} color={colors.accentFg} strokeWidth={2.5} />
      </Pressable>

      <BeerForm visible={showForm} onClose={() => setShowForm(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, gap: 12 },
  columnWrapper: { gap: 10 },
  panelHeader: {
    borderRadius: 14, padding: 14,
    borderWidth: 1,
  },
  panelLabel: {
    fontFamily: 'DMSans_700Bold', fontSize: 9,
    letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 2,
  },
  panelTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 14, padding: 0 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: 10, borderWidth: 1,
  },
  filterText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14 },
  fab: {
    position: 'absolute', right: 20, bottom: 28,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
});
