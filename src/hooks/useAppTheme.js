import { useState, useEffect } from 'react';

export function useAppTheme() {
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('xau-theme');
    return saved === 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Inject custom style to temporarily disable all animations/transitions
    const css = document.createElement('style');
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

    // Apply the class changes
    if (isLightMode) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }

    // Force DOM reflow to apply new styles instantly
    window.getComputedStyle(root).opacity;

    // Immediately remove style block to restore regular interactions
    document.head.removeChild(css);

    localStorage.setItem('xau-theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  return { isLightMode, toggleTheme };
}

