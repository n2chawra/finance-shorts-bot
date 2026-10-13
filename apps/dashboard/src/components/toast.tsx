"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { Toast } from "radix-ui";
import { createContext, useCallback, useContext, useState } from "react";

type Item = { id: number; text: string; tone: "ok" | "error" };
const Ctx = createContext<(text: string, tone?: Item["tone"]) => void>(() => {});

/** `const toast = useToast(); toast("Saved")` */
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const push = useCallback((text: string, tone: Item["tone"] = "ok") => {
    setItems((list) => [...list.slice(-2), { id: Date.now() + Math.random(), text, tone }]);
  }, []);
  return (
    <Ctx.Provider value={push}>
      <Toast.Provider swipeDirection="right" duration={3200}>
        {children}
        {items.map((t) => (
          <Toast.Root key={t.id} onOpenChange={(open) => { if (!open) setItems((list) => list.filter((x) => x.id !== t.id)); }}
            className="flex items-center gap-3 rounded-xl border border-ring bg-surface px-4 py-3 text-sm shadow-lift data-[state=open]:animate-slide-up data-[state=closed]:animate-fade data-[swipe=end]:translate-x-full">
            {t.tone === "ok" ? <CircleCheck aria-hidden className="size-5 shrink-0 text-good" /> : <CircleAlert aria-hidden className="size-5 shrink-0 text-critical" />}
            <Toast.Description className="flex-1">{t.text}</Toast.Description>
            <Toast.Close aria-label="Dismiss" className="rounded-md p-1 text-muted hover:bg-wash hover:text-ink"><X className="size-4" /></Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 outline-none" />
      </Toast.Provider>
    </Ctx.Provider>
  );
}
