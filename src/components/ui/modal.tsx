"use client";

import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import * as React from "react";

/**
 * Dialog built on the native `<dialog>` element: focus trapping, Escape and the
 * top layer come from the platform rather than 30kB of JavaScript.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  tone = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "danger";
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      className={cn(
        "border-ink-200 text-ink-900 shadow-pop backdrop:bg-ink-950/45 m-auto w-[calc(100vw-2rem)] rounded-2xl border bg-white p-0 backdrop:backdrop-blur-[2px]",
        "open:animate-pop",
        size === "sm" && "max-w-sm",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl",
      )}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h2
            id="modal-title"
            className={cn(
              "font-display text-lg font-semibold",
              tone === "danger" ? "text-danger-700" : "text-ink-950",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="text-ink-600 mt-1.5 text-[13px] leading-relaxed">{description}</p>
          ) : null}
        </div>
        <button
          onClick={onClose}
          className="text-ink-400 hover:bg-ink-100 hover:text-ink-800 -m-1.5 rounded-lg p-1.5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {children ? <div className="px-6 py-5">{children}</div> : <div className="h-2" />}
      {footer ? (
        <div className="border-ink-150 bg-ink-50/70 flex flex-wrap justify-end gap-2 border-t px-6 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
