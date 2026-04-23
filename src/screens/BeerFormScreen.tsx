import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

export default function BeerFormScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>COMING NEXT</Text>
        <Text style={styles.title}>Add / Edit Beer</Text>
        <Text style={styles.subtitle}>This screen will host the complete beer form with the same premium theme as the rest of the app.</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    card: {
      width: '100%',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: 20,
    },
    eyebrow: {
      fontSize: 11,
      letterSpacing: 1.5,
      fontWeight: '700',
      color: theme.colors.textMuted,
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
    },
    subtitle: {
      color: theme.colors.textMuted,
      lineHeight: 20,
    },
  });
