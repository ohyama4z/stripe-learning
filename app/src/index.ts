import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(logger())
app.use(
  cors({
    origin: origin => origin,
  })
)

app.get('/', c => {
  return c.text('hono api server is running')
})

app.get('/api/hello', c => {
  return c.json({ message: 'Hello Hono!' })
})

export default {
  port: 3001,
  fetch: app.fetch,
}
