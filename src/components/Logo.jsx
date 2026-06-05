import React from 'react';

export function XauEmblem({ className = 'w-6 h-6' }) {
  return (
    <img 
      src="/favicon.png" 
      className={`${className} rounded-full object-contain`} 
      alt="XAU Emblem" 
    />
  );
}

export default function Logo({ className = '', iconSize = 'w-6 h-6', onlyIcon = false }) {
  if (onlyIcon) {
    return <XauEmblem className={iconSize} />;
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo-horizontal.png" 
        className="h-8 md:h-9 object-contain dark:invert" 
        alt="xaujournal" 
      />
    </div>
  );
}
