import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../theme/useAppTheme';
import { ThemePreference, useThemePreference } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { user, logout } = useAuth();
  const { preference, setPreference } = useThemePreference();
  const { language, setLanguage, t } = useLanguage();
  const styles = createStyles(theme);

  const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.eyebrow}>{t('profile.account')}</Text>
        <Text style={styles.title}>{t('profile.title')}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('profile.name')}</Text>
          <Text style={styles.value}>{user?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('profile.email')}</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('profile.theme')}</Text>
          <View style={styles.themePicker}>
            {themeOptions.map((option) => {
              const active = preference === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => {
                    void setPreference(option);
                  }}
                >
                  <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>
                    {option === 'system' ? t('theme.system') : option === 'light' ? t('theme.light') : t('theme.dark')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('profile.language')}</Text>
          <View style={styles.themePicker}>
            {(['pt-BR', 'en'] as const).map((option) => {
              const active = language === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => {
                    void setLanguage(option);
                  }}
                >
                  <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>
                    {option === 'pt-BR' ? t('lang.pt') : t('lang.en')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
          }}
        >
          <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    profileCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
    },
    eyebrow: {
      fontSize: 11,
      letterSpacing: 1.6,
      fontWeight: '700',
      color: theme.colors.textMuted,
      marginBottom: 6,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 20,
      color: theme.colors.text,
    },
    infoSection: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    label: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginBottom: 5,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    value: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '600',
    },
    themePicker: {
      flexDirection: 'row',
      gap: 10,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      alignItems: 'center',
    },
    themeOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.overlay,
    },
    themeOptionText: {
      color: theme.colors.textMuted,
      fontWeight: '600',
      fontSize: 13,
    },
    themeOptionTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    logoutButton: {
      backgroundColor: theme.colors.primaryAlt,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    logoutButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });
