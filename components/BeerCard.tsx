import { useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Alert, Image,
  Animated,
} from 'react-native';
import { Trash2, CheckCircle2, Wine } from 'lucide-react-native';
import { useBeerStore, Beer } from '@/lib/beerStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Notifications from 'expo-notifications';

interface BeerCardProps {
  beer: Beer;
}

function Stars({ value }: { value: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
      {[1,2,3,4,5].map((i) => (
        <Text
          key={i}
          style={{ fontSize: 12, color: i <= Math.round(value) ? colors.accent : colors.border }}
        >
          ★
        </Text>
      ))}
      <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.fgMuted, marginLeft: 4 }}>
        {value.toFixed(1)}
      </Text>
    </View>
  );
}

export default function BeerCard({ beer }: BeerCardProps) {
  const { deleteBeer, consumeBeer, notificationIds } = useBeerStore();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const handleDelete = () => {
    Alert.alert(t('beer.deleteConfirm'), '', [
      { text: t('form.cancel'), style: 'cancel' },
      {
        text: t('beer.delete'), style: 'destructive',
        onPress: async () => {
          const notifId = notificationIds[beer.id];
          if (notifId) Notifications.cancelScheduledNotificationAsync(notifId);
          try { await deleteBeer(beer.id); }
          catch { Alert.alert(t('beer.deleteFail')); }
        },
      },
    ]);
  };

  const handleConsume = async () => {
    try { await consumeBeer(beer.id); }
    catch { Alert.alert(t('beer.consumeFail')); }
  };

  const pills = [
    beer.style  && beer.style,
    beer.abv    && `${beer.abv}% ABV`,
    beer.ibu    && `${beer.ibu} IBU`,
    beer.volume && beer.volume,
  ].filter(Boolean) as string[];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          ...colors.shadow,
        }]}
      >
        {/* Image */}
        <View style={[styles.imageArea, { backgroundColor: colors.bgAlt, borderBottomColor: colors.border }]}>
          {beer.imageUrl ? (
            <Image source={{ uri: beer.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Wine size={32} strokeWidth={1} color={colors.fgMuted} style={{ opacity: 0.35 }} />
          )}
        </View>

        <View style={styles.body}>
          {/* Header row: name + status */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.fg }]} numberOfLines={1}>{beer.name}</Text>
              <Text style={[styles.brewery, { color: colors.fgMuted }]} numberOfLines={1}>{beer.brewery}</Text>
            </View>
            <View style={[styles.statusPill, {
              backgroundColor: beer.consumed ? colors.consumedDim : colors.accentDim,
            }]}>
              <Text style={[styles.statusText, { color: beer.consumed ? colors.consumed : colors.accent }]}>
                {beer.consumed ? `✓ ${t('beer.consumed')}` : t('beer.available')}
              </Text>
            </View>
          </View>

          {/* Attribute pills */}
          {pills.length > 0 && (
            <View style={styles.pillsRow}>
              {pills.map((p) => (
                <View key={p} style={[styles.attrPill, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Text style={[styles.attrText, { color: colors.fgMuted }]}>{p}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Rating */}
          {beer.rating != null && <Stars value={beer.rating} />}

          {/* Description */}
          {!!beer.description && (
            <Text style={[styles.desc, { color: colors.fgMuted }]} numberOfLines={2}>
              {beer.description}
            </Text>
          )}

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            {!beer.consumed && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.consumedDim, opacity: pressed ? 0.75 : 1 }]}
                onPress={handleConsume}
              >
                <CheckCircle2 size={13} color={colors.consumed} />
                <Text style={[styles.actionText, { color: colors.consumed }]}>{t('beer.markConsumed')}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.dangerDim, opacity: pressed ? 0.75 : 1 }]}
              onPress={handleDelete}
            >
              <Trash2 size={13} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>{t('beer.delete')}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', flex: 1 },
  imageArea: {
    height: 120, alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1,
  },
  image: { width: '100%', height: '100%' },
  body: { padding: 12 },
  nameRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  name: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, lineHeight: 20 },
  brewery: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16 },
  statusPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  statusText: { fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 0.5 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  attrPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  attrText: { fontFamily: 'DMSans_500Medium', fontSize: 10 },
  desc: {
    fontFamily: 'DMSans_400Regular', fontSize: 12,
    lineHeight: 17, marginTop: 6,
  },
  actions: {
    flexDirection: 'row', gap: 8, marginTop: 10,
    paddingTop: 10, borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    borderRadius: 8, paddingVertical: 8,
  },
  actionText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11 },
});
