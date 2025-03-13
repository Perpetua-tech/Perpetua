import React from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SWRConfig } from 'swr';
import axios from 'axios';

import createEmotionCache from '@/utils/createEmotionCache';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import Layout from '@/components/layout/Layout';
import { AuthProvider } from '@/context/AuthContext';
import WalletContextProvider from '@/context/WalletContext';

// Client-side cache, shared for the whole session of the user in the browser
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <SWRConfig 
            value={{
              fetcher: (url: string) => axios.get(url).then(res => res.data),
              onError: (err) => {
                console.error(err);
              }
            }}
          >
            <AuthProvider>
              <WalletContextProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </WalletContextProvider>
            </AuthProvider>
          </SWRConfig>
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 