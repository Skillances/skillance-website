import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const STORAGE_KEY = 'skillance-admin-theme';

type AdminTheme = 'light' | 'dark';

interface AdminThemeContextType {
  theme: AdminTheme;
  setTheme: (t: AdminTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType | null>(null);

function readStored(): AdminTheme {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'dark' || s === 'light') return s;
  } catch {}
  return 'light';
}

function writeStored(t: AdminTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {}
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return ctx;
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>(readStored);

  useEffect(() => {
    writeStored(theme);
  }, [theme]);

  const setTheme = (t: AdminTheme) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  const value: AdminThemeContextType = { theme, setTheme, toggleTheme, isDark };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}
