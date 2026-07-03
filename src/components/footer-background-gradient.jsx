import React from "react";

export default function FooterBackgroundGradient() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blurred glowing orbs matching Xau Journal's gold primary accent */}
      <div 
        className="absolute -bottom-48 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-70 animate-pulse" 
        style={{ animationDuration: '8s' }} 
      />
      <div 
        className="absolute -bottom-48 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] opacity-50 animate-pulse" 
        style={{ animationDuration: '12s' }} 
      />
    </div>
  );
}
