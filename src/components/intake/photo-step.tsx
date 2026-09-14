"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { IntakePhoto, PhotoKind } from "@/lib/domain/types";
import { PHOTO_KIND_LABEL } from "@/lib/store/photo-placeholders";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";
import { processPhoto } from "@/lib/utils/image";
import { Camera, ImagePlus, Loader2, ScanLine, Wrench, X } from "lucide-react";
import * as React from "react";

const SLOTS: { kind: PhotoKind; label: string; hint: string; icon: typeof Camera }[] = [
  {
    kind: "equipment",
    label: PHOTO_KIND_LABEL.equipment,
    hint: "The furnace, outdoor unit or water heater",
    icon: Wrench,
  },
  {
    kind: "problem",
    label: PHOTO_KIND_LABEL.problem,
    hint: "The leak, the damage, the thing that looks wrong",
    icon: Camera,
  },
  {
    kind: "dataplate",
    label: PHOTO_KIND_LABEL.dataplate,
    hint: "The sticker with the model and serial number",
    icon: ScanLine,
  },
];

export function PhotoStep({
  photos,
  onChange,
}: {
  photos: IntakePhoto[];
  onChange: (photos: IntakePhoto[]) => void;
}) {
  const [busy, setBusy] = React.useState<PhotoKind | null>(null);
  const { push } = useToast();
  const inputs = React.useRef<Partial<Record<PhotoKind, HTMLInputElement | null>>>({});

  async function handleFiles(kind: PhotoKind, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setBusy(kind);
    const added: IntakePhoto[] = [];
    for (const file of Array.from(fileList).slice(0, 3)) {
      try {
        added.push(await processPhoto(file, kind));
      } catch (error) {
        push({
          tone: "error",
          title: "Couldn't add that photo",
          description:
            error instanceof Error ? error.message : "Try a different image from your camera roll.",
        });
      }
    }
    setBusy(null);
    if (added.length) {
      onChange([...photos, ...added]);
      push({
        tone: "success",
        title: `${added.length === 1 ? "Photo" : `${added.length} photos`} added`,
      });
    }
  }

  function remove(id: string) {
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-3">
      {SLOTS.map((slot) => {
        const mine = photos.filter((p) => p.kind === slot.kind);
        const Icon = slot.icon;
        const loading = busy === slot.kind;
        return (
          <div
            key={slot.kind}
            className={cn(
              "rounded-xl border bg-white transition-colors",
              mine.length ? "border-brand-200 bg-brand-50/30" : "border-ink-200",
            )}
          >
            <div className="flex items-center gap-3.5 p-4">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg border",
                  mine.length
                    ? "border-brand-200 bg-brand-100 text-brand-700"
                    : "border-ink-200 bg-ink-50 text-ink-500",
                )}
              >
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-ink-900">{slot.label}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{slot.hint}</p>
              </div>
              <Button
                variant={mine.length ? "secondary" : "outline"}
                size="sm"
                loading={loading}
                onClick={() => inputs.current[slot.kind]?.click()}
              >
                {loading ? (
                  <Loader2 aria-hidden />
                ) : mine.length ? (
                  <ImagePlus aria-hidden />
                ) : (
                  <Camera aria-hidden />
                )}
                {mine.length ? "Add" : "Add photo"}
              </Button>
              <input
                ref={(el) => {
                  inputs.current[slot.kind] = el;
                }}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                aria-label={`Add a photo of the ${slot.label.toLowerCase()}`}
                onChange={(e) => {
                  void handleFiles(slot.kind, e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {mine.length ? (
              <div className="flex flex-wrap gap-2.5 border-t border-brand-100 px-4 py-3.5">
                {mine.map((p) => (
                  <figure key={p.id} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.dataUrl}
                      alt={`${slot.label} photo — ${p.name}`}
                      className="size-20 rounded-lg border border-ink-200 object-cover shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      aria-label={`Remove ${p.name}`}
                      className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full border border-ink-200 bg-white text-ink-500 shadow-sm transition-colors hover:bg-danger-50 hover:text-danger-600"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                    <figcaption className="tnum mt-1 text-center text-[10.5px] text-ink-400">
                      {formatBytes(p.sizeBytes)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
