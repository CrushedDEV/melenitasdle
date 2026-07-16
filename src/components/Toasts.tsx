"use client";

import { useCallback, useState } from "react";
import { AlertIcon, CheckIcon, InfoIcon } from "./Icon";

export type ToastKind = "success" | "error" | "info";
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/** Hook ligero para gestionar notificaciones temporales. */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback(
    (kind: ToastKind, message: string, ms = 2600) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, message }]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, ms);
    },
    [],
  );

  return { toasts, notify };
}

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === "success" ? (
            <CheckIcon size={18} />
          ) : t.kind === "error" ? (
            <AlertIcon size={18} />
          ) : (
            <InfoIcon size={18} />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
