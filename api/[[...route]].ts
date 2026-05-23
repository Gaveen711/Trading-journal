import { Hono } from 'hono'
import { handle } from 'hono/vercel'

type Env = {}
type Variables = {}

const app = new Hono<{ Bindings: Env; Variables }>().basePath('/api')

app.get('/', (c) => {
  return c.json({ status: 'success', message: 'API Gateway Online' })
})


app.get('/users/:id', (c) => {
  const userId = c.req.param('id')
  return c.json({ userId, name: 'Alex' })
})

app.post('/data', async (c) => {
  const body = await c.req.json()
  return c.json({ received: true, data: body }, 201)
})


export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)

