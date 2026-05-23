import { Hono } from 'hono'
import { handle } from 'hono/vercel'

type Env = {}
type Variables = {}

const app = new Hono<{ Bindings: Env; Variables }>().basePath('/api')

// Example 1: Simple GET request
app.get('/hello', (c) => {
  return c.json({ message: 'Hello from the monolith!' })
})

// Example 2: Dynamic Route (e.g., /api/user/123)
app.get('/user/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ userId: id, status: 'active' })
})

// Example 3: POST Request
app.post('/submit', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, received: body })
})

// Export handlers for Vercel
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
