import type { AvailabilitySelection, AvailabilityWindow } from "@/lib/domain/types";

export const WINDOW_LABEL: Record<AvailabilityWindow, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening / first available",
};

export const WINDOW_RANGE: Record<AvailabilityWindow, string> = {
  morning: "8am – 12pm",
  afternoon: "12pm – 4pm",
  evening: "After 4pm",
};

const WINDOW_ORDER: AvailabilityWindow[] = ["morning", "afternoon", "evening"];

/** `2026-09-16` → `Wed, Sep 16`. Parsed as local time, never UTC-shifted. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateShort(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatWeekday(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", { weekday: "long" });
}

export function isToday(iso: string, now = new Date()): boolean {
  return iso === toISODate(now);
}

export function isTomorrow(iso: string, now = new Date()): boolean {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  return iso === toISODate(t);
}

/**
 * `Monday afternoon or Tuesday morning` — how a person would say it.
 *
 * Weekday names stay capitalized and `today`/`tomorrow` stay lower case, so the
 * string can be dropped mid-sentence without a blanket `toLowerCase()` turning
 * "Wednesday" into "wednesday".
 */
export function formatAvailability(
  slots: AvailabilitySelection[],
  now = new Date(),
  options: { lead?: boolean } = {},
): string {
  const { lead = true } = options;
  const phrases: string[] = [];
  for (const slot of slots) {
    const windows = WINDOW_ORDER.filter((w) => slot.windows.includes(w));
    if (windows.length === 0) continue;
    const dayName = isToday(slot.date, now)
      ? "today"
      : isTomorrow(slot.date, now)
        ? "tomorrow"
        : formatWeekday(slot.date);
    const windowText = windows.length === 3 ? "any time" : windows.join(" or ");
    phrases.push(`${dayName} ${windowText}`);
  }
  if (phrases.length === 0) return lead ? "No preference given" : "no preference given";
  const joined =
    phrases.length === 1
      ? phrases[0]
      : `${phrases.slice(0, -1).join(", ")} or ${phrases[phrases.length - 1]}`;
  return lead ? capitalizeFirst(joined) : joined;
}

/** The mid-sentence form: never capitalizes a leading `today`/`tomorrow`. */
export function availabilityPhrase(slots: AvailabilitySelection[], now = new Date()): string {
  return formatAvailability(slots, now, { lead: false });
}

function capitalizeFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Compact relative time for an inbox: `4m ago`, `3h ago`, `Yesterday`, `Sep 8`. */
export function relativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24 && then.getDate() === now.getDate()) return `${hours}h ago`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (then.toDateString() === yesterday.toDateString()) return "Yesterday";
  const days = Math.floor(diffMs / 86400000);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} at ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

/** `7655551234` → `(765) 555-1234`, preserving whatever the user typed otherwise. */
export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (local.length !== 10) return input;
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
}

export function phoneHref(input: string): string {
  const digits = input.replace(/\D/g, "");
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return `tel:+1${local}`;
}

export function smsHref(input: string, body?: string): string {
  const digits = input.replace(/\D/g, "");
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  const query = body ? `?&body=${encodeURIComponent(body)}` : "";
  return `sms:+1${local}${query}`;
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
