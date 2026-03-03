import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ghost AI — 90 AI-режимов',
  description: 'Telegram Bot + Web платформа. Текст, код, изображения, голос, документы.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
