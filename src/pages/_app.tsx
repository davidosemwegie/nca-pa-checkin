import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { AppProps } from "next/app";
import { useState } from "react";
import { SessionProvider } from "../contexts/session.provider";
import "../styles/globals.css";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { Analytics } from '@vercel/analytics/react';


const queryClient = new QueryClient()

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={pageProps.initialSession}
      >
        <SessionProvider>
          <Component {...pageProps} />
          <Analytics />
        </SessionProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}
export default MyApp;
