"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Tooltip } from "radix-ui";
import { useState } from "react";

import { ToastProvider } from "./toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1 } } }));
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <QueryClientProvider client={client}>
        <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 32 }}>
          <Tooltip.Provider delayDuration={250}>
            <ToastProvider>{children}</ToastProvider>
          </Tooltip.Provider>
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
