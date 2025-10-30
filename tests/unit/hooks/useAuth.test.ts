import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../../../src/hooks/useAuth';
import { supabase } from '../../../src/lib/supabase';

vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should load existing session on mount', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {
            name: 'Test User',
            role: 'admin',
          },
        },
      };

      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      });
      expect(result.current.session).toEqual(mockSession);
    });

    it('should handle missing session gracefully', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should default role to staff if not provided', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {
            name: 'Test User',
          },
        },
      };

      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user?.role).toBe('staff');
    });
  });

  describe('signUp', () => {
    it('should call supabase signUp with correct parameters', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const mockSignUpResult = {
        data: { user: { id: 'new-user' }, session: null },
        error: null,
      };
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockSignUpResult as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signUpResult = await result.current.signUp(
        'new@example.com',
        'password123',
        'New User',
        'admin'
      );

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'New User',
            role: 'admin',
          },
        },
      });
      expect(signUpResult).toEqual(mockSignUpResult);
    });

    it('should default role to staff in signUp', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signUp('new@example.com', 'password123', 'New User');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'New User',
            role: 'staff',
          },
        },
      });
    });

    it('should return error from signUp', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const mockError = { message: 'Email already exists' };
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as any,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signUpResult = await result.current.signUp(
        'existing@example.com',
        'password123',
        'User'
      );

      expect(signUpResult.error).toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('should call supabase signInWithPassword', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const mockSignInResult = {
        data: { user: { id: 'user-123' }, session: {} },
        error: null,
      };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockSignInResult as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInResult = await result.current.signIn('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(signInResult).toEqual(mockSignInResult);
    });

    it('should return error from signIn', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const mockError = { message: 'Invalid credentials' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as any,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInResult = await result.current.signIn('test@example.com', 'wrongpassword');

      expect(signInResult.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signOutResult = await result.current.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(signOutResult.error).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should call supabase updateUser with updates', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const mockUpdateResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      };
      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockUpdateResult as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = { name: 'Updated Name', role: 'manager' };
      const updateResult = await result.current.updateProfile(updates);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: updates,
      });
      expect(updateResult).toEqual(mockUpdateResult);
    });
  });

  describe('auth state changes', () => {
    it('should update user on auth state change', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      let authCallback: any;

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: { subscription: mockSubscription },
        } as any;
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      const newSession = {
        user: {
          id: 'user-456',
          email: 'newuser@example.com',
          user_metadata: { name: 'New User', role: 'viewer' },
        },
      };

      authCallback('SIGNED_IN', newSession);

      await waitFor(() => {
        expect(result.current.user).toEqual({
          id: 'user-456',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'viewer',
        });
      });
    });

    it('should unsubscribe on unmount', async () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any);

      const { unmount } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
