import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Theme: dark (default) / light. Mirrors the original script.js behaviour:
// data-theme on <html>, persisted in localStorage key "tea-theme".
const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const s = localStorage.getItem('tea-theme');
      return s === 'light' || s === 'dark' ? s : 'dark';
    } catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('tea-theme', theme); } catch {}
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// AssetBase: relative prefix for public assets. Root pages use "assets/",
// blog articles (served from /blog/) use "../assets/".
const AssetBaseContext = createContext('assets/');

export function AssetBaseProvider({ base, children }) {
  return <AssetBaseContext.Provider value={base}>{children}</AssetBaseContext.Provider>;
}

export function useAssetBase() {
  return useContext(AssetBaseContext);
}
