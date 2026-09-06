export const metadata = {
  title: 'タスクアプリ',
  description: '秘密のタスク管理',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
