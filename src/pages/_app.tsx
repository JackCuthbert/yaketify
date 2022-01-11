import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Yaketify</title>
        <link rel="icon" type="image/png" href="/saxophone.png" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
