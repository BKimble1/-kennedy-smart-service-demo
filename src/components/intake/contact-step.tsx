"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Label, Textarea } from "@/components/ui/field";
import { SERVICE_AREA_TOWNS } from "@/lib/domain/business";
import type { ContactMethod, PropertyType } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { formatPhone } from "@/lib/utils/format";
import { Building2, Home, Mail, MessageSquare, Phone, Wand2 } from "lucide-react";
import * as React from "react";
import type { CustomerForm } from "./use-intake";

export interface ContactErrors {
  name?: string;
  phone?: string;
  email?: string;
  address1?: string;
  city?: string;
  zip?: string;
}

const PHONE_DIGITS = /^\d{10}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP = /^\d{5}$/;

export function validateContact(c: CustomerForm): ContactErrors {
  const errors: ContactErrors = {};
  if (!c.name.trim() || c.name.trim().length < 2)
    errors.name = "We need a name for the work order.";
  const digits = c.phone.replace(/\D/g, "");
  if (
    !PHONE_DIGITS.test(
      digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits,
    )
  ) {
    errors.phone = "Enter a 10-digit phone number.";
  }
  if (c.contactMethod === "email" || c.email.trim()) {
    if (!EMAIL.test(c.email.trim())) errors.email = "Check the email address.";
  }
  if (!c.address1.trim()) errors.address1 = "We need a street address to dispatch a truck.";
  if (!c.city.trim()) errors.city = "Which town?";
  if (!ZIP.test(c.zip.trim())) errors.zip = "Enter a 5-digit ZIP.";
  return errors;
}

/**
 * Deliberately someone who is *not* in the seeded inbox, so a request submitted
 * during a demo is instantly distinguishable from the fifteen already there.
 */
const SAMPLE: CustomerForm = {
  name: "Megan Ruhl",
  phone: "(765) 555-0164",
  email: "megan.ruhl@example.com",
  address1: "1206 W Euclid Ave",
  city: "Marion",
  zip: "46952",
  contactMethod: "phone",
  returning: false,
};

const METHODS: { id: ContactMethod; label: string; icon: typeof Phone }[] = [
  { id: "phone", label: "Call me", icon: Phone },
  { id: "text", label: "Text me", icon: MessageSquare },
  { id: "email", label: "Email me", icon: Mail },
];

export function ContactStep({
  value,
  onChange,
  propertyType,
  onPropertyType,
  notes,
  onNotes,
  errors,
}: {
  value: CustomerForm;
  onChange: (v: CustomerForm) => void;
  propertyType: PropertyType;
  onPropertyType: (p: PropertyType) => void;
  notes: string;
  onNotes: (n: string) => void;
  errors: ContactErrors;
}) {
  const set = <K extends keyof CustomerForm>(key: K, v: CustomerForm[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-5">
      <div className="border-brand-200 bg-brand-50/50 flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3">
        <p className="text-brand-900 text-[12.5px] leading-snug">
          <span className="font-semibold">Demo tip:</span> fill this in with sample Indiana
          details instead of typing your own.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(SAMPLE)}
          className="shrink-0 bg-white"
        >
          <Wand2 aria-hidden />
          Fill sample
        </Button>
      </div>

      <fieldset>
        <legend className="text-ink-800 mb-2 text-[13px] font-medium">
          Is this a home or a business?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "home" as const, label: "Home", icon: Home },
              { id: "business" as const, label: "Business", icon: Building2 },
            ] satisfies { id: PropertyType; label: string; icon: typeof Home }[]
          ).map((o) => {
            const active = propertyType === o.id;
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onPropertyType(o.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-[14px] font-medium transition-colors",
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-900 ring-brand-500/15 ring-2"
                    : "border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50 bg-white",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label="Your name" required htmlFor="c-name" error={errors.name}>
        <Input
          id="c-name"
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
          placeholder="First and last name"
          invalid={Boolean(errors.name)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" required htmlFor="c-phone" error={errors.phone}>
          <Input
            id="c-phone"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={(e) => set("phone", formatPhone(e.target.value))}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(765) 555-0142"
            invalid={Boolean(errors.phone)}
          />
        </Field>
        <Field
          label="Email"
          htmlFor="c-email"
          error={errors.email}
          hint={
            value.contactMethod === "email" ? undefined : "Optional, but handy for the receipt"
          }
        >
          <Input
            id="c-email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
          />
        </Field>
      </div>

      <Field label="Service address" required htmlFor="c-address" error={errors.address1}>
        <Input
          id="c-address"
          value={value.address1}
          onChange={(e) => set("address1", e.target.value)}
          autoComplete="address-line1"
          placeholder="Street address"
          invalid={Boolean(errors.address1)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
        <Field label="City / town" required htmlFor="c-city" error={errors.city}>
          <Input
            id="c-city"
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            autoComplete="address-level2"
            list="ksd-towns"
            placeholder="Marion"
            invalid={Boolean(errors.city)}
          />
          <datalist id="ksd-towns">
            {[...new Set(SERVICE_AREA_TOWNS.map((t) => t.city))].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="ZIP" required htmlFor="c-zip" error={errors.zip}>
          <Input
            id="c-zip"
            value={value.zip}
            onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="46952"
            invalid={Boolean(errors.zip)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-ink-800 mb-2 text-[13px] font-medium">
          How should the office reach you?
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => {
            const active = value.contactMethod === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => set("contactMethod", m.id)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[13px] font-medium transition-colors",
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-900 ring-brand-500/15 ring-2"
                    : "border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50 bg-white",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {m.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="c-notes">Anything else we should know?</Label>
        <p className="text-ink-500 mt-1 mb-1.5 text-xs">
          Optional. Gate codes, dogs, where to park, the best door to knock on.
        </p>
        <Textarea
          id="c-notes"
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="The side gate is unlocked; the furnace is in the back of the basement."
        />
      </div>

      <label className="border-ink-200 flex cursor-pointer items-start gap-2.5 rounded-lg border bg-white p-3.5">
        <input
          type="checkbox"
          checked={value.returning}
          onChange={(e) => set("returning", e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[oklch(0.436_0.104_248)]"
        />
        <span className="text-ink-700 text-[13.5px] leading-snug">
          I&apos;ve used Kennedy&apos;s before
          <span className="text-ink-500 mt-0.5 block text-[12px]">
            Helps the office find your history before they call.
          </span>
        </span>
      </label>
    </div>
  );
}
