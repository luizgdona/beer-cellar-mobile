import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider, useThemePreference } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { errorLogger } from './lib/errorLogger';
import { analyticsManager } from './lib/analyticsManager';
import { darkTheme, lightTheme } from './theme/colors';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import BeerListScreen from './screens/BeerListScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack({ isDark }: { isDark: boolean }) {
  const theme = isDark ? darkTheme : lightTheme;
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('nav.overview'),
        }}
      />
      <Tab.Screen
        name="BeerList"
        component={BeerListScreen}
        options={{
          title: t('nav.myBeers'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('nav.profile'),
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator({ isDark }: { isDark: boolean }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="App" options={{ animation: 'none' }}>
          {() => <AppStack isDark={isDark} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} options={{ animation: 'none' }} />
      )}
    </Stack.Navigator>
  );
}

function AppShell() {
  const { isDark } = useThemePreference();

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await errorLogger.initialize();
        await analyticsManager.initialize();
        analyticsManager.trackEvent('app_started');
      } catch (err) {
        console.error('Failed to initialize error/analytics:', err);
      }
    };

    initializeServices();

    return () => {
      analyticsManager.stopPeriodicSync();
    };
  }, []);

  return (
    <NavigationContainer
      theme={
        isDark
          ? {
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background: darkTheme.colors.background,
                card: darkTheme.colors.surface,
                text: darkTheme.colors.text,
                border: darkTheme.colors.border,
                primary: darkTheme.colors.primary,
              },
            }
          : {
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: lightTheme.colors.background,
                card: lightTheme.colors.surface,
                text: lightTheme.colors.text,
                border: lightTheme.colors.border,
                primary: lightTheme.colors.primary,
              },
            }
      }
    >
      <RootNavigator isDark={isDark} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary context="RootApp">
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
