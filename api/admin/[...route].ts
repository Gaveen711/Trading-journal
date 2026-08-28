// Vercel's Vite build can resolve a nested API catch-all more reliably than a
// root catch-all when a static SPA rewrite is also configured. Re-export the
// single secured Hono router through named Web handlers; there is no second
// router or auth boundary.
export { app } from '../[...route].js'
export { GET, POST, PUT, PATCH, DELETE, OPTIONS } from '../[...route].js'
