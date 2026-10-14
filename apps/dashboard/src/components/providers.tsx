"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Tooltip } from "radix-ui";
import { useState } from "react";

import { CommandMenu } from "./command";
import { ToastProvider } from "./toast";

/** Live dashboard: every query on screen re-fetches this often while the tab is visible. */
export const LIVE_MS = 30_000;

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000, retry: 1, refetchInterval: LIVE_MS, refetchIntervalInBackground: false, refetchOnWindowFocus: true } },
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
