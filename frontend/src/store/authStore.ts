import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// Persisted to localStorage manually (not via zustand/persist middleware) to
// keep the dependency surface small. Token in localStorage is standard for
// SPA demos; for production-grade security, an httpOnly cookie is preferable.
const STORAGE_KEY = 'hr-copilot-auth';

function loadInitial(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    return JSON.parse(raw);
  } catch {
    return { user: null, token: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitial(),
  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null });
  },
}));
