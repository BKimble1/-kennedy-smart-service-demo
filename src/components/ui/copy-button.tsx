"use client";

import { Button, type ButtonProps } from "./button";
import { Check, Copy } from "lucide-react";
import * as React from "react";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  onCopied,
  ...props
}: { value: string; label?: string; copiedLabel?: string; onCopied?: () => void } & Omit<
  ButtonProps,
  "onCopy" | "children"
>) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* Clipboard API is unavailable (insecure context) — fall back. */
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing more we can do; the text is on screen and selectable */
      }
      document.body.removeChild(el);
    }
    setCopied(true);
    onCopied?.();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} {...props}>
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
