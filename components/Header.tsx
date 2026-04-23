import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, Moon, Sun } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.root,
      {
        paddingTop: insets.top + 8,
        backgroundColor: colors.bg,
        borderBottomColor: colors.border,
      },
    ]}>
      {/* Logo */}
      <View style={styles.logo}>
        <View style={[styles.lettermark, { backgroundColor: colors.accent }]}>
          <Text style={[styles.lettermarkText, { color: colors.accentFg }]}>B</Text>
        </View>
        <View>
          <Text style={[styles.brandTop, { color: colors.accent }]}>{t('header.brandTop')}</Text>
          <Text style={[styles.brandMain, { color: colors.fg }]}>Beer Cellar</Text>
        </View>
      </View>

      {/* Right controls */}
      <View style={styles.right}>
        {/* Language toggle */}
        <Pressable
          style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleLanguage}
        >
          <Text style={[styles.pillText, { color: colors.accent }]}>
            {language === 'pt-BR' ? t('lang.en') : t('lang.pt')}
          </Text>
        </Pressable>

        {/* Theme toggle */}
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleTheme}
          accessibilityLabel="Toggle theme"
        >
          {isDark
            ? <Sun size={15} color={colors.accent} />
            : <Moon size={15} color={colors.accent} />}
        </Pressable>

        {/* Logout */}
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.dangerDim, borderColor: 'transparent' }]}
          onPress={logout}
          accessibilityLabel={t('header.logout')}
        >
          <LogOut size={15} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lettermark: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  lettermarkText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18 },
  brandTop: { fontFamily: 'DMSans_700Bold', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' },
  brandMain: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, lineHeight: 20 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99,
    borderWidth: 1, minWidth: 44, alignItems: 'center',
  },
  pillText: { fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 0.5 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
});
