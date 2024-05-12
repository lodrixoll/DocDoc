import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../public/styles/global.css';
import '../public/styles/bootstrap.css';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>DocDoc</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;