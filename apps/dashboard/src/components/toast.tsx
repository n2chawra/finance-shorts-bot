"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { Toast } from "radix-ui";
import { createContext, useCallback, useContext, useState } from "react";

type Action = { label: string; onClick: () => void };
type Item = { id: number; text: string; tone: "ok" | "error"; action?: Action };
const Ctx = createContext<(text: string, tone?: Item["tone"], action?: Action) => void>(() => {});

/** `const toast = useToast(); toast("Saved")`, or with a button: `toast("Resolved", "ok", { label: "Undo", onClick })` */
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const push = useCallback((text: string, tone: Item["tone"] = "ok", action?: Action) => {
    setItems((list) => [...list.slice(-2), { id: Date.now() + Math.random(), text, tone, action }]);
  }, []);
  return (
    <Ctx.Provider value={push}>
      <Toast.Provider swipeDirection="right" duration={3200}>
        {children}
        {items.map((t) => (
          <Toast.Root key={t.id} duration={t.action ? 8000 : undefined} onOpenChange={(open) => { if (!open) setItems((list) => list.filter((x) => x.id !== t.id)); }}
            className="flex items-center gap-3 rounded-xl border border-ring bg-surface px-4 py-3 text-[13.5px] shadow-pop data-[state=open]:animate-slide-up data-[state=closed]:animate-fade data-[swipe=end]:translate-x-full">
            {t.tone === "ok" ? <CircleCheck aria-hidden className="size-5 shrink-0 text-good" /> : <CircleAlert aria-hidden className="size-5 shrink-0 text-critical" />}
            <Toast.Description className="flex-1">{t.text}</Toast.Description>
            {t.action && (
              <Toast.Action altText={t.action.label} onClick={t.action.onClick}
                className="rounded-md px-2 py-1 text-[13px] font-semibold text-brand-text hover:bg-brand-soft">{t.action.label}</Toast.Action>
            )}
            <Toast.Close aria-label="Dismiss" className="rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink"><X className="size-4" /></Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-20 right-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2 outline-none lg:bottom-5" />
      </Toast.Provider>
    </Ctx.Provider>
  );
}
