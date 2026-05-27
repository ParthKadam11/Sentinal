import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import chatRoute from './routes/chat.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/chat',chatRoute)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
