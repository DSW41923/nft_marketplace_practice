import '../styles/globals.css'
import ContextProvider from './context.js'
import Layout from './layout.js'

export default function MyApp({ Component, pageProps }) {
  return (
    <ContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ContextProvider>
  )
}
