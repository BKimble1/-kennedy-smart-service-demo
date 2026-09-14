import { QUESTION_BANK, getCategory, getIssue } from "@/lib/domain/catalog";
import { collectSignals, runTriage } from "@/lib/domain/triage";
import type {
  ActivityEntry,
  AvailabilityWindow,
  ContactMethod,
  IntakeAnswer,
  PhotoKind,
  PropertyType,
  RequestStatus,
  SafetyFlagId,
  ServiceCategoryId,
  ServiceRequest,
  UrgencyId,
} from "@/lib/domain/types";
import { toISODate } from "@/lib/utils/format";
import { placeholderPhoto } from "./photo-placeholders";
import { STATUS_LABEL } from "./types";

/**
 * Seeded inbox.
 *
 * Every person, address and phone number below is invented. The towns and ZIP
 * codes are real places inside the service area so the map of the business is
 * recognizable — nothing else is.
 *
 * The mix is deliberate: one live emergency, one safety-flagged record, two
 * after-hours arrivals, two estimate opportunities, and a spread of statuses so
 * the pipeline isn't empty on any column.
 */

interface SeedAnswer {
  q: string;
  v?: string[];
  text?: string;
}

interface SeedSpec {
  ref: number;
  minutesAgo: number;
  /**
   * Force this request onto a specific wall-clock time on its own day. Used for
   * the after-hours examples so the record still reads as an overnight arrival
   * whatever time of day the demo is opened.
   */
  pinTime?: { hour: number; minute: number };
  channel?: "web" | "phone" | "text";
  propertyType?: PropertyType;
  category: ServiceCategoryId;
  issueId: string;
  urgency: UrgencyId;
  answers: SeedAnswer[];
  safetyFlags?: SafetyFlagId[];
  photos?: PhotoKind[];
  availability: { dayOffset: number; windows: AvailabilityWindow[] }[];
  notes?: string;
  officeNotes?: string;
  status: RequestStatus;
  assignedTech?: string;
  scheduledFor?: { dayOffset: number; window: AvailabilityWindow };
  customer: {
    name: string;
    phone: string;
    email: string;
    address1: string;
    city: string;
    zip: string;
    contactMethod: ContactMethod;
    returning?: boolean;
  };
}

const SEEDS: SeedSpec[] = [
  {
    ref: 4207,
    minutesAgo: 11,
    category: "plumbing",
    issueId: "leak",
    urgency: "emergency",
    answers: [
      { q: "water-active", v: ["running"] },
      { q: "water-shutoff", v: ["cant-find"] },
      { q: "leak-location", v: ["ceiling-wall"] },
      { q: "started-when", v: ["today"] },
    ],
    photos: ["problem"],
    availability: [{ dayOffset: 0, windows: ["morning", "afternoon", "evening"] }],
    notes: "It's coming through the dining room ceiling and I can't find the shutoff anywhere.",
    status: "new",
    customer: {
      name: "Denise Ahlgren",
      phone: "7655550188",
      email: "d.ahlgren@example.com",
      address1: "1408 W Bradford St",
      city: "Marion",
      zip: "46952",
      contactMethod: "phone",
    },
  },
  {
    ref: 4206,
    minutesAgo: 37,
    category: "cooling",
    issueId: "warm-air",
    urgency: "today",
    answers: [
      { q: "cooling-state", v: ["runs-no-cool"] },
      { q: "outdoor-unit", v: ["yes"] },
      { q: "started-when", v: ["yesterday"] },
      { q: "equipment-age", v: ["10-15"] },
    ],
    photos: ["equipment", "dataplate"],
    availability: [
      { dayOffset: 1, windows: ["afternoon"] },
      { dayOffset: 2, windows: ["morning"] },
    ],
    status: "new",
    customer: {
      name: "Sarah Whitcomb",
      phone: "7655550142",
      email: "sarah.whitcomb@example.com",
      address1: "3127 S Boots St",
      city: "Marion",
      zip: "46953",
      contactMethod: "phone",
      returning: true,
    },
  },
  {
    ref: 4205,
    minutesAgo: 52,
    category: "plumbing",
    issueId: "sump-pump",
    urgency: "today",
    answers: [
      { q: "sump-state", v: ["constant"] },
      { q: "weather-context", v: ["yes"] },
      { q: "equipment-age", v: ["5-10"] },
    ],
    availability: [{ dayOffset: 0, windows: ["afternoon", "evening"] }],
    notes: "Basement floor is damp at the edges. Pump hasn't shut off since last night.",
    status: "new",
    customer: {
      name: "Trevor Nussbaum",
      phone: "7655550119",
      email: "tnussbaum@example.com",
      address1: "615 E Sycamore St",
      city: "Gas City",
      zip: "46933",
      contactMethod: "text",
    },
  },
  {
    ref: 4204,
    minutesAgo: 165,
    category: "heating",
    issueId: "noise",
    urgency: "next-available",
    answers: [
      { q: "noise-type", v: ["grind", "rattle"] },
      { q: "noise-when", v: ["running"] },
      { q: "heating-state", v: ["runs-weak"] },
      { q: "equipment-age", v: ["15-plus"] },
    ],
    photos: ["equipment"],
    availability: [
      { dayOffset: 2, windows: ["morning"] },
      { dayOffset: 3, windows: ["morning", "afternoon"] },
    ],
    status: "new",
    customer: {
      name: "Ray Kolodziej",
      phone: "7655550163",
      email: "rkolodziej@example.com",
      address1: "204 N Main St",
      city: "Fairmount",
      zip: "46928",
      contactMethod: "phone",
    },
  },
  {
    ref: 4203,
    minutesAgo: 196,
    category: "install",
    issueId: "water-heater",
    urgency: "next-available",
    answers: [
      { q: "hot-water-state", v: ["runs-out"] },
      { q: "water-heater-type", v: ["gas-tank"] },
      { q: "replace-timing", v: ["weeks"] },
      { q: "financing-interest", v: ["yes"] },
    ],
    availability: [
      { dayOffset: 3, windows: ["afternoon"] },
      { dayOffset: 4, windows: ["morning", "afternoon"] },
    ],
    notes: "Tank is original to the house. Two teenagers, we run out constantly.",
    status: "new",
    customer: {
      name: "Priya Raman",
      phone: "7655550174",
      email: "praman@example.com",
      address1: "827 Cardinal Ct",
      city: "Upland",
      zip: "46989",
      contactMethod: "email",
    },
  },
  {
    ref: 4202,
    minutesAgo: 340,
    category: "cooling",
    issueId: "maintenance",
    urgency: "planning",
    answers: [
      { q: "maintenance-scope", v: ["both", "plan"] },
      { q: "maintenance-last", v: ["longer"] },
      { q: "equipment-age", v: ["5-10"] },
    ],
    availability: [
      { dayOffset: 5, windows: ["morning"] },
      { dayOffset: 6, windows: ["morning", "afternoon"] },
    ],
    status: "new",
    customer: {
      name: "Glen Marburger",
      phone: "7655550135",
      email: "gmarburger@example.com",
      address1: "1902 W 3rd St",
      city: "Marion",
      zip: "46952",
      contactMethod: "email",
    },
  },
  {
    ref: 4201,
    minutesAgo: 505,
    channel: "web",
    category: "plumbing",
    issueId: "water-heater",
    urgency: "today",
    answers: [
      { q: "hot-water-state", v: ["none"] },
      { q: "water-heater-type", v: ["electric-tank"] },
      { q: "equipment-age", v: ["10-15"] },
    ],
    photos: ["dataplate"],
    availability: [{ dayOffset: 0, windows: ["afternoon"] }],
    status: "contacted",
    officeNotes:
      "Spoke with Lauren 8:15am. Confirmed breaker is on. Holding a 1–4 slot for her.",
    customer: {
      name: "Lauren Deschene",
      phone: "7655550157",
      email: "ldeschene@example.com",
      address1: "512 S Adams St",
      city: "Marion",
      zip: "46953",
      contactMethod: "phone",
    },
  },
  {
    ref: 4200,
    minutesAgo: 600,
    pinTime: { hour: 21, minute: 15 },
    category: "heating",
    issueId: "smell",
    urgency: "emergency",
    answers: [
      { q: "smell-type", v: ["gas"] },
      { q: "started-when", v: ["today"] },
      { q: "equipment-age", v: ["15-plus"] },
    ],
    safetyFlags: ["gas-odor"],
    availability: [{ dayOffset: 1, windows: ["morning"] }],
    status: "contacted",
    officeNotes:
      "Called immediately. Customer was already outside; gas utility had been out and shut the meter. Furnace tagged. Scheduling a full inspection once they release it.",
    customer: {
      name: "Marcia Oyelaran",
      phone: "7655550126",
      email: "moyelaran@example.com",
      address1: "1130 E 38th St",
      city: "Marion",
      zip: "46953",
      contactMethod: "phone",
    },
  },
  {
    ref: 4199,
    minutesAgo: 740,
    category: "plumbing",
    issueId: "leak",
    urgency: "today",
    answers: [
      { q: "water-active", v: ["drip"] },
      { q: "water-shutoff", v: ["fixture"] },
      { q: "leak-location", v: ["under-sink"] },
      { q: "started-when", v: ["this-week"] },
    ],
    photos: ["problem"],
    availability: [
      { dayOffset: 1, windows: ["morning"] },
      { dayOffset: 1, windows: ["afternoon"] },
    ],
    status: "contacted",
    officeNotes: "Left voicemail 7:40am, texted as well. Awaiting callback.",
    customer: {
      name: "Bill Hartsock",
      phone: "7655550191",
      email: "bhartsock@example.com",
      address1: "78 N Jefferson St",
      city: "Jonesboro",
      zip: "46938",
      contactMethod: "text",
    },
  },
  {
    ref: 4198,
    minutesAgo: 1290,
    propertyType: "business",
    category: "cooling",
    issueId: "not-cooling",
    urgency: "emergency",
    answers: [
      { q: "cooling-state", v: ["short-cycles"] },
      { q: "started-when", v: ["yesterday"] },
      { q: "scope", v: ["whole"] },
      { q: "equipment-age", v: ["10-15"] },
    ],
    availability: [{ dayOffset: 0, windows: ["morning"] }],
    notes: "Dining room gets to 82 by noon. We're open 11–9.",
    status: "assigned",
    assignedTech: "Marcus T.",
    scheduledFor: { dayOffset: 0, window: "morning" },
    officeNotes: "Rooftop unit, ladder access through the back. Manager on site from 9.",
    customer: {
      name: "Owen Braddock",
      phone: "7655550108",
      email: "owen@example.com",
      address1: "409 S Washington St",
      city: "Marion",
      zip: "46952",
      contactMethod: "phone",
      returning: true,
    },
  },
  {
    ref: 4197,
    minutesAgo: 1430,
    pinTime: { hour: 23, minute: 40 },
    category: "heating",
    issueId: "wont-start",
    urgency: "today",
    answers: [
      { q: "thermostat", v: ["blank"] },
      { q: "breaker", v: ["no"] },
      { q: "started-when", v: ["today"] },
      { q: "equipment-age", v: ["5-10"] },
    ],
    availability: [{ dayOffset: 1, windows: ["morning", "afternoon"] }],
    notes: "Thermostat screen went dark this evening and the house is cooling off.",
    status: "assigned",
    assignedTech: "Dale R.",
    scheduledFor: { dayOffset: 1, window: "morning" },
    officeNotes: "Came in overnight. Called first thing, booked 8–12.",
    customer: {
      name: "Kendra Vasquez",
      phone: "7655550172",
      email: "kvasquez@example.com",
      address1: "2210 W Kem Rd",
      city: "Marion",
      zip: "46952",
      contactMethod: "text",
    },
  },
  {
    ref: 4196,
    minutesAgo: 1620,
    category: "plumbing",
    issueId: "clogged-drain",
    urgency: "next-available",
    answers: [
      { q: "drain-scope", v: ["multiple"] },
      { q: "started-when", v: ["this-week"] },
      { q: "prior-service", v: ["other"] },
    ],
    availability: [
      { dayOffset: 2, windows: ["afternoon"] },
      { dayOffset: 3, windows: ["morning"] },
    ],
    status: "scheduled",
    scheduledFor: { dayOffset: 2, window: "afternoon" },
    customer: {
      name: "Annette Crull",
      phone: "7655550183",
      email: "acrull@example.com",
      address1: "331 E Harrison St",
      city: "Sweetser",
      zip: "46987",
      contactMethod: "phone",
    },
  },
  {
    ref: 4195,
    minutesAgo: 2760,
    category: "maintenance",
    issueId: "seasonal",
    urgency: "planning",
    answers: [
      { q: "maintenance-scope", v: ["furnace-tuneup"] },
      { q: "maintenance-last", v: ["year"] },
      { q: "equipment-age", v: ["under-5"] },
    ],
    availability: [{ dayOffset: 4, windows: ["morning"] }],
    status: "scheduled",
    scheduledFor: { dayOffset: 4, window: "morning" },
    customer: {
      name: "Hal Bontrager",
      phone: "7655550145",
      email: "hbontrager@example.com",
      address1: "9044 S 300 E",
      city: "Van Buren",
      zip: "46991",
      contactMethod: "phone",
      returning: true,
    },
  },
  {
    ref: 4194,
    minutesAgo: 4150,
    category: "cooling",
    issueId: "replacement",
    urgency: "planning",
    answers: [
      { q: "replace-reason", v: ["repairs", "age", "bills"] },
      { q: "replace-scope", v: ["both"] },
      { q: "replace-timing", v: ["season"] },
      { q: "financing-interest", v: ["maybe"] },
    ],
    photos: ["equipment", "dataplate"],
    availability: [{ dayOffset: 6, windows: ["afternoon"] }],
    notes: "System is an 18-year-old builder unit. Third repair in two summers.",
    status: "estimate-sent",
    officeNotes:
      "Two options emailed Tuesday — 15 SEER2 and 17 SEER2 with financing sheet. Follow up Friday.",
    customer: {
      name: "Doreen Pletcher",
      phone: "7655550166",
      email: "dpletcher@example.com",
      address1: "1487 N Baldwin Ave",
      city: "Marion",
      zip: "46952",
      contactMethod: "email",
    },
  },
  {
    ref: 4193,
    minutesAgo: 7200,
    category: "plumbing",
    issueId: "toilet",
    urgency: "next-available",
    answers: [
      { q: "toilet-issue", v: ["running"] },
      { q: "only-bathroom", v: ["no"] },
      { q: "started-when", v: ["longer"] },
    ],
    availability: [{ dayOffset: -1, windows: ["afternoon"] }],
    status: "completed",
    assignedTech: "Wes K.",
    officeNotes: "Flapper and fill valve replaced. Invoiced same day.",
    customer: {
      name: "Curtis Yoder",
      phone: "7655550151",
      email: "cyoder@example.com",
      address1: "56 W Jackson St",
      city: "Converse",
      zip: "46919",
      contactMethod: "phone",
    },
  },
];

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function buildAnswers(spec: SeedSpec): IntakeAnswer[] {
  return spec.answers.map((a) => {
    const question = QUESTION_BANK[a.q];
    if (!question) throw new Error(`Seed references unknown question "${a.q}"`);
    const valueIds = a.v ?? [];
    const labels = valueIds.map((id) => {
      const option = question.options?.find((o) => o.id === id);
      if (!option) throw new Error(`Seed references unknown option "${a.q}.${id}"`);
      return option.label;
    });
    return {
      questionId: a.q,
      prompt: question.prompt,
      valueIds,
      labels,
      freeText: a.text,
    };
  });
}

function buildActivity(spec: SeedSpec, createdAt: Date, now: Date): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const at = (minutesAfter: number) =>
    new Date(Math.min(createdAt.getTime() + minutesAfter * 60000, now.getTime())).toISOString();

  entries.push({
    id: `${spec.ref}-a0`,
    at: createdAt.toISOString(),
    kind: "submitted",
    actor: spec.customer.name,
    summary: "Request submitted through the website",
    detail: `${getCategory(spec.category).label} — ${getIssue(spec.category, spec.issueId)?.label ?? spec.issueId}`,
  });

  if (spec.safetyFlags?.length) {
    entries.push({
      id: `${spec.ref}-a1`,
      at: createdAt.toISOString(),
      kind: "note",
      actor: "System",
      summary: "Safety guidance shown to customer before submission",
      detail: "Customer was directed to emergency services before completing the request.",
    });
  }

  const reached: RequestStatus[] = [];
  const order: RequestStatus[] = [
    "contacted",
    "scheduled",
    "assigned",
    "estimate-sent",
    "completed",
  ];
  const target = spec.status;
  for (const s of order) {
    reached.push(s);
    if (s === target) break;
  }
  if (target === "new") reached.length = 0;
  if (target === "closed") reached.push("closed");

  let cursor = 22;
  for (const status of reached) {
    if (status === "scheduled" && !spec.scheduledFor && target !== "scheduled") continue;
    entries.push({
      id: `${spec.ref}-s-${status}`,
      at: at(cursor),
      kind: status === "assigned" ? "assign" : status === "scheduled" ? "schedule" : "status",
      actor: "Office",
      summary: `Status → ${STATUS_LABEL[status]}`,
      detail:
        status === "assigned" && spec.assignedTech
          ? `Assigned to ${spec.assignedTech}`
          : status === "estimate-sent"
            ? "Options sent to the customer by email"
            : undefined,
    });
    cursor += 95;
  }

  if (spec.officeNotes) {
    entries.push({
      id: `${spec.ref}-note`,
      at: at(cursor),
      kind: "note",
      actor: "Office",
      summary: "Office note added",
      detail: spec.officeNotes,
    });
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}

export function buildSeedRequests(now = new Date()): ServiceRequest[] {
  return SEEDS.map((spec) => {
    const createdAt = new Date(now.getTime() - spec.minutesAgo * 60000);
    if (spec.pinTime) {
      createdAt.setHours(spec.pinTime.hour, spec.pinTime.minute, 0, 0);
      /* Never let a pinned time land in the future. */
      while (createdAt.getTime() > now.getTime() - 60000) {
        createdAt.setDate(createdAt.getDate() - 1);
      }
    }
    const answers = buildAnswers(spec);
    const propertyType = spec.propertyType ?? "home";
    const safetyFlags = spec.safetyFlags ?? [];
    const triage = runTriage({
      category: spec.category,
      issueId: spec.issueId,
      urgency: spec.urgency,
      answers,
      safetyFlags,
      propertyType,
      submittedAt: createdAt,
    });
    const activity = buildActivity(spec, createdAt, now);
    const category = getCategory(spec.category);
    const issue = getIssue(spec.category, spec.issueId);

    return {
      id: `seed_${spec.ref}`,
      reference: `KSD-${spec.ref}`,
      createdAt: createdAt.toISOString(),
      updatedAt: activity[activity.length - 1]?.at ?? createdAt.toISOString(),
      channel: spec.channel ?? "web",
      propertyType,
      category: spec.category,
      categoryLabel: category.label,
      issueId: spec.issueId,
      issueLabel: issue?.label ?? spec.issueId,
      urgency: spec.urgency,
      answers,
      signals: collectSignals(spec.category, spec.issueId, answers, propertyType),
      safetyFlags,
      photos: (spec.photos ?? []).map((kind, i) => placeholderPhoto(kind, i)),
      availability: spec.availability.map((a) => ({
        date: offsetDate(now, a.dayOffset),
        windows: a.windows,
      })),
      notes: spec.notes,
      customer: {
        name: spec.customer.name,
        phone: spec.customer.phone,
        email: spec.customer.email,
        address1: spec.customer.address1,
        city: spec.customer.city,
        state: "IN",
        zip: spec.customer.zip,
        contactMethod: spec.customer.contactMethod,
        returning: spec.customer.returning,
      },
      status: spec.status,
      assignedTech: spec.assignedTech,
      scheduledFor: spec.scheduledFor
        ? {
            date: offsetDate(now, spec.scheduledFor.dayOffset),
            window: spec.scheduledFor.window,
          }
        : undefined,
      triage,
      activity,
      officeNotes: spec.officeNotes,
    } satisfies ServiceRequest;
  });
}

/** Highest seeded reference — new requests continue the sequence. */
export const SEED_MAX_REFERENCE = Math.max(...SEEDS.map((s) => s.ref));
