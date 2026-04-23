import { useBeerStore } from '@/lib/beerStore';
import { act, renderHook } from '@testing-library/react-native';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

import apiClient from '@/lib/api-client';
const mock = apiClient as jest.Mocked<typeof apiClient>;

const mockBeer = {
  id: 'beer-1', userId: 'user-1',
  name: 'Test IPA', brewery: 'Test Brewery',
  consumed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('beerStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBeerStore.setState({ beers: [], stats: null, isLoading: false, error: null, notificationIds: {} });
  });

  it('fetchBeers populates beers array', async () => {
    (mock.get as jest.Mock).mockResolvedValue({ data: { data: { beers: [mockBeer] } } });
    const { result } = renderHook(() => useBeerStore());
    await act(async () => { await result.current.fetchBeers(); });
    expect(result.current.beers).toHaveLength(1);
    expect(result.current.beers[0].name).toBe('Test IPA');
  });

  it('createBeer prepends to beers', async () => {
    (mock.post as jest.Mock).mockResolvedValue({ data: { data: { beer: mockBeer } } });
    const { result } = renderHook(() => useBeerStore());
    await act(async () => { await result.current.createBeer({ name: 'Test IPA', brewery: 'Test Brewery' }); });
    expect(result.current.beers[0].id).toBe('beer-1');
  });

  it('deleteBeer removes beer from array', async () => {
    useBeerStore.setState({ beers: [mockBeer] });
    (mock.delete as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useBeerStore());
    await act(async () => { await result.current.deleteBeer('beer-1'); });
    expect(result.current.beers).toHaveLength(0);
  });

  it('consumeBeer updates the beer in array', async () => {
    const consumed = { ...mockBeer, consumed: true };
    useBeerStore.setState({ beers: [mockBeer] });
    (mock.patch as jest.Mock).mockResolvedValue({ data: { data: { beer: consumed } } });
    const { result } = renderHook(() => useBeerStore());
    await act(async () => { await result.current.consumeBeer('beer-1'); });
    expect(result.current.beers[0].consumed).toBe(true);
  });
});
