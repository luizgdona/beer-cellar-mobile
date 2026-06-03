import { create } from 'zustand';
import { isAxiosError } from 'axios';
import apiClient from '../lib/apiClient';

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

interface BeerStore {
  beers: Beer[];
  isLoading: boolean;
  error: string | null;
  fetchBeers: (filters?: { status?: string; search?: string }) => Promise<void>;
  createBeer: (beerData: Partial<Beer>) => Promise<Beer>;
  updateBeer: (id: string, beerData: Partial<Beer>) => Promise<Beer>;
  deleteBeer: (id: string) => Promise<void>;
  consumeBeer: (id: string) => Promise<Beer>;
  clearError: () => void;
}

const extractErrorMessage = (err: unknown): string => {
  if (isAxiosError(err)) return err.response?.data?.error ?? err.message;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
};

export const useBeerStore = create<BeerStore>((set) => ({
  beers: [],
  isLoading: false,
  error: null,

  fetchBeers: async (filters?: { status?: string; search?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get(`/beers?${params.toString()}`);
      set({ beers: response.data.data.beers });
    } catch (err) {
      set({ error: extractErrorMessage(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  createBeer: async (beerData: Partial<Beer>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/beers', beerData);
      const newBeer = response.data.data.beer as Beer;
      set((state) => ({ beers: [newBeer, ...state.beers] }));
      return newBeer;
    } catch (err) {
      set({ error: extractErrorMessage(err) });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBeer: async (id: string, beerData: Partial<Beer>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/beers/${id}`, beerData);
      const updatedBeer = response.data.data.beer as Beer;
      set((state) => ({
        beers: state.beers.map((beer) => (beer.id === id ? updatedBeer : beer)),
      }));
      return updatedBeer;
    } catch (err) {
      set({ error: extractErrorMessage(err) });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBeer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/beers/${id}`);
      set((state) => ({ beers: state.beers.filter((beer) => beer.id !== id) }));
    } catch (err) {
      set({ error: extractErrorMessage(err) });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  consumeBeer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/beers/${id}/consume`);
      const consumedBeer = response.data.data.beer as Beer;
      set((state) => ({
        beers: state.beers.map((beer) => (beer.id === id ? consumedBeer : beer)),
      }));
      return consumedBeer;
    } catch (err) {
      set({ error: extractErrorMessage(err) });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
