import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// --- Types ---
type CreateProductRequest = {
  name: string
  description?: string
  price: number // 円単位の整数
}

type CreateProductResponse = {
  product: Stripe.Product
  price: Stripe.Price
}

type CreateCheckoutRequest = {
  priceId: string // 決済するPriceのID (price_xxx)
}

type CreateCheckoutResponse = {
  url: string // Stripe Checkoutページへのリダイレクト先URL
}

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


app.get('/api/stripe/test', async c => {
  const balance = await stripe.balance.retrieve()
  return c.json(balance)
})

// 商品と価格を作成するエンドポイント
app.post('/api/stripe/products', async c => {
  const body = await c.req.json<CreateProductRequest>()

  const product = await stripe.products.create({
    name: body.name,
    description: body.description,
  })

  const price = await stripe.prices.create({
    unit_amount: body.price,
    currency: 'jpy',
    product: product.id,
  })

  return c.json({ product, price } satisfies CreateProductResponse)
})

// Checkout Sessionを作成するエンドポイント
app.post('/api/stripe/checkout', async c => {
  const body = await c.req.json<CreateCheckoutRequest>()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: body.priceId, quantity: 1 }],
    success_url: 'http://localhost:5173/success',
    cancel_url: 'http://localhost:5173/cancel',
  })

  return c.json({ url: session.url || '' } satisfies CreateCheckoutResponse)
})

export default {
  port: 3001,
  fetch: app.fetch,
}
