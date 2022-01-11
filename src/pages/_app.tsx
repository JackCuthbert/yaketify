import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'

import Seo from '@bradgarropy/next-seo'

const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
const isVercel = vercelUrl != null

function getUrl(): string {
  if (typeof window === 'undefined') {
    return isVercel ? `https://${vercelUrl}` : ''
  }

  return isVercel
    ? `https://${vercelUrl}`
    : window.location.href.slice(0, window.location.href.length - 1)
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Seo
        title="Yaketify"
        description="Ever wanted to put Yakety Sax over your silent screen recordings? Me neither!"
        icon="/saxophone.png"
        facebook={{
          image: getUrl() + '/saxophone.png',
          type: 'website'
        }}
        twitter={{
          image: getUrl() + '/saxophone.png',
          card: 'summary'
        }}
      />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
