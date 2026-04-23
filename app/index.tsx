import { useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ACCENT = '#e8a530';
const DARK_BG = '#0c0a07';

export default function LandingScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const featureCards = [
    { label: t('home.cardJournal'),   desc: t('home.cardJournalDesc'),   color: ACCENT },
    { label: t('home.cardInventory'), desc: t('home.cardInventoryDesc'), color: '#52b788' },
    { label: t('home.cardInsights'),  desc: t('home.cardInsightsDesc'),  color: '#7bafd4' },
  ];

  return (
    <LinearGradient
      colors={[DARK_BG, '#101008', DARK_BG]}
      style={styles.root}
    >
      {/* Amber glow spot */}
      <View style={styles.glowSpot} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge */}
        <View style={styles.badge}>
          <View style={[styles.badgeDot, { backgroundColor: ACCENT }]} />
          <Text style={styles.badgeText}>{t('home.badge')}</Text>
        </View>

        {/* Heading */}
        <Text style={styles.h1}>
          {t('home.titleLine1')}{'\n'}
          <Text style={{ color: ACCENT }}>{t('home.titleLine2')}</Text>
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

        {/* CTAs */}
        <View style={styles.ctaRow}>
          <Pressable
            style={({ pressed }) => [styles.ctaPrimary, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaPrimaryText}>{t('home.ctaRegister')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ctaSecondary, pressed && { opacity: 0.75 }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.ctaSecondaryText}>{t('home.ctaLogin')}</Text>
          </Pressable>
        </View>

        {/* Feature cards */}
        <View style={styles.cards}>
          {featureCards.map(({ label, desc, color }) => (
            <View key={label} style={styles.card}>
              <View style={[styles.cardBar, { backgroundColor: color }]} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardLabel, { color }]}>{label}</Text>
                <Text style={styles.cardDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  glowSpot: {
    position: 'absolute', top: -100, left: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(232,165,48,0.12)',
  },
  scroll: { paddingHorizontal: 24, paddingTop: 100, paddingBottom: 60, alignItems: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
    backgroundColor: 'rgba(232,165,48,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,165,48,0.28)',
    marginBottom: 28,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: {
    color: '#f5c060', fontSize: 10, fontFamily: 'DMSans_700Bold',
    letterSpacing: 1.8, textTransform: 'uppercase',
  },
  h1: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36,
    color: '#fff', textAlign: 'center', lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular', fontSize: 15,
    color: 'rgba(237,228,208,0.70)', textAlign: 'center',
    lineHeight: 22, marginBottom: 36, maxWidth: 320,
  },
  ctaRow: { width: '100%', gap: 12, marginBottom: 48 },
  ctaPrimary: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  ctaPrimaryText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#0c0a07' },
  ctaSecondary: {
    borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(237,228,208,0.18)',
  },
  ctaSecondaryText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: '#ede4d0' },
  cards: { width: '100%', gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  cardBar: { width: 3 },
  cardContent: { flex: 1, padding: 16 },
  cardLabel: {
    fontFamily: 'DMSans_700Bold', fontSize: 10,
    letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6,
  },
  cardDesc: {
    fontFamily: 'DMSans_400Regular', fontSize: 13,
    color: 'rgba(237,228,208,0.75)', lineHeight: 18,
  },
});
