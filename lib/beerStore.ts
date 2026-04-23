import { create } from 'zustand';
import apiClient from '@/lib/api-client';

export interface Beer {
  id: string;
  userId: string;
  name: string;
  brewery: string;
  style?: string;
  abv?: number;
  ibu?: number;
  additives?: string;
  purchaseDate?: string;
  purchaseValue?: number;
  purchaseLocation?: string;
  expirationDate?: string;
  consumptionReminderDate?: string;
  volume?: string;
  imageUrl?: string;
  description?: string;
  rating?: number;
  notes?: string;
  consumed: boolean;
  consumedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface BeerStats {
  totalBeers: number;
  consumedBeers: number;
  availableBeers: number;
  averageRating: number;
}

interface BeerStore {
  beers: Beer[];
  stats: BeerStats | null;
  isLoading: boolean;
  error: string | null;
  notificationIds: Record<string, string>;
  fetchBeers: (filters?: { status?: string; search?: string }) => Promise<void>;
  createBeer: (beerData: Partial<Beer>) => Promise<Beer>;
  updateBeer: (id: string, beerData: Partial<Beer>) => Promise<Beer>;
  deleteBeer: (id: string) => Promise<void>;
  consumeBeer: (id: string) => Promise<Beer>;
  fetchStatistics: () => Promise<void>;
  setNotificationId: (beerId: string, notifId: string) => void;
  clearError: () => void;
}

export const useBeerStore = create<BeerStore>((set) => ({
  beers: [],
  stats: null,
  isLoading: false,
  error: null,
  notificationIds: {},

  fetchBeers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      const response = await apiClient.get(`/beers?${params.toString()}`);
      set({ beers: response.data.data.beers });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  createBeer: async (beerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/beers', beerData);
      const newBeer: Beer = response.data.data.beer;
      set((state) => ({ beers: [newBeer, ...state.beers] }));
      return newBeer;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Unknown error' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBeer: async (id, beerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/beers/${id}`, beerData);
      const updated: Beer = response.data.data.beer;
      set((state) => ({
        beers: state.beers.map((b) => (b.id === id ? updated : b)),
      }));
      return updated;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Unknown error' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBeer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/beers/${id}`);
      set((state) => ({ beers: state.beers.filter((b) => b.id !== id) }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Unknown error' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  consumeBeer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/beers/${id}/consume`);
      const consumed: Beer = response.data.data.beer;
      set((state) => ({
        beers: state.beers.map((b) => (b.id === id ? consumed : b)),
      }));
      return consumed;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Unknown error' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStatistics: async () => {
    try {
      const response = await apiClient.get('/beers/stats/summary');
      set({ stats: response.data.data.stats });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Unknown error' });
    }
  },

  setNotificationId: (beerId, notifId) => {
    set((state) => ({
      notificationIds: { ...state.notificationIds, [beerId]: notifId },
    }));
  },

  clearError: () => set({ error: null }),
}));
