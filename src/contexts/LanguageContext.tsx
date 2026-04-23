import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'pt-BR' | 'en';

type TranslationKey =
  | 'lang.pt'
  | 'lang.en'
  | 'nav.overview'
  | 'nav.myBeers'
  | 'nav.profile'
  | 'home.badge'
  | 'home.title'
  | 'home.subtitle'
  | 'home.total'
  | 'home.available'
  | 'home.consumed'
  | 'home.avgRating'
  | 'home.health'
  | 'home.progress'
  | 'home.remaining'
  | 'auth.welcome'
  | 'auth.newAccount'
  | 'auth.appName'
  | 'auth.loginSubtitle'
  | 'auth.registerSubtitle'
  | 'auth.fullName'
  | 'auth.email'
  | 'auth.password'
  | 'auth.confirmPassword'
  | 'auth.login'
  | 'auth.register'
  | 'auth.noAccount'
  | 'auth.haveAccount'
  | 'auth.show'
  | 'auth.hide'
  | 'common.error'
  | 'common.back'
  | 'common.fillFields'
  | 'profile.account'
  | 'profile.title'
  | 'profile.name'
  | 'profile.email'
  | 'profile.theme'
  | 'profile.language'
  | 'profile.logout'
  | 'theme.system'
  | 'theme.light'
  | 'theme.dark'
  | 'beers.title'
  | 'beers.searchPlaceholder'
  | 'beers.all'
  | 'beers.available'
  | 'beers.consumed'
  | 'beers.noneFound';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  'pt-BR': {
    'lang.pt': 'PT-BR',
    'lang.en': 'EN',
    'nav.overview': 'Visao geral',
    'nav.myBeers': 'Minhas cervejas',
    'nav.profile': 'Perfil',
    'home.badge': 'Visao da colecao',
    'home.title': 'Sua Beer Cellar',
    'home.subtitle': 'Acompanhe estoque, qualidade e ritmo de degustacao em um painel unico.',
    'home.total': 'Total de cervejas',
    'home.available': 'Disponiveis',
    'home.consumed': 'Consumidas',
    'home.avgRating': 'Nota media',
    'home.health': 'Saude da colecao',
    'home.progress': 'Progresso de consumo',
    'home.remaining': 'garrafas ainda disponiveis na sua adega.',
    'auth.welcome': 'BEM-VINDO DE VOLTA',
    'auth.newAccount': 'NOVA CONTA',
    'auth.appName': 'Beer Cellar',
    'auth.loginSubtitle': 'Gerencie sua colecao com estilo.',
    'auth.registerSubtitle': 'Comece seu arquivo de degustacao.',
    'auth.fullName': 'Nome completo',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.confirmPassword': 'Confirmar senha',
    'auth.login': 'Entrar',
    'auth.register': 'Cadastrar',
    'auth.noAccount': 'Nao tem conta?',
    'auth.haveAccount': 'Ja tem conta?',
    'auth.show': 'Mostrar',
    'auth.hide': 'Ocultar',
    'common.error': 'Erro',
    'common.back': 'Voltar',
    'common.fillFields': 'Preencha todos os campos',
    'profile.account': 'CONTA',
    'profile.title': 'Perfil',
    'profile.name': 'Nome',
    'profile.email': 'Email',
    'profile.theme': 'Tema',
    'profile.language': 'Idioma',
    'profile.logout': 'Sair',
    'theme.system': 'Sistema',
    'theme.light': 'Claro',
    'theme.dark': 'Escuro',
    'beers.title': 'Minhas cervejas',
    'beers.searchPlaceholder': 'Buscar cervejas...',
    'beers.all': 'Todas',
    'beers.available': 'Disponiveis',
    'beers.consumed': 'Consumidas',
    'beers.noneFound': 'Nenhuma cerveja encontrada',
  },
  en: {
    'lang.pt': 'PT-BR',
    'lang.en': 'EN',
    'nav.overview': 'Overview',
    'nav.myBeers': 'My Beers',
    'nav.profile': 'Profile',
    'home.badge': 'Collection Overview',
    'home.title': 'Your Beer Cellar',
    'home.subtitle': 'Track inventory, quality, and tasting pace in one dashboard.',
    'home.total': 'Total Beers',
    'home.available': 'Available',
    'home.consumed': 'Consumed',
    'home.avgRating': 'Avg Rating',
    'home.health': 'Collection Health',
    'home.progress': 'Consumption Progress',
    'home.remaining': 'bottles still available in your cellar.',
    'auth.welcome': 'WELCOME BACK',
    'auth.newAccount': 'NEW ACCOUNT',
    'auth.appName': 'Beer Cellar',
    'auth.loginSubtitle': 'Manage your collection in style.',
    'auth.registerSubtitle': 'Start your tasting archive.',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.login': 'Log In',
    'auth.register': 'Register',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.show': 'Show',
    'auth.hide': 'Hide',
    'common.error': 'Error',
    'common.back': 'Back',
    'common.fillFields': 'Please fill in all fields',
    'profile.account': 'ACCOUNT',
    'profile.title': 'Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.theme': 'Theme',
    'profile.language': 'Language',
    'profile.logout': 'Logout',
    'theme.system': 'System',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'beers.title': 'My Beers',
    'beers.searchPlaceholder': 'Search beers...',
    'beers.all': 'All',
    'beers.available': 'Available',
    'beers.consumed': 'Consumed',
    'beers.noneFound': 'No beers found',
  },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (next: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: TranslationKey) => string;
}

const STORAGE_KEY = 'beer_cellar_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('pt-BR');

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'pt-BR' || stored === 'en') {
          setLanguageState(stored);
        }
      } catch (err) {
        console.warn('Failed to restore language preference:', err);
      }
    };

    restore();
  }, []);

  const setLanguage = async (next: AppLanguage) => {
    setLanguageState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const toggleLanguage = async () => {
    await setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR');
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key: TranslationKey) => translations[language][key] ?? key,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
