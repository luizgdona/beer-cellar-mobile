import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT = '#e8a530';
const DARK_BG = '#0c0a07';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(app)/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={[DARK_BG, '#101008', DARK_BG]} style={styles.root}>
      <View style={[styles.glow]} pointerEvents="none" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <Text style={styles.brandTop}>{t('auth.loginBadge')}</Text>
          <Text style={styles.heroTitle}>{t('auth.loginHeroTitle')}</Text>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('auth.loginTitle')}</Text>
            <Text style={styles.cardSubtitle}>{t('auth.loginSubtitle')}</Text>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="rgba(237,228,208,0.35)"
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />

            {/* Password */}
            <Text style={styles.label}>{t('auth.password')}</Text>
            <View>
              <TextInput
                style={[styles.input, pwFocused && styles.inputFocused, { paddingRight: 48 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(237,228,208,0.35)"
                secureTextEntry={!showPw}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPw((p) => !p)}
                accessibilityLabel={showPw ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPw
                  ? <EyeOff size={16} color="rgba(237,228,208,0.45)" />
                  : <Eye size={16} color="rgba(237,228,208,0.45)" />}
              </Pressable>
            </View>

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#0c0a07" />
                : <Text style={styles.submitText}>{t('auth.login')}</Text>}
            </Pressable>

            {/* Link */}
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>{t('auth.noAccount')} </Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.linkAccent}>{t('auth.register')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  glow: {
    position: 'absolute', top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(232,165,48,0.14)',
  },
  scroll: { paddingHorizontal: 24 },
  brandTop: {
    color: ACCENT, fontFamily: 'DMSans_700Bold',
    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32, color: '#fff', lineHeight: 40, marginBottom: 28,
  },
  card: {
    backgroundColor: 'rgba(24,20,16,0.85)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22,
    color: '#fff', textAlign: 'center', marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'DMSans_400Regular', fontSize: 13,
    color: 'rgba(237,228,208,0.60)', textAlign: 'center', marginBottom: 24,
  },
  errorBox: {
    backgroundColor: 'rgba(224,90,74,0.14)',
    borderWidth: 1, borderColor: 'rgba(224,90,74,0.30)',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#f0a09a', fontFamily: 'DMSans_400Regular', fontSize: 13 },
  label: {
    fontFamily: 'DMSans_500Medium', fontSize: 11,
    color: 'rgba(237,228,208,0.60)', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 6, marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: '#ede4d0', fontFamily: 'DMSans_400Regular', fontSize: 15,
  },
  inputFocused: { borderColor: ACCENT },
  eyeBtn: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 48, alignItems: 'center', justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 24,
  },
  submitText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#0c0a07' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: 'rgba(237,228,208,0.55)' },
  linkAccent: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: ACCENT },
});
