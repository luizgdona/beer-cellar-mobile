import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useBeerStore } from '../stores/beerStore';
import { useAppTheme } from '../theme/useAppTheme';
import { useLanguage } from '../contexts/LanguageContext';

export default function BeerListScreen({ navigation }: any) {
  const theme = useAppTheme();
  const { t } = useLanguage();
  const { beers, fetchBeers, isLoading } = useBeerStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'consumed'>('all');
  const styles = createStyles(theme);

  useEffect(() => {
    fetchBeers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBeers({
      search: searchTerm,
      status: filterStatus !== 'all' ? filterStatus : undefined,
    });
    setRefreshing(false);
  };

  const filteredBeers = beers.filter((beer: any) => {
    let match = true;

    if (searchTerm) {
      match = match && (beer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beer.brewery.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filterStatus === 'consumed') match = match && beer.consumed;
    if (filterStatus === 'available') match = match && !beer.consumed;

    return match;
  });

  const renderBeerItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.beerCard}
      onPress={() => navigation.navigate('BeerDetail', { beerId: item.id })}
    >
      <View style={styles.beerHeader}>
        <View>
          <Text style={styles.beerName}>{item.name}</Text>
          <Text style={styles.brewery}>{item.brewery}</Text>
        </View>
        <View
          style={[styles.statusBadge, item.consumed && styles.statusConsumed]}
        >
          <Text style={[styles.statusText, item.consumed && styles.statusTextConsumed]}>{item.consumed ? t('beers.consumed') : t('beers.available')}</Text>
        </View>
      </View>

      <View style={styles.beerDetails}>
        {item.style && <Text style={styles.detail}>{item.style}</Text>}
        {item.abv && <Text style={styles.detail}>ABV: {item.abv}%</Text>}
        {item.rating && <Text style={styles.detail}>{'⭐'.repeat(Math.round(item.rating))}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{t('beers.title')}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('beers.searchPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <View style={styles.filterButtons}>
          {['all', 'available', 'consumed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(status as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.filterButtonTextActive,
                ]}
              >
                {status === 'all' ? t('beers.all') : status === 'available' ? t('beers.available') : t('beers.consumed')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredBeers}
        renderItem={renderBeerItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{t('beers.noneFound')}</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    filterSection: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 15,
      paddingVertical: 14,
      marginBottom: 8,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 10,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
    },
    filterButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 11,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
    filterButtonTextActive: {
      color: '#fff',
      fontWeight: '700',
    },
    listContent: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    beerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      marginBottom: 12,
    },
    beerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    beerName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    brewery: {
      fontSize: 14,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    statusBadge: {
      backgroundColor: theme.colors.warningBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusConsumed: {
      backgroundColor: theme.colors.consumedBg,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.warningText,
    },
    statusTextConsumed: {
      color: theme.colors.consumedText,
    },
    beerDetails: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
    },
    detail: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.textMuted,
    },
  });
