import '@/styles/globals.css';
import { CrowdFundManager } from '../context/Crowdfund';
import Header from '../components/Header';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <CrowdFundManager>
      <Head>
        <link rel="icon" href="/images/logo.jpeg" />
        <title>CrowdFundManager</title>
      </Head>
      <Header/>
      <Component {...pageProps} />
    </CrowdFundManager>
  )
}
