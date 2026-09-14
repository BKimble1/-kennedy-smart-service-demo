import { QUESTION_BANK } from "@/lib/domain/catalog";
import type { IntakeAnswer, ServiceRequest } from "@/lib/domain/types";

/**
 * Answer-to-prose mapping.
 *
 * Demo mode's writing quality comes from here: instead of echoing
 * "cooling-state: Running, but the air isn't cold", we hold a natural clause for
 * every (question, option) pair and compose real sentences from them. The same
 * clauses feed the live provider as grounding facts, so switching to a real
 * model changes the phrasing — never the facts.
 */

type ClauseMap = Record<string, Record<string, string>>;

const CLAUSES: ClauseMap = {
  "cooling-state": {
    "runs-no-cool": "the system runs but the air coming out isn't cold",
    "runs-weak": "the system runs but can't bring the building down to temperature",
    "short-cycles": "the system starts and then shuts off after a few minutes",
    dead: "the system does nothing at all when cooling is called for",
    unsure: "the customer isn't sure what the system is doing",
  },
  "heating-state": {
    "runs-no-heat": "the blower runs but the air coming out is cool",
    "runs-weak": "it produces some heat but can't keep up",
    "short-cycles": "the furnace fires and then shuts back down",
    dead: "the furnace does nothing at all when heat is called for",
    unsure: "the customer isn't sure what the furnace is doing",
  },
  "outdoor-unit": {
    yes: "the outdoor fan is spinning",
    no: "the outdoor unit is completely still",
    humming: "the outdoor unit hums but the fan isn't turning",
    "cant-tell": "the outdoor unit wasn't checked",
  },
  thermostat: {
    normal: "the thermostat display looks normal and is set where they want it",
    blank: "the thermostat screen is blank",
    error: "the thermostat is showing an error message",
    "wrong-temp": "room temperature is well off the thermostat setting",
    unsure: "the thermostat wasn't checked",
  },
  "started-when": {
    today: "it started today",
    yesterday: "it started yesterday",
    "this-week": "it started within the last week",
    longer: "it has been going on longer than a week",
    "comes-goes": "the problem comes and goes",
  },
  scope: {
    whole: "the whole building is affected",
    some: "some rooms or one floor are affected",
    one: "only one room is affected",
    unsure: "how much of the building is affected isn't clear",
  },
  "equipment-age": {
    "under-5": "the equipment is under 5 years old",
    "5-10": "the equipment is roughly 5 to 10 years old",
    "10-15": "the equipment is roughly 10 to 15 years old",
    "15-plus": "the equipment is 15 years or older",
    unknown: "equipment age is unknown",
  },
  "noise-type": {
    squeal: "squealing or screeching",
    grind: "grinding or metal-on-metal",
    bang: "banging or booming on start-up",
    rattle: "rattling or vibration",
    click: "clicking with no start",
    hum: "loud humming or buzzing",
  },
  "noise-when": {
    startup: "the noise happens on start-up",
    running: "the noise is there the whole time it runs",
    shutdown: "the noise happens on shutdown",
    random: "the noise is intermittent",
  },
  "smell-type": {
    dusty: "a dusty or singed smell for the first few minutes of the season",
    musty: "a musty or damp smell",
    other: "an unfamiliar smell",
  },
  "filter-age": {
    recent: "the filter was changed within the last month",
    "few-months": "the filter was changed a few months ago",
    long: "the filter hasn't been changed in over six months",
    unknown: "filter age is unknown",
  },
  breaker: {
    tripped: "a breaker has tripped",
    "reset-held": "a breaker was reset and has stayed on",
    "reset-tripped": "a breaker was reset and tripped again",
    no: "no breaker has tripped",
    unsure: "breaker status is unknown",
  },
  "prior-service": {
    no: "no one has worked on it recently",
    kennedys: "Kennedy's has been out on this equipment recently",
    other: "another company has worked on it recently",
    diy: "the customer has tried something themselves",
  },
  "water-active": {
    running: "water is actively running or spraying",
    drip: "there is an active slow drip",
    stopped: "the water has stopped",
    contained: "the water is being caught in a container",
    unsure: "it isn't clear whether water is still escaping",
  },
  "water-shutoff": {
    main: "the main water shutoff is closed",
    fixture: "the fixture shutoff is closed",
    no: "the water is still on",
    "cant-find": "the customer can't locate a shutoff",
  },
  "leak-location": {
    "under-sink": "under a sink",
    "ceiling-wall": "through a ceiling or wall",
    basement: "in the basement or crawl space",
    "water-heater": "around the water heater",
    toilet: "around a toilet",
    outside: "outside or at the meter",
    unsure: "from a spot the customer can't identify",
  },
  "drain-scope": {
    one: "one sink, tub or shower is affected",
    toilet: "a toilet is affected",
    multiple: "several fixtures are backing up at once",
    main: "everything backs up, and running water surfaces elsewhere",
  },
  "only-bathroom": {
    yes: "it is the only bathroom in the building",
    no: "there are other bathrooms available",
  },
  "hot-water-state": {
    none: "there is no hot water at all",
    "runs-out": "hot water runs out much faster than it used to",
    lukewarm: "the water only gets lukewarm",
    leaking: "the tank is leaking",
    noisy: "the tank is popping or rumbling",
  },
  "water-heater-type": {
    "gas-tank": "a gas tank unit",
    "electric-tank": "an electric tank unit",
    tankless: "a tankless unit",
    unsure: "an unknown type of unit",
  },
  "no-water-scope": {
    whole: "the entire building is without water",
    "hot-only": "there is no hot water",
    "cold-only": "there is no cold water",
    one: "one fixture has no water",
  },
  neighbors: {
    yes: "neighbors still have water",
    no: "neighbors are out of water too",
    unsure: "neighbors haven't been checked",
  },
  "pressure-scope": {
    whole: "pressure is low throughout the building",
    hot: "pressure is low on hot water only",
    cold: "pressure is low on cold water only",
    one: "pressure is low at one fixture",
  },
  "toilet-issue": {
    clogged: "the toilet is clogged or won't flush",
    overflow: "the toilet is overflowing",
    running: "the toilet runs constantly",
    "leak-base": "the toilet leaks around the base",
    loose: "the toilet is loose or rocking",
  },
  "faucet-issue": {
    drip: "the fixture drips or won't shut off",
    "leak-base": "the fixture leaks at the base",
    "no-flow": "the fixture has barely any flow",
    "broken-handle": "the handle is broken",
    replace: "the customer wants the fixture replaced",
  },
  "sump-state": {
    "not-running": "the sump pump isn't running",
    constant: "the sump pump runs constantly and isn't keeping up",
    "water-rising": "water is rising in the sump pit",
    noisy: "the sump pump runs but is noisy",
    preventive: "the pump works — they want it checked or replaced",
  },
  "weather-context": {
    yes: "there has been heavy rain recently",
    no: "there hasn't been heavy rain recently",
  },
  "replace-reason": {
    repairs: "repair costs are adding up",
    age: "the system is old",
    comfort: "rooms are uncomfortable",
    bills: "energy bills are high",
    failed: "the system has stopped working",
    remodel: "a remodel, addition or new build",
    selling: "buying or selling the property",
  },
  "replace-scope": {
    ac: "an air conditioner",
    furnace: "a furnace",
    both: "a complete furnace and air conditioning system",
    "heat-pump": "a heat pump",
    "water-heater": "a water heater",
    thermostat: "a thermostat",
    unsure: "options they haven't settled on yet",
  },
  "replace-timing": {
    now: "they want to move as soon as possible",
    weeks: "they're looking at the next few weeks",
    season: "they want it done before the next season",
    budgeting: "they're gathering numbers for now",
  },
  "financing-interest": {
    yes: "they asked for financing information",
    maybe: "they'd like to hear more about financing",
    no: "they aren't interested in financing",
  },
  "maintenance-scope": {
    "ac-tuneup": "air conditioning tune-up",
    "furnace-tuneup": "furnace tune-up and safety check",
    both: "seasonal check on the whole system",
    "water-heater": "water heater flush or check",
    drains: "drain cleaning",
    plan: "information about a maintenance plan",
  },
  "maintenance-last": {
    year: "it was serviced within the last year",
    "1-2": "it was serviced one to two years ago",
    longer: "it hasn't been serviced in over two years",
    never: "it has never been serviced, or they don't recall",
  },
  "other-when": {
    now: "it's causing a problem right now",
    soon: "they'd like it handled soon but it's manageable",
    planning: "they're planning ahead",
  },
};

/** A clause for a single answer, or null when nothing sensible can be said. */
export function clauseFor(answer: IntakeAnswer): string | null {
  if (answer.freeText?.trim()) return answer.freeText.trim();
  const map = CLAUSES[answer.questionId];
  if (!map) return null;
  const parts = answer.valueIds.map((id) => map[id]).filter(Boolean);
  if (parts.length === 0) return null;
  if (answer.questionId === "noise-type") {
    return `the noise is described as ${joinClauses(parts)}`;
  }
  if (answer.questionId === "leak-location") {
    return `water is coming ${parts[0]}`;
  }
  if (answer.questionId === "replace-reason") {
    return `they're looking into it because ${joinClauses(parts)}`;
  }
  if (answer.questionId === "replace-scope") {
    return `they're considering ${joinClauses(parts)}`;
  }
  if (answer.questionId === "maintenance-scope") {
    return `they'd like ${joinClauses(parts)}`;
  }
  if (answer.questionId === "water-heater-type") {
    return `it's ${parts[0]}`;
  }
  return joinClauses(parts);
}

export function joinClauses(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** Ordered clauses for a request, skipping anything that adds nothing. */
export function clausesFor(request: ServiceRequest): string[] {
  return request.answers
    .map((a) => ({ answer: a, clause: clauseFor(a) }))
    .filter((x): x is { answer: IntakeAnswer; clause: string } => Boolean(x.clause))
    .map((x) => x.clause);
}

/** Human-readable "question — answer" rows for structured display. */
export function answerRows(request: ServiceRequest) {
  return request.answers.map((a) => ({
    id: a.questionId,
    prompt: QUESTION_BANK[a.questionId]?.prompt ?? a.prompt,
    value: a.freeText?.trim() || a.labels.join(" · ") || "—",
    isFreeText: Boolean(a.freeText?.trim()),
  }));
}

/** Lowercases only the first character, so proper nouns survive. */
export function lowerFirstOnly(text: string): string {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

/** "a"/"an" by the sound of the following word. */
export function article(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const punctuated = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return capitalize(punctuated);
}
