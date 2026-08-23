import { useEffect, useRef } from 'react';
import './BackgroundPixelStars.css';

const STAR_COLORS = ['#ffffff', '#fff3b0', '#b9c9ff', '#c7f7d4', '#ffd2dc'];
const STAR_DENSITY = 0.00004;
const PIXEL_SIZE = 5;
const TARGET_FPS = 16;

function createStar(width, height) {
  const baseOpacity = Math.random() * 0.45 + 0.3;

  return {
    x: Math.floor(Math.random() * (width / PIXEL_SIZE)) * PIXEL_SIZE,
    y: Math.floor(Math.random() * (height / PIXEL_SIZE)) * PIXEL_SIZE,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    baseOpacity,
    opacity: baseOpacity,
    twinkles: Math.random() < 0.7,
    speed: Math.random() * 2 + 2,
    direction: -1,
    elapsed: 0,
  };
}

export function BackgroundPixelStars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frameInterval = 1000 / TARGET_FPS;
    const stars = [];
    let shootingStars = [];
    let animationFrame;
    let shootingStarTimer;
    let lastFrame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars.length = 0;
      const starCount = Math.max(18, Math.floor(width * height * STAR_DENSITY));
      for (let index = 0; index < starCount; index += 1) {
        stars.push(createStar(width, height));
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        context.fillStyle = star.color;
        context.globalAlpha = star.opacity;
        context.fillRect(star.x, star.y, PIXEL_SIZE, PIXEL_SIZE);
      });

      shootingStars.forEach((star) => {
        star.trail.forEach((point) => {
          context.fillStyle = '#c7f7ff';
          context.globalAlpha = point.opacity;
          context.fillRect(point.x, point.y, 2, 2);
        });

        context.fillStyle = '#ffffff';
        context.globalAlpha = 1;
        context.fillRect(star.x, star.y, 8, 2);
        context.fillRect(star.x + 2, star.y - 2, 4, 6);
      });

      context.globalAlpha = 1;
    };

    const update = () => {
      stars.forEach((star) => {
        if (!star.twinkles) return;

        star.elapsed += 1 / TARGET_FPS;
        if (star.elapsed >= star.speed) {
          star.elapsed = 0;
          star.direction *= -1;
        }
        star.opacity = star.direction < 0 ? star.baseOpacity * 0.3 : star.baseOpacity;
      });

      shootingStars = shootingStars
        .map((star) => {
          const radians = (star.angle * Math.PI) / 180;
          const nextX = star.x + star.speed * Math.cos(radians);
          const nextY = star.y + star.speed * Math.sin(radians);
          const trail = [...star.trail, { x: star.x, y: star.y, opacity: 1 }]
            .map((point) => ({ ...point, opacity: point.opacity - 0.11 }))
            .filter((point) => point.opacity > 0);

          return { ...star, x: nextX, y: nextY, trail };
        })
        .filter((star) => star.x > -20 && star.x < width + 20 && star.y > -20 && star.y < height + 20);
    };

    const animate = (timestamp) => {
      if (timestamp - lastFrame >= frameInterval) {
        lastFrame = timestamp;
        update();
        draw();
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    const scheduleShootingStar = () => {
      shootingStars = [
        ...shootingStars,
        {
          x: Math.random() * width,
          y: 0,
          angle: 45 + Math.random() * 90,
          speed: Math.random() * 5 + 8,
          trail: [],
        },
      ];
      shootingStarTimer = window.setTimeout(scheduleShootingStar, Math.random() * 4000 + 2000);
    };

    const stopMotion = () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
      if (shootingStarTimer !== undefined) {
        window.clearTimeout(shootingStarTimer);
        shootingStarTimer = undefined;
      }
    };

    const startMotion = () => {
      if (reducedMotion || document.visibilityState === 'hidden' || animationFrame !== undefined) return;
      lastFrame = performance.now();
      animationFrame = window.requestAnimationFrame(animate);
      scheduleShootingStar();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopMotion();
      else startMotion();
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    if (!reducedMotion) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      startMotion();
    }

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopMotion();
    };
  }, []);

  return <canvas ref={canvasRef} className="background-pixel-stars" aria-hidden="true" />;
}
