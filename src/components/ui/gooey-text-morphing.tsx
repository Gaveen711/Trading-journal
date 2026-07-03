"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName,
  ...props
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);
  const filterId = React.useId().replace(/:/g, "");
  const textKey = texts.filter(Boolean).join("\\u001f");

  React.useEffect(() => {
    const words = textKey.split("\\u001f").filter(Boolean);

    if (!words.length || !text1Ref.current || !text2Ref.current) {
      return undefined;
    }

    const text1 = text1Ref.current;
    const text2 = text2Ref.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    text1.textContent = words[0];
    text2.textContent = words[1 % words.length] ?? words[0];

    if (reduceMotion || words.length === 1) {
      text1.style.filter = "";
      text1.style.opacity = "100%";
      text2.style.filter = "";
      text2.style.opacity = "0%";
      return undefined;
    }

    let textIndex = words.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let frameId = 0;

    const setMorph = (fraction: number) => {
      const nextFraction = Math.max(fraction, 0.0001);
      text2.style.filter = `blur(${Math.min(8 / nextFraction - 8, 100)}px)`;
      text2.style.opacity = `${Math.pow(nextFraction, 0.4) * 100}%`;

      const currentFraction = Math.max(1 - nextFraction, 0.0001);
      text1.style.filter = `blur(${Math.min(8 / currentFraction - 8, 100)}px)`;
      text1.style.opacity = `${Math.pow(currentFraction, 0.4) * 100}%`;
    };

    const doCooldown = () => {
      morph = 0;
      text2.style.filter = "";
      text2.style.opacity = "100%";
      text1.style.filter = "";
      text1.style.opacity = "0%";
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;

      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    function animate() {
      frameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % words.length;
          text1.textContent = words[textIndex % words.length];
          text2.textContent = words[(textIndex + 1) % words.length];
        }

        doMorph();
      } else {
        doCooldown();
      }
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [textKey, morphTime, cooldownTime]);

  return (
    <span className={cn("relative inline-block align-baseline", className)} {...props}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <span
        className="flex h-full w-full items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[60pt]",
            "text-foreground",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[60pt]",
            "text-foreground",
            textClassName
          )}
        />
      </span>
    </span>
  );
}
