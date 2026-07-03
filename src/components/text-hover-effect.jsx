import React, { useRef, useState } from "react";
import { motion as Motion } from "framer-motion";

export function TextHoverEffect({ text, duration, className }) {
  const svgRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMaskPosition({
      cx: `${((e.clientX - rect.left) / rect.width) * 100}%`,
      cy: `${((e.clientY - rect.top) / rect.height) * 100}%`,
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setMaskPosition({ cx: "50%", cy: "50%" });
  };

  const handleTouchMove = (e) => {
    if (!svgRef.current || e.touches.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setMaskPosition({
      cx: `${((touch.clientX - rect.left) / rect.width) * 100}%`,
      cy: `${((touch.clientY - rect.top) / rect.height) * 100}%`,
    });
  };

  const handleTouchStart = (e) => {
    setHovered(true);
    handleTouchMove(e);
  };

  const handleTouchEnd = () => {
    setHovered(false);
    setMaskPosition({ cx: "50%", cy: "50%" });
  };

  return (
    <svg
      ref={svgRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`w-full h-full select-none cursor-default ${className || ""}`}
      viewBox="0 0 1000 120"
    >
      <defs>
        {/* Animated RGB wave gradient */}
        <Motion.linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          animate={{
            x1: hovered ? ["0%", "100%", "0%"] : "0%",
            x2: hovered ? ["100%", "200%", "100%"] : "100%",
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
          y1="0%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#B08A5A" />
          <stop offset="22%" stopColor="#D49224" />
          <stop offset="44%" stopColor="#C95B3C" />
          <stop offset="72%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#B08A5A" />
        </Motion.linearGradient>

        {/* Mask gradient using white (reveal) to black (hide) */}
        <Motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          animate={{
            cx: maskPosition.cx,
            cy: maskPosition.cy,
            r: hovered ? "30%" : "0%"
          }}
          transition={{ type: "tween", ease: "easeOut", duration: duration ?? 0.3 }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </Motion.radialGradient>

        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>

      {/* Static background outline text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        fontSize="90"
        textLength="98%"
        lengthAdjust="spacingAndGlyphs"
        className="font-black stroke-neutral-900/10 dark:stroke-neutral-100/10 fill-transparent select-none uppercase tracking-wider"
        style={{ opacity: hovered ? 0.4 : 1, transition: "opacity 0.3s" }}
      >
        {text}
      </text>

      {/* Hovered text (only shown inside the radial mask) */}
      <Motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        fontSize="90"
        textLength="98%"
        lengthAdjust="spacingAndGlyphs"
        fill="url(#textGradient)"
        stroke="url(#textGradient)"
        mask="url(#textMask)"
        className="font-black select-none uppercase tracking-wider"
      >
        {text}
      </Motion.text>
    </svg>
  );
}
