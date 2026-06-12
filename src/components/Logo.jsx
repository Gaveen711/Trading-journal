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
      <span className="text-2xl md:text-[20px] font-bold tracking-tight text-foreground inline-block transition-transform duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-pointer">
        Xau Journal<span className="text-primary">.</span>
      </span>
    </div>
  );
}
