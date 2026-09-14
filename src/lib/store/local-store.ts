import type {
  ActivityEntry,
  IntakeDraft,
  PartialIntake,
  ServiceRequest,
} from "@/lib/domain/types";
import { composePartial, composeRequest } from "./compose";
import { shortId } from "@/lib/utils/id";
import { SEED_MAX_REFERENCE, buildSeedRequests } from "./seed";
import { STATUS_LABEL, type RequestPatch, type RequestStore } from "./types";

const STORAGE_KEY = "ksd.requests.v1";
const COUNTER_KEY = "ksd.counter.v1";
const CHANNEL = "ksd-sync";

interface Persisted {
  version: 1;
  seededAt: string;
  requests: ServiceRequest[];
}

/**
 * localStorage-backed store.
 *
 * Chosen deliberately for a demo that has to be shareable as a single URL:
 * every visitor gets their own clean copy of the inbox, two people can open the
 * link at once without colliding, and there is no server to keep alive or
 * secure. It implements the same `RequestStore` interface a Postgres-backed
 * production build would.
 *
 * Writes are mirrored to other tabs, which is what makes "submit on your phone,
 * watch it land on the office screen" work in a live demo.
 */
export class LocalRequestStore implements RequestStore {
  private cache: ServiceRequest[] | null = null;
  private listeners = new Set<() => void>();
  private channel: BroadcastChannel | null = null;
  private counter = SEED_MAX_REFERENCE;

  constructor() {
    if (typeof window === "undefined") return;
    window.addEventListener("storage", this.onStorage);
    if ("BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(CHANNEL);
      this.channel.onmessage = () => {
        this.cache = null;
        this.emit(false);
      };
    }
  }

  private onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    this.cache = null;
    this.emit(false);
  };

  private emit(broadcast = true) {
    for (const l of this.listeners) l();
    if (broadcast) this.channel?.postMessage("changed");
  }

  private read(): ServiceRequest[] {
    if (this.cache) return this.cache;
    if (typeof window === "undefined") return buildSeedRequests();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed?.version === 1 && Array.isArray(parsed.requests)) {
          this.cache = parsed.requests;
          this.counter = Number(window.localStorage.getItem(COUNTER_KEY)) || SEED_MAX_REFERENCE;
          return this.cache;
        }
      }
    } catch {
      /* corrupt or unavailable storage — fall through to a fresh seed */
    }
    const seeded = buildSeedRequests();
    this.cache = seeded;
    this.counter = SEED_MAX_REFERENCE;
    this.write(seeded);
    return seeded;
  }

  private write(requests: ServiceRequest[]) {
    this.cache = requests;
    if (typeof window === "undefined") return;
    const payload: Persisted = {
      version: 1,
      seededAt: new Date().toISOString(),
      requests,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.localStorage.setItem(COUNTER_KEY, String(this.counter));
    } catch {
      /*
       * Storage is full or blocked (private browsing). Retry once without photo
       * payloads — the demo keeps working, photos just stop persisting across
       * reloads rather than the whole inbox failing to save.
       */
      try {
        const slim: Persisted = {
          ...payload,
          requests: requests.map((r) => ({
            ...r,
            photos: r.photos.map((p) => (p.placeholder ? p : { ...p, dataUrl: "" })),
          })),
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      } catch {
        /* give up on persistence; the in-memory cache still drives the session */
      }
    }
  }

  list(): ServiceRequest[] {
    return this.read();
  }

  get(id: string): ServiceRequest | undefined {
    return this.read().find((r) => r.id === id || r.reference === id);
  }

  create(draft: IntakeDraft, now = new Date(), replaceId?: string): ServiceRequest {
    const all = this.read();
    const existing = replaceId ? all.find((r) => r.id === replaceId) : undefined;
    if (!existing) this.counter += 1;
    const request = composeRequest(draft, {
      id: existing?.id ?? shortId("req"),
      reference: existing?.reference ?? `KSD-${this.counter}`,
      now,
    });
    this.write(
      existing ? all.map((r) => (r.id === existing.id ? request : r)) : [request, ...all],
    );
    this.emit();
    return request;
  }

  /**
   * Captures a request the moment contact details are valid, part-way through
   * the flow. If the customer finishes, `create` replaces this record in place;
   * if they don't, the office still has a name, a number and the symptoms.
   */
  savePartial(partial: PartialIntake, existingId?: string, now = new Date()): ServiceRequest {
    const all = this.read();
    const existing = existingId ? all.find((r) => r.id === existingId) : undefined;
    if (!existing) this.counter += 1;
    const request = composePartial(partial, {
      id: existing?.id ?? shortId("req"),
      reference: existing?.reference ?? `KSD-${this.counter}`,
      now: existing ? new Date(existing.createdAt) : now,
    });
    this.write(
      existing ? all.map((r) => (r.id === existing.id ? request : r)) : [request, ...all],
    );
    this.emit();
    return request;
  }

  update(id: string, patch: RequestPatch, actor = "Office"): ServiceRequest | undefined {
    const all = this.read();
    const index = all.findIndex((r) => r.id === id || r.reference === id);
    if (index === -1) return undefined;
    const current = all[index];
    const now = new Date().toISOString();
    const activity = [...current.activity];

    if (patch.status && patch.status !== current.status) {
      activity.push({
        id: shortId("act"),
        at: now,
        kind: patch.status === "scheduled" ? "schedule" : "status",
        actor,
        summary: `Status → ${STATUS_LABEL[patch.status]}`,
      });
    }
    if (patch.assignedTech && patch.assignedTech !== current.assignedTech) {
      activity.push({
        id: shortId("act"),
        at: now,
        kind: "assign",
        actor,
        summary: `Assigned to ${patch.assignedTech}`,
      });
    }
    if (patch.officeNotes !== undefined && patch.officeNotes !== current.officeNotes) {
      activity.push({
        id: shortId("act"),
        at: now,
        kind: "note",
        actor,
        summary: "Office note updated",
        detail: patch.officeNotes,
      });
    }

    const updated: ServiceRequest = {
      ...current,
      ...patch,
      activity,
      updatedAt: now,
    };
    const next = [...all];
    next[index] = updated;
    this.write(next);
    this.emit();
    return updated;
  }

  addActivity(id: string, entry: Omit<ActivityEntry, "id" | "at">): ServiceRequest | undefined {
    const all = this.read();
    const index = all.findIndex((r) => r.id === id || r.reference === id);
    if (index === -1) return undefined;
    const now = new Date().toISOString();
    const updated: ServiceRequest = {
      ...all[index],
      updatedAt: now,
      activity: [...all[index].activity, { ...entry, id: shortId("act"), at: now }],
    };
    const next = [...all];
    next[index] = updated;
    this.write(next);
    this.emit();
    return updated;
  }

  reset(): void {
    this.counter = SEED_MAX_REFERENCE;
    const seeded = buildSeedRequests();
    this.write(seeded);
    this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

let singleton: LocalRequestStore | null = null;

export function getStore(): LocalRequestStore {
  if (!singleton) singleton = new LocalRequestStore();
  return singleton;
}
