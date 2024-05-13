import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import '../public/styles/global.css';
import '../public/styles/bootstrap.css';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider session={pageProps.session}>
            <Head>
                <title>DocDoc</title>
            </Head>
            <Component {...pageProps} />
        </SessionProvider>
    );
}

export default MyApp;