import { useState, useEffect, useRef } from 'react';

export function useAppTheme() {
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('xau-theme');
    return saved === 'light';
  });

  const isInitialMount = useRef(true);

  // ── Apply theme to the DOM ──────────────────────────────────────────────
  useEffect(() => {
    const root = window.document.documentElement;

    let css;
    if (isInitialMount.current) {
      // Disable transitions on initial mount to avoid flash
      css = document.createElement('style');
      css.type = 'text/css';
      css.appendChild(
        document.createTextNode(
          `* {
             -webkit-transition: none !important;
             -moz-transition: none !important;
             -o-transition: none !important;
             -ms-transition: none !important;
             transition: none !important;
           }`
        )
      );
      document.head.appendChild(css);
    } else {
      root.classList.add('theme-toggling');
    }

    if (isLightMode) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }

    if (isInitialMount.current) {
      window.getComputedStyle(root).opacity;
      document.head.removeChild(css);
      isInitialMount.current = false;
    } else {
      const timer = setTimeout(() => {
        root.classList.remove('theme-toggling');
      }, 250);
      return () => clearTimeout(timer);
    }

    localStorage.setItem('xau-theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  // ── Cross-tab sync via storage event ───────────────────────────────────
  // The `storage` event fires in every tab EXCEPT the one that made the change.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key !== 'xau-theme') return;
      const newIsLight = e.newValue === 'light';
      setIsLightMode(newIsLight);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  return { isLightMode, toggleTheme };
}
