import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageSEO } from '../lib/seo';

/** Updates title, meta, canonical, and OG tags on each public route change */
export function PageSEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageSEO(pathname);
  }, [pathname]);

  return null;
}
