/**
 * Team Auth Store
 * 
 * Zustand store for team portal authentication.
 */

import { create } from 'zustand';
import Cookies from 'js-cookie';
import type { TeamUser, TeamTokens } from '@/types/team';
import { teamAuthAPI } from '@/lib/team-api';

interface TeamAuthState {
  // User state
  user: TeamUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  // Token state
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  tokenExpiresAt: number | null;

  // OTP flow state
  pendingEmail: string | null;
  otpExpiresAt: number | null;

  // Actions
  setUser: (user: TeamUser | null) => void;
  setSessionId: (sessionId: string) => void;
  setTokens: (tokens: TeamTokens) => void;
  setAuth: (accessToken: string, refreshToken: string, user: TeamUser) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<boolean>;
  initialize: () => Promise<void>;
  setPendingEmail: (email: string, expiresInSeconds: number) => void;
  clearPendingEmail: () => void;
}

export const useTeamAuthStore = create<TeamAuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  sessionId: null,
  tokenExpiresAt: null,
  pendingEmail: null,
  otpExpiresAt: null,

  // Set user
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Set session ID
  setSessionId: (sessionId) => {
    set({ sessionId });
    if (sessionId) {
      localStorage.setItem('team_sessionId', sessionId);
    } else {
      localStorage.removeItem('team_sessionId');
    }
  },

  // Set tokens
  setTokens: (tokens) => {
    const expiresAt = Date.now() + tokens.expiresIn * 1000;

    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: expiresAt,
    });

    // Store in cookies
    Cookies.set('team_accessToken', tokens.accessToken, {
      expires: 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    Cookies.set('team_refreshToken', tokens.refreshToken, {
      expires: 30,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  },

  // Set complete auth
  setAuth: (accessToken, refreshToken, user) => {
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
      tokenExpiresAt: expiresAt,
    });

    // Store in cookies
    Cookies.set('team_accessToken', accessToken, {
      expires: 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    Cookies.set('team_refreshToken', refreshToken, {
      expires: 30,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  },

  // Clear auth
  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      tokenExpiresAt: null,
    });

    // Clear cookies
    Cookies.remove('team_accessToken');
    Cookies.remove('team_refreshToken');
    localStorage.removeItem('team_sessionId');
  },

  // Refresh access token
  refreshAccessToken: async () => {
    const { refreshToken, sessionId } = get();

    if (!refreshToken || !sessionId) {
      return false;
    }

    try {
      const tokens = await teamAuthAPI.refresh(refreshToken, sessionId);
      get().setTokens(tokens);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().clearAuth();
      return false;
    }
  },

  // Initialize auth from cookies
  initialize: async () => {
    set({ isLoading: true });

    try {
      const accessToken = Cookies.get('team_accessToken');
      const refreshToken = Cookies.get('team_refreshToken');
      const sessionId = localStorage.getItem('team_sessionId');

      if (!accessToken || !refreshToken) {
        set({ isInitialized: true, isLoading: false });
        return;
      }

      // Fetch user info
      const { user, session } = await teamAuthAPI.me(accessToken);

      set({
        user,
        isAuthenticated: true,
        accessToken,
        refreshToken,
        sessionId: session.id,
        isInitialized: true,
        isLoading: false,
      });

      // Store session ID
      localStorage.setItem('team_sessionId', session.id);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      get().clearAuth();
      set({ isInitialized: true, isLoading: false });
    }
  },

  // Set pending email for OTP flow
  setPendingEmail: (email, expiresInSeconds) => {
    set({
      pendingEmail: email,
      otpExpiresAt: Date.now() + expiresInSeconds * 1000,
    });
  },

  // Clear pending email
  clearPendingEmail: () => {
    set({
      pendingEmail: null,
      otpExpiresAt: null,
    });
  },
}));
