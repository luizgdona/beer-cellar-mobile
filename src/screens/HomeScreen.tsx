import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useBeerStore } from '../stores/beerStore';
import { useAppTheme } from '../theme/useAppTheme';
import { useLanguage } from '../contexts/LanguageContext';

export default function HomeScreen() {
  const theme = useAppTheme();
  const { t } = useLanguage();
  const { beers, fetchBeers } = useBeerStore();
  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(theme);

  useEffect(() => {
    fetchBeers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBeers();
    setRefreshing(false);
  };

  const totalBeers = beers.length;
  const consumedBeers = beers.filter((b) => b.consumed).length;
  const availableBeers = beers.filter((b) => !b.consumed).length;
  const ratedBeers = beers.filter((b) => b.rating);
  const averageRating =
    ratedBeers.length > 0
      ? beers.reduce((sum, b) => sum + (b.rating ?? 0), 0) / ratedBeers.length
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <Text style={styles.badge}>{t('home.badge')}</Text>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('home.total')}</Text>
          <Text style={styles.statValue}>{totalBeers}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('home.available')}</Text>
          <Text style={styles.statValue}>{availableBeers}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('home.consumed')}</Text>
          <Text style={styles.statValue}>{consumedBeers}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('home.avgRating')}</Text>
          <Text style={styles.statValue}>{averageRating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.health')}</Text>
        <View style={styles.healthCard}>
          <Text style={styles.statItemLabel}>{t('home.progress')}</Text>
          <Text style={styles.statItemValue}>{Math.round((consumedBeers / totalBeers) * 100) || 0}%</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round((consumedBeers / totalBeers) * 100) || 0}%` }]} />
          </View>
          <Text style={styles.helperText}>{availableBeers} {t('home.remaining')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingBottom: 28,
    },
    hero: {
      backgroundColor: theme.isDark ? '#11263c' : '#193754',
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 22,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(242, 193, 77, 0.2)',
      color: '#f6d577',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: '#ffffff',
    },
    subtitle: {
      marginTop: 8,
      color: 'rgba(239, 246, 255, 0.88)',
      lineHeight: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 14,
      paddingVertical: 18,
      gap: 10,
    },
    statCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.primaryAlt,
    },
    section: {
      paddingHorizontal: 14,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      color: theme.colors.text,
    },
    healthCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      borderRadius: 14,
    },
    statItemLabel: {
      color: theme.colors.textMuted,
      marginBottom: 6,
    },
    statItemValue: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    progressTrack: {
      marginTop: 10,
      height: 8,
      borderRadius: 99,
      backgroundColor: theme.colors.overlay,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 99,
      backgroundColor: theme.colors.primaryAlt,
    },
    helperText: {
      marginTop: 10,
      color: theme.colors.textMuted,
    },
  });
