(function() {
  const theme = localStorage.getItem('xau-theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const template = localStorage.getItem('xau-template') || 'sage-modern';
  document.documentElement.classList.add('theme-' + template);

  // The public site is art-directed dark only — no preference to read, the
  // attribute is simply stamped before first paint. Kept separate from the
  // app's 'xau-theme' above, which still honours the user's choice.
  document.documentElement.setAttribute('data-xj-theme', 'dark');
})();
