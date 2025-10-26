// 共通ユーティリティ関数のサンプル

export function formatDate(date: Date): string {
  return date.toISOString()
}

export function greeting(name: string): string {
  return `Hello, ${name}!`
}
