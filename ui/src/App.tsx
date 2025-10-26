import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function App() {
  const { data, error, isLoading } = useSWR<{ message: string }>('/api/hello', fetcher)

  if (error) return <div>エラー: {error.message}</div>
  if (isLoading) return <div>読み込み中...</div>

  return <div>{data?.message}</div>
}

export default App
