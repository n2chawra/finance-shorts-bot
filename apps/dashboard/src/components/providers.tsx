"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Tooltip } from "radix-ui";
import { useState } from "react";

import { CommandMenu } from "./command";
import { ToastProvider } from "./toast";

/**
 * Every query on screen re-fetches this often while the tab is visible. Was 30 s: an open dashboard then
 * re-read the same pages ~120 times an hour and alone used ~300 MB of Supabase egress a day (free plan:
 * 5 GB a month; 2026-11-23). The data behind it changes every 20 min (publish) to 3 h (stats) anyway.
 */
export const LIVE_MS = 5 * 60_000;

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchInterval: LIVE_MS, refetchIntervalInBackground: false, refetchOnWindowFocus: true } },
  }));
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <QueryClientProvider client={client}>
        <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 32 }}>
          <Tooltip.Provider delayDuration={250}>
            <ToastProvider><CommandMenu>{children}</CommandMenu></ToastProvider>
          </Tooltip.Provider>
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
