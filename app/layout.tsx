"use client";

import './global.css';

import { useState } from 'react';
import Script from 'next/script'
import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <html lang="en" className={inter.className}>
      <head>
        <title></title>
      </head>
      <body>
        <Script onLoad={() => { setLoaded(true) }} src='https://telegram.org/js/telegram-web-app.js?56' ></Script>
        {loaded && children}
      </body>
    </html>
  )
}
