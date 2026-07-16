import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

function loadTheme(): boolean {
  try {
    const saved = localStorage.getItem('hr-copilot-theme');
    if (saved) return saved === 'dark';
    return true; // default dark
  } catch {
    return true;
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: loadTheme(),
  toggle: () =>
    set((state) => {
      const next = !state.isDark;
      localStorage.setItem('hr-copilot-theme', next ? 'dark' : 'light');
      return { isDark: next };
    }),
}));
