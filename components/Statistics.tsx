import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface StatisticsProps {
  stats: {
    totalBeers: number;
    consumedBeers: number;
    availableBeers: number;
    averageRating: number;
  } | null;
}

const STAT_ACCENTS = ['#e8a530', '#52b788', '#7bafd4', '#c48ecf'] as const;

export default function Statistics({ stats }: StatisticsProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();

  if (!stats) return null;

  const items = [
    { label: t('stats.total'),     value: String(stats.totalBeers),     icon: '▣', accent: STAT_ACCENTS[0] },
    { label: t('stats.available'), value: String(stats.availableBeers), icon: '◈', accent: STAT_ACCENTS[1] },
    { label: t('stats.consumed'),  value: String(stats.consumedBeers),  icon: '◉', accent: STAT_ACCENTS[2] },
    { label: t('stats.avgRating'), value: stats.averageRating.toFixed(1), icon: '◆', accent: STAT_ACCENTS[3] },
  ];

  return (
    <View style={styles.grid}>
      {items.map(({ label, value, icon, accent }) => (
        <View
          key={label}
          style={[styles.card, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            ...colors.shadow,
          }]}
        >
          {/* Left accent bar */}
          <View style={[styles.bar, { backgroundColor: accent }]} />
          <View style={styles.content}>
            <Text style={[styles.icon, { color: accent }]}>{icon}</Text>
            <Text style={[styles.value, { color: colors.fg }]}>{value}</Text>
            <Text style={[styles.label, { color: colors.fgMuted }]}>{label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%', flexDirection: 'row',
    borderRadius: 16, borderWidth: 1, overflow: 'hidden',
  },
  bar: { width: 3 },
  content: { flex: 1, padding: 16 },
  icon: { fontSize: 14, marginBottom: 8 },
  value: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, lineHeight: 32 },
  label: {
    fontFamily: 'DMSans_500Medium', fontSize: 10,
    letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4,
  },
});
