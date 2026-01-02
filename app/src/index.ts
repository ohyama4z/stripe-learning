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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  console.log('webhookSecret:', webhookSecret ? webhookSecret.slice(0, 10) + '...' : 'undefined')
  return c.json({ webhookSecret })
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

// Stripe Webhook エンドポイント
app.post('/api/stripe/webhook', async c => {
  console.log('Received webhook request')
  const signature = c.req.header('Stripe-Signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const rawBody = await c.req.text()

  // TODO(human): 署名検証とイベント処理を実装してください
  // 1. signature が存在しない場合は 400 エラーを返す
  if (!signature) {
    return c.text('Missing stripe-signature header', 400)
  }
  // 2. stripe.webhooks.constructEvent() で署名検証（try-catchで囲む）
  try {
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    )


    // 4. event.type が 'checkout.session.completed' の場合、session情報をログ出力
    if (event.type === 'checkout.session.completed') {
      console.log('Checkout Session completed:', event.data.object)
    }

    return c.json({ received: true }, 200);
  } catch (err) {
    // 3. 検証失敗時は 400 エラーを返す
    console.error('Err: ', err)
    return c.text('Webhook signature verification failed', 400)
  }

})

export default {
  port: 3001,
  fetch: app.fetch,
}
