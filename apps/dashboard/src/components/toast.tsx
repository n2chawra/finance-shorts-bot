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
            className="flex items-stretch border-2 border-edge bg-surface text-sm font-semibold shadow-[5px_5px_0_0_var(--hard)] data-[state=open]:animate-slide-up data-[state=closed]:animate-fade data-[swipe=end]:translate-x-full">
            <span className={`grid w-11 shrink-0 place-items-center border-r-2 border-edge on-accent ${t.tone === "ok" ? "bg-lime" : "bg-red"}`}>
              {t.tone === "ok" ? <CircleCheck aria-hidden strokeWidth={2.5} className="size-5" /> : <CircleAlert aria-hidden strokeWidth={2.5} className="size-5" />}
            </span>
            <Toast.Description className="flex flex-1 items-center px-3 py-3">{t.text}</Toast.Description>
            {t.action && (
              <Toast.Action altText={t.action.label} onClick={t.action.onClick}
                className="my-2 border-2 border-edge bg-sun px-2.5 text-xs font-bold uppercase tracking-wide text-on-accent shadow-[2px_2px_0_0_var(--hard)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">{t.action.label}</Toast.Action>
            )}
            <Toast.Close aria-label="Dismiss" className="px-2.5 text-ink hover:bg-wash-2"><X strokeWidth={2.5} className="size-4" /></Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-20 right-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3 outline-none md:bottom-6" />
      </Toast.Provider>
    </Ctx.Provider>
  );
}
