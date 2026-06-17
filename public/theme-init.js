(function() {
  const theme = localStorage.getItem('xau-theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const template = localStorage.getItem('xau-template') || 'sage-modern';
  document.documentElement.classList.add('theme-' + template);
})();
