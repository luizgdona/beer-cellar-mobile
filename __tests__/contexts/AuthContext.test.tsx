import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

import apiClient from '@/lib/api-client';
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts unauthenticated when storage is empty', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logs in and stores tokens', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    const mockTokens = { accessToken: 'access123', refreshToken: 'refresh123' };
    (mockApiClient.post as jest.Mock).mockResolvedValue({
      data: { data: { user: mockUser, tokens: mockTokens } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@test.com');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'access123');
  });

  it('logs out and clears storage', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    const mockTokens = { accessToken: 'access123', refreshToken: 'refresh123' };
    (mockApiClient.post as jest.Mock).mockResolvedValue({
      data: { data: { user: mockUser, tokens: mockTokens } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.login('test@test.com', 'password'); });
    act(() => { result.current.logout(); });

    expect(result.current.isAuthenticated).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
  });
});
