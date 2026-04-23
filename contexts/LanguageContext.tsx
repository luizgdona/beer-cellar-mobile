import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'pt-BR' | 'en';

type TranslationKey =
  | 'lang.pt' | 'lang.en'
  | 'home.badge' | 'home.titleLine1' | 'home.titleLine2' | 'home.subtitle'
  | 'home.ctaRegister' | 'home.ctaLogin'
  | 'home.cardJournal' | 'home.cardJournalDesc'
  | 'home.cardInventory' | 'home.cardInventoryDesc'
  | 'home.cardInsights' | 'home.cardInsightsDesc'
  | 'auth.loginBadge' | 'auth.loginHeroTitle' | 'auth.loginHeroSubtitle'
  | 'auth.loginTitle' | 'auth.loginSubtitle'
  | 'auth.registerBadge' | 'auth.registerHeroTitle' | 'auth.registerHeroSubtitle'
  | 'auth.registerTitle' | 'auth.registerSubtitle'
  | 'auth.email' | 'auth.password' | 'auth.fullName' | 'auth.confirmPassword'
  | 'auth.login' | 'auth.loggingIn' | 'auth.register' | 'auth.creating'
  | 'auth.noAccount' | 'auth.haveAccount' | 'auth.showPassword' | 'auth.hidePassword'
  | 'header.brandTop' | 'header.logout'
  | 'dashboard.inventory' | 'dashboard.collectionTitle'
  | 'dashboard.cancel' | 'dashboard.addBeer'
  | 'dashboard.searchPlaceholder' | 'dashboard.filterAll'
  | 'dashboard.filterAvailable' | 'dashboard.filterConsumed'
  | 'dashboard.loading' | 'dashboard.empty'
  | 'stats.total' | 'stats.available' | 'stats.consumed' | 'stats.avgRating'
  | 'beer.style' | 'beer.abv' | 'beer.ibu' | 'beer.volume' | 'beer.rating'
  | 'beer.available' | 'beer.consumed' | 'beer.markConsumed' | 'beer.delete'
  | 'beer.deleteConfirm' | 'beer.deleteFail' | 'beer.consumeFail'
  | 'form.title' | 'form.requiredNameBrewery' | 'form.name' | 'form.brewery'
  | 'form.style' | 'form.abv' | 'form.ibu' | 'form.volume'
  | 'form.purchaseDate' | 'form.purchaseValue' | 'form.purchaseLocation'
  | 'form.expirationDate' | 'form.reminderDate' | 'form.description'
  | 'form.adding' | 'form.addBeer' | 'form.cancel' | 'form.photo' | 'form.gallery';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  'pt-BR': {
    'lang.pt': 'PT-BR', 'lang.en': 'EN',
    'home.badge': 'Inspirado nos melhores apps de cerveja',
    'home.titleLine1': 'Encontre cervejas que você ama,',
    'home.titleLine2': 'mantenha sua adega atualizada.',
    'home.subtitle': 'Diário de notas, controle de garrafas e status da adega.',
    'home.ctaRegister': 'Criar conta', 'home.ctaLogin': 'Entrar',
    'home.cardJournal': 'Diário', 'home.cardJournalDesc': 'Avalie cada cerveja e guarde notas.',
    'home.cardInventory': 'Estoque', 'home.cardInventoryDesc': 'Saiba o que está disponível.',
    'home.cardInsights': 'Insights', 'home.cardInsightsDesc': 'Acompanhe consumo e qualidade.',
    'auth.loginBadge': 'Bem-vindo de volta',
    'auth.loginHeroTitle': 'Volte para sua adega.',
    'auth.loginHeroSubtitle': 'Acompanhe garrafas e mantenha seu inventário.',
    'auth.loginTitle': 'Beer Cellar', 'auth.loginSubtitle': 'Entre para gerenciar sua coleção',
    'auth.registerBadge': 'Nova conta',
    'auth.registerHeroTitle': 'Monte seu arquivo de degustação.',
    'auth.registerHeroSubtitle': 'Crie sua conta e organize sua coleção.',
    'auth.registerTitle': 'Beer Cellar', 'auth.registerSubtitle': 'Crie sua conta',
    'auth.email': 'Email', 'auth.password': 'Senha',
    'auth.fullName': 'Nome completo', 'auth.confirmPassword': 'Confirmar senha',
    'auth.login': 'Entrar', 'auth.loggingIn': 'Entrando...',
    'auth.register': 'Cadastrar', 'auth.creating': 'Criando conta...',
    'auth.noAccount': 'Não tem conta?', 'auth.haveAccount': 'Já tem uma conta?',
    'auth.showPassword': 'Mostrar senha', 'auth.hidePassword': 'Ocultar senha',
    'header.brandTop': 'The', 'header.logout': 'Sair',
    'dashboard.inventory': 'Estoque', 'dashboard.collectionTitle': 'Sua coleção de cervejas',
    'dashboard.cancel': 'Cancelar', 'dashboard.addBeer': 'Adicionar cerveja',
    'dashboard.searchPlaceholder': 'Buscar cervejas...',
    'dashboard.filterAll': 'Todas', 'dashboard.filterAvailable': 'Disponíveis',
    'dashboard.filterConsumed': 'Consumidas',
    'dashboard.loading': 'Carregando cervejas...', 'dashboard.empty': 'Nenhuma cerveja encontrada',
    'stats.total': 'Total', 'stats.available': 'Disponíveis',
    'stats.consumed': 'Consumidas', 'stats.avgRating': 'Nota média',
    'beer.style': 'Estilo', 'beer.abv': 'ABV', 'beer.ibu': 'IBU',
    'beer.volume': 'Volume', 'beer.rating': 'Avaliação',
    'beer.available': 'Disponível', 'beer.consumed': 'Consumida',
    'beer.markConsumed': 'Consumida', 'beer.delete': 'Excluir',
    'beer.deleteConfirm': 'Excluir esta cerveja?',
    'beer.deleteFail': 'Falha ao excluir', 'beer.consumeFail': 'Falha ao marcar',
    'form.title': 'Adicionar cerveja', 'form.requiredNameBrewery': 'Nome e cervejaria obrigatórios',
    'form.name': 'Nome', 'form.brewery': 'Cervejaria', 'form.style': 'Estilo',
    'form.abv': 'ABV (%)', 'form.ibu': 'IBU', 'form.volume': 'Volume',
    'form.purchaseDate': 'Data de compra', 'form.purchaseValue': 'Valor',
    'form.purchaseLocation': 'Local de compra', 'form.expirationDate': 'Validade',
    'form.reminderDate': 'Lembrete', 'form.description': 'Descrição',
    'form.adding': 'Adicionando...', 'form.addBeer': 'Adicionar', 'form.cancel': 'Cancelar',
    'form.photo': 'Câmera', 'form.gallery': 'Galeria',
  },
  en: {
    'lang.pt': 'PT-BR', 'lang.en': 'EN',
    'home.badge': 'Inspired by top beer apps',
    'home.titleLine1': 'Find beers you love,',
    'home.titleLine2': 'keep your cellar updated.',
    'home.subtitle': 'Tasting journal, bottle tracking, and cellar status.',
    'home.ctaRegister': 'Create account', 'home.ctaLogin': 'Sign in',
    'home.cardJournal': 'Journal', 'home.cardJournalDesc': 'Rate each beer and keep tasting notes.',
    'home.cardInventory': 'Inventory', 'home.cardInventoryDesc': 'Know what is available right now.',
    'home.cardInsights': 'Insights', 'home.cardInsightsDesc': 'Track consumption and quality.',
    'auth.loginBadge': 'Welcome back',
    'auth.loginHeroTitle': 'Return to your cellar.',
    'auth.loginHeroSubtitle': 'Track bottles and keep your inventory current.',
    'auth.loginTitle': 'Beer Cellar', 'auth.loginSubtitle': 'Sign in to manage your collection',
    'auth.registerBadge': 'New account',
    'auth.registerHeroTitle': 'Build your tasting archive.',
    'auth.registerHeroSubtitle': 'Create your account and organize your collection.',
    'auth.registerTitle': 'Beer Cellar', 'auth.registerSubtitle': 'Create your account',
    'auth.email': 'Email', 'auth.password': 'Password',
    'auth.fullName': 'Full Name', 'auth.confirmPassword': 'Confirm Password',
    'auth.login': 'Log In', 'auth.loggingIn': 'Logging in...',
    'auth.register': 'Register', 'auth.creating': 'Creating account...',
    'auth.noAccount': "Don't have an account?", 'auth.haveAccount': 'Already have an account?',
    'auth.showPassword': 'Show password', 'auth.hidePassword': 'Hide password',
    'header.brandTop': 'The', 'header.logout': 'Logout',
    'dashboard.inventory': 'Inventory', 'dashboard.collectionTitle': 'Your beer collection',
    'dashboard.cancel': 'Cancel', 'dashboard.addBeer': 'Add Beer',
    'dashboard.searchPlaceholder': 'Search beers...',
    'dashboard.filterAll': 'All', 'dashboard.filterAvailable': 'Available',
    'dashboard.filterConsumed': 'Consumed',
    'dashboard.loading': 'Loading beers...', 'dashboard.empty': 'No beers found',
    'stats.total': 'Total', 'stats.available': 'Available',
    'stats.consumed': 'Consumed', 'stats.avgRating': 'Avg rating',
    'beer.style': 'Style', 'beer.abv': 'ABV', 'beer.ibu': 'IBU',
    'beer.volume': 'Volume', 'beer.rating': 'Rating',
    'beer.available': 'Available', 'beer.consumed': 'Consumed',
    'beer.markConsumed': 'Consumed', 'beer.delete': 'Delete',
    'beer.deleteConfirm': 'Delete this beer?',
    'beer.deleteFail': 'Failed to delete', 'beer.consumeFail': 'Failed to mark',
    'form.title': 'Add New Beer', 'form.requiredNameBrewery': 'Name and Brewery required',
    'form.name': 'Name', 'form.brewery': 'Brewery', 'form.style': 'Style',
    'form.abv': 'ABV (%)', 'form.ibu': 'IBU', 'form.volume': 'Volume',
    'form.purchaseDate': 'Purchase Date', 'form.purchaseValue': 'Purchase Value',
    'form.purchaseLocation': 'Purchase Location', 'form.expirationDate': 'Expiration Date',
    'form.reminderDate': 'Consumption Reminder', 'form.description': 'Description',
    'form.adding': 'Adding...', 'form.addBeer': 'Add Beer', 'form.cancel': 'Cancel',
    'form.photo': 'Camera', 'form.gallery': 'Gallery',
  },
};

interface LanguageContextType {
  language: AppLanguage;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const STORAGE_KEY = 'beer_cellar_language';
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('pt-BR');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'pt-BR' || stored === 'en') setLanguageState(stored as AppLanguage);
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: AppLanguage = prev === 'pt-BR' ? 'en' : 'pt-BR';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? key,
    [language]
  );

  const value = useMemo<LanguageContextType>(
    () => ({ language, toggleLanguage, t }),
    [language, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
