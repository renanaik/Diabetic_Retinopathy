import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ThemePreference, ThemeContextValue } from '../types';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'retinacare_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'system'; // default theme preference
  });

  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Handler function to update active theme based on preferences
    const updateTheme = () => {
      if (themePreference === 'system') {
        const matchesDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(matchesDark ? 'dark' : 'light');
      } else {
        setTheme(themePreference);
      }
    };

    updateTheme();

    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateTheme);
        return () => mediaQuery.removeEventListener('change', updateTheme);
      } else {
        mediaQuery.addListener(updateTheme);
        return () => mediaQuery.removeListener(updateTheme);
      }
    }
  }, [themePreference]);

  // Apply theme class to HTML root node
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setThemePreference(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
