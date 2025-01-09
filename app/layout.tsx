"use client";

import './global.css';

import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <title></title>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
