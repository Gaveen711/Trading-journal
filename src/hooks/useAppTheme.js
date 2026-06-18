import { useState, useEffect, useRef, createContext, useContext, createElement } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('xau-theme');
    return saved !== 'dark';
  });

  const [currentTemplate, setTemplateState] = useState(() => {
    return localStorage.getItem('xau-template') || 'sage-modern';
  });

  const [pathname, setPathname] = useState(window.location.pathname);
  const isInitialMount = useRef(true);

  // ── Track location changes for theme scoping ────────────────────────────
  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // ── Apply theme & template to the DOM ──────────────────────────────────
  useEffect(() => {
    const root = window.document.documentElement;
    const isAppPath = pathname.startsWith('/app');

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

    if (isAppPath) {
      if (isLightMode) {
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
      }

      // Update template classes on the HTML element
      root.classList.forEach(className => {
        if (className.startsWith('theme-') && className !== 'theme-toggling') {
          root.classList.remove(className);
        }
      });
      root.classList.add(`theme-${currentTemplate}`);
    } else {
      // On landing pages/public routes, force standard dark mode and no custom template accent
      root.classList.add('dark');
      root.classList.forEach(className => {
        if (className.startsWith('theme-') && className !== 'theme-toggling') {
          root.classList.remove(className);
        }
      });
    }

    localStorage.setItem('xau-theme', isLightMode ? 'light' : 'dark');
    localStorage.setItem('xau-template', currentTemplate);

    if (isInitialMount.current) {
      window.getComputedStyle(root).opacity;
      document.head.removeChild(css);
      isInitialMount.current = false;
    } else {
      // Remove class on next frame — transitions are instant, no delay needed
      requestAnimationFrame(() => {
        root.classList.remove('theme-toggling');
      });
    }
  }, [isLightMode, currentTemplate, pathname]);

  // ── Cross-tab sync via storage event ───────────────────────────────────
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'xau-theme') {
        setIsLightMode(e.newValue === 'light');
      } else if (e.key === 'xau-template') {
        setTemplateState(e.newValue || 'sage-modern');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  const setTemplate = (templateName) => {
    setTemplateState(templateName);
  };

  return createElement(
    ThemeContext.Provider,
    { value: { isLightMode, toggleTheme, currentTemplate, setTemplate } },
    children
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
