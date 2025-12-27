import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'

type ProductResult = {
  product: { id: string; name: string }
  price: { id: string; unit_amount: number }
}

// ─── ホームページ（商品作成） ───
function HomePage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [result, setResult] = useState<ProductResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
        }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!result?.price.id) return
    setCheckoutLoading(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: result.price.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          🛍️ Stripe 商品作成
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: プレミアムプラン"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="例: すべての機能が使えるプランです"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              価格（円）
            </label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="例: 1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '作成中...' : '商品を作成'}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-2">✅ 商品が作成されました</h2>
              <p className="text-gray-600">{result.product.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ¥{result.price.unit_amount?.toLocaleString()}
              </p>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mt-4 w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {checkoutLoading ? '処理中...' : '💳 この商品を購入する'}
              </button>
            </div>

            <details className="bg-gray-900 text-green-400 p-4 rounded-lg">
              <summary className="cursor-pointer text-sm">APIレスポンス (デバッグ用)</summary>
              <pre className="text-sm mt-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 決済成功ページ ───
function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">決済が完了しました！</h1>
        <p className="text-gray-600 mb-6">
          ご購入ありがとうございます。
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  )
}

// ─── 決済キャンセルページ ───
function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">決済がキャンセルされました</h1>
        <p className="text-gray-600 mb-6">
          またのご利用をお待ちしております。
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  )
}

// ─── ルーティング ───
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/cancel" element={<CancelPage />} />
    </Routes>
  )
}

export default App
