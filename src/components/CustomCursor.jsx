import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function CustomCursor() {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  useEffect(() => {
    if (isApp) return;

    // Inject cursor styles dynamically if they aren't already there
    const id = "xj-custom-cursor-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = `
        #xj-cursor {
          position: fixed;
          width: 10px; height: 10px;
          background: #7c3aed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%,-50%);
          transition: transform 0.08s linear, width 0.3s ease, height 0.3s ease, background 0.3s ease;
          mix-blend-mode: difference;
          opacity: 0;
        }
        #xj-cursor-ring {
          position: fixed;
          width: 36px; height: 36px;
          border: 1.5px solid #a78bfa;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%,-50%);
          transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), width 0.4s ease, height 0.4s ease, opacity 0.3s ease;
          opacity: 0;
        }
      `;
      document.head.appendChild(tag);
    }

    const cursor = document.getElementById('xj-cursor');
    const ring = document.getElementById('xj-cursor-ring');
    let mx = -100, my = -100, rx = -100, ry = -100;
    const isDesktop = window.innerWidth > 900;

    const handleMouseMove = e => {
      mx = e.clientX;
      my = e.clientY;
      if (cursor && ring) {
        cursor.style.opacity = '1';
        ring.style.opacity = '0.6';
      }
    };

    if (isDesktop) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    let cursorRaf;
    function animCursor() {
      if (cursor && ring) {
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
      }
      cursorRaf = requestAnimationFrame(animCursor);
    }

    if (isDesktop) {
      animCursor();
    }

    // Dynamic hover listeners for links/buttons/etc.
    const setupHoverListeners = () => {
      const hoverables = document.querySelectorAll('button, a, .xj-story-dot, .xj-fcard, [role="button"], .cta');
      const onEnter = () => {
        if (cursor && ring) {
          cursor.style.width = '20px';
          cursor.style.height = '20px';
          ring.style.width = '56px';
          ring.style.height = '56px';
          ring.style.opacity = '0.4';
        }
      };
      const onLeave = () => {
        if (cursor && ring) {
          cursor.style.width = '10px';
          cursor.style.height = '10px';
          ring.style.width = '36px';
          ring.style.height = '36px';
          ring.style.opacity = '0.6';
        }
      };

      hoverables.forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });

      return { hoverables, onEnter, onLeave };
    };

    let hoverData;
    let observer;
    if (isDesktop) {
      hoverData = setupHoverListeners();
      
      // Set up observer to re-bind on dynamic route/DOM changes
      observer = new MutationObserver(() => {
        hoverData = setupHoverListeners();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (isDesktop) {
        document.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(cursorRaf);
        if (observer) observer.disconnect();
        if (hoverData) {
          hoverData.hoverables.forEach(el => {
            el.removeEventListener('mouseenter', hoverData.onEnter);
            el.removeEventListener('mouseleave', hoverData.onLeave);
          });
        }
      }
    };
  }, [location.pathname, isApp]);

  if (isApp) return null;

  return (
    <>
      <div id="xj-cursor" />
      <div id="xj-cursor-ring" />
    </>
  );
}
