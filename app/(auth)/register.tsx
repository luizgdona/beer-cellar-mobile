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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      await register(email, password, name);
      router.replace('/(app)/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({
    label, value, onChangeText, placeholder,
    secure, showToggle, onToggle, keyboardType, autoCapitalize,
  }: {
    label: string; value: string;
    onChangeText: (v: string) => void;
    placeholder: string; secure?: boolean;
    showToggle?: boolean; onToggle?: () => void;
    keyboardType?: 'email-address' | 'default';
    autoCapitalize?: 'none' | 'words';
  }) => {
    const [focused, setFocused] = useState(false);
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <View>
          <TextInput
            style={[styles.input, focused && styles.inputFocused, showToggle && { paddingRight: 48 }]}
            value={value} onChangeText={onChangeText}
            placeholder={placeholder} placeholderTextColor="rgba(237,228,208,0.35)"
            secureTextEntry={secure} autoCapitalize={autoCapitalize ?? 'none'}
            keyboardType={keyboardType ?? 'default'}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          />
          {showToggle && (
            <Pressable style={styles.eyeBtn} onPress={onToggle}>
              {secure
                ? <Eye size={16} color="rgba(237,228,208,0.45)" />
                : <EyeOff size={16} color="rgba(237,228,208,0.45)" />}
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={[DARK_BG, '#101008', DARK_BG]} style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.brandTop}>{t('auth.registerBadge')}</Text>
          <Text style={styles.heroTitle}>{t('auth.registerHeroTitle')}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('auth.registerTitle')}</Text>
            <Text style={styles.cardSubtitle}>{t('auth.registerSubtitle')}</Text>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Field label={t('auth.fullName')} value={name} onChangeText={setName}
              placeholder="John Doe" autoCapitalize="words" />
            <Field label={t('auth.email')} value={email} onChangeText={setEmail}
              placeholder="you@example.com" keyboardType="email-address" />
            <Field label={t('auth.password')} value={password} onChangeText={setPassword}
              placeholder="••••••••" secure={!showPw}
              showToggle onToggle={() => setShowPw((p) => !p)} />
            <Field label={t('auth.confirmPassword')} value={confirm} onChangeText={setConfirm}
              placeholder="••••••••" secure={!showConfirm}
              showToggle onToggle={() => setShowConfirm((p) => !p)} />

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
              onPress={handleRegister} disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#0c0a07" />
                : <Text style={styles.submitText}>{t('auth.register')}</Text>}
            </Pressable>

            <View style={styles.linkRow}>
              <Text style={styles.linkText}>{t('auth.haveAccount')} </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.linkAccent}>{t('auth.login')}</Text>
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
    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32,
    color: '#fff', lineHeight: 40, marginBottom: 28,
  },
  card: {
    backgroundColor: 'rgba(24,20,16,0.85)', borderRadius: 24, padding: 24,
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
    backgroundColor: 'rgba(224,90,74,0.14)', borderWidth: 1,
    borderColor: 'rgba(224,90,74,0.30)', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#f0a09a', fontFamily: 'DMSans_400Regular', fontSize: 13 },
  label: {
    fontFamily: 'DMSans_500Medium', fontSize: 11,
    color: 'rgba(237,228,208,0.60)', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 6, marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
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
