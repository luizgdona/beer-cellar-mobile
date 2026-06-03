import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { isAxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../theme/useAppTheme';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const styles = createStyles(theme);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('common.fillFields'));
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error : undefined;
      Alert.alert(t('auth.login'), msg || t('common.error'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{t('auth.welcome')}</Text>
        <Text style={styles.title}>{t('auth.appName')}</Text>
        <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.showButton}>
              <Text style={styles.showButtonText}>{showPassword ? t('auth.hide') : t('auth.show')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.login')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
            <Text style={styles.link}>
              {t('auth.noAccount')} <Text style={styles.linkBold}>{t('auth.register')}</Text>
            </Text>
          </TouchableOpacity>
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
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      paddingVertical: 40,
    },
    eyebrow: {
      textAlign: 'center',
      fontSize: 11,
      letterSpacing: 1.6,
      fontWeight: '700',
      color: theme.colors.textMuted,
      marginBottom: 8,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      lineHeight: 40,
      textAlign: 'center',
      marginBottom: 6,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      color: theme.colors.textMuted,
      marginBottom: 26,
    },
    form: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 24,
      padding: 20,
      gap: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 5,
      color: theme.colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 13,
      fontSize: 14,
      color: theme.colors.text,
    },
    passwordWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: 14,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 13,
      fontSize: 14,
      color: theme.colors.text,
    },
    showButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    showButtonText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 6,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#102033',
      fontSize: 16,
      fontWeight: '700',
    },
    link: {
      textAlign: 'center',
      color: theme.colors.textMuted,
      marginTop: 14,
    },
    linkBold: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });
