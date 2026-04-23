import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AppStack() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0c0a07' }}>
        <ActivityIndicator color="#e8a530" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppStack />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
