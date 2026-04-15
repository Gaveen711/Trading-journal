// api/log-trade.js
// ⚠️  DEPRECATED — superseded by api/sync-trade.js
// Kept for backwards compatibility. Redirects callers to the new endpoint.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  return res.status(301).json({
    error:   'Endpoint moved',
    message: 'Please update your EA EndpointURL to /api/sync-trade',
    newUrl:  '/api/sync-trade',
  });
}
