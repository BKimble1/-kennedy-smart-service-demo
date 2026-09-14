import type {
  AnswerOption,
  FollowUpQuestion,
  ServiceCategory,
  ServiceCategoryId,
  IssueOption,
} from "./types";

/* ==========================================================================
   Shared question bank
   --------------------------------------------------------------------------
   Every question here exists because its answer changes what the office does
   next: whether it's a same-day comfort call, whether a truck needs a part,
   whether it's an estimate conversation, or whether nobody should touch it and
   the customer needs emergency help instead.
   ========================================================================== */

const NONE_OF_THESE: AnswerOption = {
  id: "none",
  label: "None of these",
  exclusive: true,
};

/** Offered on every repair path. The single most important question we ask. */
const SAFETY_OPTIONS: AnswerOption[] = [
  {
    id: "gas-odor",
    label: "I smell gas or rotten eggs",
    safety: "gas-odor",
    weight: 100,
  },
  {
    id: "carbon-monoxide",
    label: "A carbon monoxide alarm is going off",
    safety: "carbon-monoxide",
    weight: 100,
  },
  {
    id: "smoke-fire",
    label: "I see smoke, or smell something burning",
    safety: "smoke-fire",
    weight: 100,
  },
  {
    id: "electrical",
    label: "Sparking, scorch marks or a burning electrical smell",
    safety: "electrical",
    weight: 100,
  },
  {
    id: "flooding",
    label: "Water is flooding and I can't stop it",
    safety: "flooding",
    weight: 100,
  },
  {
    id: "sewage",
    label: "Sewage is backing up into the home",
    safety: "sewage",
    weight: 100,
  },
  NONE_OF_THESE,
];

export const SAFETY_QUESTION: FollowUpQuestion = {
  id: "safety-check",
  prompt: "Before we go on — is any of this happening right now?",
  helper: "Pick anything that applies. If none do, choose “None of these”.",
  type: "multi",
  options: SAFETY_OPTIONS,
};

const BANK: FollowUpQuestion[] = [
  {
    id: "cooling-state",
    prompt: "What is the system doing right now?",
    type: "single",
    options: [
      {
        id: "runs-no-cool",
        label: "Running, but the air isn't cold",
        weight: 14,
        signals: ["no-conditioning"],
      },
      {
        id: "runs-weak",
        label: "Running, but it can't keep up",
        weight: 9,
        signals: ["partial-conditioning"],
      },
      {
        id: "short-cycles",
        label: "Starts, then shuts off after a few minutes",
        weight: 13,
        signals: ["system-short-cycling", "no-conditioning"],
      },
      {
        id: "dead",
        label: "Nothing happens at all",
        weight: 16,
        signals: ["system-dead", "no-conditioning"],
      },
      { id: "unsure", label: "I'm not sure", weight: 6, signals: ["unknown"] },
    ],
  },
  {
    id: "heating-state",
    prompt: "What is the furnace doing right now?",
    type: "single",
    options: [
      {
        id: "runs-no-heat",
        label: "Blower runs, but the air is cool",
        weight: 15,
        signals: ["no-conditioning"],
      },
      {
        id: "runs-weak",
        label: "Heats, but not enough",
        weight: 9,
        signals: ["partial-conditioning"],
      },
      {
        id: "short-cycles",
        label: "Fires up, then shuts back down",
        weight: 14,
        signals: ["system-short-cycling"],
      },
      {
        id: "dead",
        label: "Nothing happens at all",
        weight: 18,
        signals: ["system-dead", "no-conditioning"],
      },
      { id: "unsure", label: "I'm not sure", weight: 7, signals: ["unknown"] },
    ],
  },
  {
    id: "outdoor-unit",
    prompt: "Is the outdoor unit running?",
    helper: "The box outside with a fan in the top. A quick look is plenty.",
    type: "single",
    optional: true,
    options: [
      { id: "yes", label: "Yes, the fan is spinning" },
      { id: "no", label: "No, it's completely still", weight: 8 },
      { id: "humming", label: "Humming or buzzing, but the fan isn't turning", weight: 10 },
      { id: "cant-tell", label: "I couldn't check", signals: ["unknown"] },
    ],
  },
  {
    id: "thermostat",
    prompt: "What does the thermostat show?",
    type: "single",
    optional: true,
    options: [
      { id: "normal", label: "Normal display, set the way I want it" },
      { id: "blank", label: "Blank screen", weight: 8 },
      { id: "error", label: "An error or warning message", weight: 8 },
      { id: "wrong-temp", label: "Room temperature is far off from the setting", weight: 5 },
      { id: "unsure", label: "Not sure", signals: ["unknown"] },
    ],
  },
  {
    id: "started-when",
    prompt: "When did this start?",
    type: "single",
    options: [
      { id: "today", label: "Today", weight: 8, signals: ["recent-onset"] },
      { id: "yesterday", label: "Yesterday", weight: 6, signals: ["recent-onset"] },
      { id: "this-week", label: "Within the last week", weight: 3 },
      { id: "longer", label: "Longer than a week ago", signals: ["long-standing"] },
      {
        id: "comes-goes",
        label: "It comes and goes",
        weight: 2,
        signals: ["intermittent"],
      },
    ],
  },
  {
    id: "scope",
    prompt: "How much of the building is affected?",
    type: "single",
    options: [
      { id: "whole", label: "The whole building", weight: 8, signals: ["whole-home"] },
      { id: "some", label: "Some rooms or one floor", weight: 4 },
      { id: "one", label: "Just one room", weight: 1, signals: ["single-room"] },
      { id: "unsure", label: "Not sure", signals: ["unknown"] },
    ],
  },
  {
    id: "equipment-age",
    prompt: "Roughly how old is the equipment?",
    helper: "A rough guess is fine — it helps us bring the right parts.",
    type: "single",
    options: [
      { id: "under-5", label: "Under 5 years", signals: ["new-equipment"] },
      { id: "5-10", label: "5 to 10 years" },
      { id: "10-15", label: "10 to 15 years", weight: 3, signals: ["aging-equipment"] },
      {
        id: "15-plus",
        label: "15 years or more",
        weight: 5,
        signals: ["very-old-equipment", "aging-equipment"],
      },
      { id: "unknown", label: "I don't know", signals: ["unknown"] },
    ],
  },
  {
    id: "noise-type",
    prompt: "What does the noise sound like?",
    type: "multi",
    options: [
      { id: "squeal", label: "Squealing or screeching", weight: 6 },
      { id: "grind", label: "Grinding or metal-on-metal", weight: 10 },
      { id: "bang", label: "Banging or booming on start-up", weight: 9 },
      { id: "rattle", label: "Rattling or vibration", weight: 3 },
      { id: "click", label: "Clicking, then nothing happens", weight: 8 },
      { id: "hum", label: "Loud humming or buzzing", weight: 6 },
    ],
  },
  {
    id: "noise-when",
    prompt: "When do you hear it?",
    type: "single",
    optional: true,
    options: [
      { id: "startup", label: "Only when it starts up" },
      { id: "running", label: "The whole time it runs" },
      { id: "shutdown", label: "When it shuts off" },
      { id: "random", label: "At random", signals: ["intermittent"] },
    ],
  },
  {
    id: "smell-type",
    prompt: "What does the smell remind you of?",
    helper: "If you smell gas or rotten eggs, stop here and choose that option.",
    type: "single",
    options: [
      {
        id: "gas",
        label: "Gas or rotten eggs",
        safety: "gas-odor",
        weight: 100,
      },
      {
        id: "burning",
        label: "Burning, hot plastic, or electrical",
        safety: "smoke-fire",
        weight: 100,
      },
      {
        id: "dusty",
        label: "Dusty or singed — only for the first few minutes each season",
        weight: 2,
      },
      { id: "musty", label: "Musty or damp", weight: 3 },
      { id: "other", label: "Something else", weight: 4 },
    ],
  },
  {
    id: "filter-age",
    prompt: "When was the filter last changed?",
    type: "single",
    optional: true,
    options: [
      { id: "recent", label: "In the last month" },
      { id: "few-months", label: "A few months ago" },
      { id: "long", label: "Longer than six months", weight: 3 },
      { id: "unknown", label: "I'm not sure", signals: ["unknown"] },
    ],
  },
  {
    id: "breaker",
    prompt: "Has a breaker tripped, or has anyone reset one?",
    type: "single",
    optional: true,
    options: [
      { id: "tripped", label: "Yes, a breaker tripped", weight: 7 },
      { id: "reset-held", label: "It was reset and has stayed on", weight: 3 },
      { id: "reset-tripped", label: "It was reset and tripped again", weight: 12 },
      { id: "no", label: "No" },
      { id: "unsure", label: "I don't know", signals: ["unknown"] },
    ],
  },
  {
    id: "prior-service",
    prompt: "Has anyone worked on this recently?",
    type: "single",
    optional: true,
    options: [
      { id: "no", label: "No" },
      { id: "kennedys", label: "Yes — Kennedy's has been out", weight: 5, signals: ["repeat-repair"] },
      { id: "other", label: "Yes — another company", weight: 3, signals: ["repeat-repair"] },
      { id: "diy", label: "I tried something myself" },
    ],
  },

  /* ---------------------------- Plumbing -------------------------------- */
  {
    id: "water-active",
    prompt: "Is water escaping right now?",
    type: "single",
    options: [
      {
        id: "running",
        label: "Yes — running or spraying",
        weight: 26,
        signals: ["active-water"],
      },
      { id: "drip", label: "Yes — a slow drip", weight: 10, signals: ["active-water"] },
      { id: "stopped", label: "No, it has stopped", weight: 3, signals: ["water-stopped"] },
      {
        id: "contained",
        label: "It's caught in a bucket or pan",
        weight: 6,
        signals: ["water-contained"],
      },
      { id: "unsure", label: "Not sure", weight: 6, signals: ["unknown"] },
    ],
  },
  {
    id: "water-shutoff",
    prompt: "Has the water been shut off?",
    helper: "If you can reach a shutoff safely, turning it off can limit damage.",
    type: "single",
    options: [
      { id: "main", label: "Yes, at the main shutoff" },
      { id: "fixture", label: "Yes, at that fixture" },
      { id: "no", label: "No, it's still on", weight: 10 },
      { id: "cant-find", label: "I can't find the shutoff", weight: 12 },
    ],
  },
  {
    id: "leak-location",
    prompt: "Where is the water coming from?",
    type: "single",
    options: [
      { id: "under-sink", label: "Under a sink" },
      { id: "ceiling-wall", label: "Through a ceiling or wall", weight: 12 },
      { id: "basement", label: "Basement or crawl space", weight: 6 },
      { id: "water-heater", label: "Around the water heater", weight: 8 },
      { id: "toilet", label: "Around a toilet", weight: 4 },
      { id: "outside", label: "Outside or at the meter", weight: 6 },
      { id: "unsure", label: "I can't tell", weight: 5, signals: ["unknown"] },
    ],
  },
  {
    id: "drain-scope",
    prompt: "What's backing up or draining slowly?",
    type: "single",
    options: [
      { id: "one", label: "One sink, tub or shower", signals: ["single-room"] },
      { id: "toilet", label: "A toilet", weight: 5 },
      { id: "multiple", label: "Several fixtures at once", weight: 14, signals: ["whole-home"] },
      {
        id: "main",
        label: "Everything — and it comes up somewhere else when I run water",
        weight: 22,
        signals: ["whole-home"],
      },
    ],
  },
  {
    id: "only-bathroom",
    prompt: "Is this the only bathroom in the building?",
    type: "single",
    optional: true,
    options: [
      { id: "yes", label: "Yes, it's the only one", weight: 12 },
      { id: "no", label: "No, there are others" },
    ],
  },
  {
    id: "hot-water-state",
    prompt: "What's happening with the hot water?",
    type: "single",
    options: [
      { id: "none", label: "No hot water at all", weight: 16, signals: ["no-hot-water"] },
      { id: "runs-out", label: "Runs out much faster than it used to", weight: 6 },
      { id: "lukewarm", label: "Only lukewarm", weight: 9, signals: ["no-hot-water"] },
      {
        id: "leaking",
        label: "The tank is leaking",
        weight: 20,
        signals: ["active-water", "replacement-intent"],
      },
      { id: "noisy", label: "Popping, rumbling or knocking", weight: 5 },
    ],
  },
  {
    id: "water-heater-type",
    prompt: "What kind of water heater is it?",
    type: "single",
    optional: true,
    options: [
      { id: "gas-tank", label: "Gas tank" },
      { id: "electric-tank", label: "Electric tank" },
      { id: "tankless", label: "Tankless" },
      { id: "unsure", label: "Not sure", signals: ["unknown"] },
    ],
  },
  {
    id: "no-water-scope",
    prompt: "Where is there no water?",
    type: "single",
    options: [
      { id: "whole", label: "The entire building", weight: 24, signals: ["no-water", "whole-home"] },
      { id: "hot-only", label: "Hot water only", weight: 12, signals: ["no-hot-water"] },
      { id: "cold-only", label: "Cold water only", weight: 12 },
      { id: "one", label: "One fixture", weight: 4, signals: ["single-room"] },
    ],
  },
  {
    id: "neighbors",
    prompt: "Do neighbors have water?",
    helper: "This tells us whether to look at the utility or at your service line.",
    type: "single",
    optional: true,
    options: [
      { id: "yes", label: "Yes, they're fine" },
      { id: "no", label: "No, they're out too" },
      { id: "unsure", label: "Haven't checked", signals: ["unknown"] },
    ],
  },
  {
    id: "pressure-scope",
    prompt: "Where is the pressure low?",
    type: "single",
    options: [
      { id: "whole", label: "Everywhere in the building", weight: 8, signals: ["whole-home"] },
      { id: "hot", label: "Hot water only", weight: 5 },
      { id: "cold", label: "Cold water only", weight: 5 },
      { id: "one", label: "One fixture", weight: 1, signals: ["single-room"] },
    ],
  },
  {
    id: "toilet-issue",
    prompt: "What's the toilet doing?",
    type: "single",
    options: [
      { id: "clogged", label: "Clogged or won't flush", weight: 8 },
      { id: "overflow", label: "Overflowing", weight: 22, signals: ["active-water"] },
      { id: "running", label: "Running constantly", weight: 4 },
      { id: "leak-base", label: "Leaking around the base", weight: 10, signals: ["active-water"] },
      { id: "loose", label: "Loose or rocking" },
    ],
  },
  {
    id: "faucet-issue",
    prompt: "What's the fixture doing?",
    type: "single",
    options: [
      { id: "drip", label: "Dripping or won't shut off", weight: 4 },
      { id: "leak-base", label: "Leaking at the base or underneath", weight: 8, signals: ["active-water"] },
      { id: "no-flow", label: "Barely any flow", weight: 3 },
      { id: "broken-handle", label: "Handle is broken or spinning", weight: 4 },
      { id: "replace", label: "I want it replaced", signals: ["replacement-intent"] },
    ],
  },
  {
    id: "sump-state",
    prompt: "What is the sump pump doing?",
    type: "single",
    options: [
      { id: "not-running", label: "Not running at all", weight: 18 },
      { id: "constant", label: "Running constantly and not keeping up", weight: 20, signals: ["active-water"] },
      { id: "water-rising", label: "Water is rising in the pit", weight: 22, signals: ["active-water"] },
      { id: "noisy", label: "Running, but noisy", weight: 6 },
      { id: "preventive", label: "It works — I want it looked at or replaced", signals: ["replacement-intent"] },
    ],
  },
  {
    id: "weather-context",
    prompt: "Is it raining or has it rained heavily recently?",
    type: "single",
    optional: true,
    options: [
      { id: "yes", label: "Yes", weight: 6 },
      { id: "no", label: "No" },
    ],
  },

  /* ------------------------- Estimates & planning ------------------------ */
  {
    id: "replace-reason",
    prompt: "What's prompting you to look at this now?",
    type: "multi",
    options: [
      { id: "repairs", label: "Repair costs are adding up", weight: 4, signals: ["repeat-repair"] },
      { id: "age", label: "The system is old", weight: 3, signals: ["aging-equipment"] },
      { id: "comfort", label: "Rooms are uncomfortable", weight: 3 },
      { id: "bills", label: "Energy bills are high", weight: 2 },
      { id: "failed", label: "It stopped working", weight: 12, signals: ["no-conditioning"] },
      { id: "remodel", label: "Remodel, addition or new build" },
      { id: "selling", label: "Buying or selling the property" },
    ],
  },
  {
    id: "replace-scope",
    prompt: "What are you thinking about replacing?",
    type: "multi",
    options: [
      { id: "ac", label: "Air conditioner" },
      { id: "furnace", label: "Furnace" },
      { id: "both", label: "Full system — furnace and AC" },
      { id: "heat-pump", label: "Heat pump" },
      { id: "water-heater", label: "Water heater" },
      { id: "thermostat", label: "Thermostat" },
      { id: "unsure", label: "Not sure yet — I'd like advice", signals: ["unknown"] },
    ],
  },
  {
    id: "replace-timing",
    prompt: "What timing do you have in mind?",
    type: "single",
    options: [
      { id: "now", label: "As soon as possible", weight: 8 },
      { id: "weeks", label: "In the next few weeks", weight: 3 },
      { id: "season", label: "Before the next season" },
      { id: "budgeting", label: "Just gathering numbers for now" },
    ],
  },
  {
    id: "financing-interest",
    prompt: "Would you like financing information included?",
    helper: "Kennedy's offers financing. We'll simply note whether to bring it up.",
    type: "single",
    optional: true,
    options: [
      { id: "yes", label: "Yes, please include it" },
      { id: "maybe", label: "Maybe — tell me more" },
      { id: "no", label: "No thanks" },
    ],
  },
  {
    id: "maintenance-scope",
    prompt: "What would you like serviced?",
    type: "multi",
    options: [
      { id: "ac-tuneup", label: "Air conditioning tune-up" },
      { id: "furnace-tuneup", label: "Furnace tune-up / safety check" },
      { id: "both", label: "Both — seasonal check on the whole system" },
      { id: "water-heater", label: "Water heater flush or check" },
      { id: "drains", label: "Drain cleaning" },
      { id: "plan", label: "I'd like to hear about a maintenance plan" },
    ],
  },
  {
    id: "maintenance-last",
    prompt: "When was it last serviced?",
    type: "single",
    optional: true,
    options: [
      { id: "year", label: "Within the last year" },
      { id: "1-2", label: "One to two years ago" },
      { id: "longer", label: "Longer than that", weight: 2 },
      { id: "never", label: "Never, or I don't know", weight: 2, signals: ["unknown"] },
    ],
  },
  {
    id: "other-detail",
    prompt: "Tell us what's going on",
    helper: "A sentence or two is plenty. We'll follow up with anything else we need.",
    type: "text",
    placeholder: "For example: the shut-off valve under the kitchen sink is seized and I'd like it replaced.",
  },
  {
    id: "other-when",
    prompt: "How soon do you need this looked at?",
    type: "single",
    options: [
      { id: "now", label: "It's causing a problem right now", weight: 14 },
      { id: "soon", label: "Soon, but it's manageable", weight: 4 },
      { id: "planning", label: "I'm planning ahead" },
    ],
  },
];

export const QUESTION_BANK: Record<string, FollowUpQuestion> = Object.fromEntries(
  BANK.map((q) => [q.id, q]),
);

export function getQuestion(id: string): FollowUpQuestion {
  const q = QUESTION_BANK[id];
  if (!q) throw new Error(`Unknown question id: ${id}`);
  return q;
}

/* ==========================================================================
   Service categories
   ========================================================================== */

const coolingIssues: IssueOption[] = [
  {
    id: "not-cooling",
    label: "Not cooling",
    hint: "Runs, but the house won't come down to temperature",
    questions: ["cooling-state", "started-when", "scope", "equipment-age"],
    weight: 14,
    signals: ["no-conditioning"],
  },
  {
    id: "warm-air",
    label: "Blowing warm air",
    hint: "Air is coming out, but it isn't cold",
    questions: ["cooling-state", "outdoor-unit", "started-when", "equipment-age"],
    weight: 14,
    signals: ["no-conditioning"],
  },
  {
    id: "wont-start",
    label: "Won't turn on",
    hint: "Nothing happens when you call for cooling",
    questions: ["thermostat", "breaker", "started-when", "equipment-age"],
    weight: 16,
    signals: ["system-dead", "no-conditioning"],
  },
  {
    id: "noise",
    label: "Unusual noise",
    hint: "Squealing, grinding, banging or rattling",
    questions: ["noise-type", "noise-when", "cooling-state", "equipment-age"],
    weight: 9,
  },
  {
    id: "leak",
    label: "Leaking or icing up",
    hint: "Water around the indoor unit, or ice on the lines",
    questions: ["water-active", "started-when", "filter-age", "equipment-age"],
    weight: 12,
  },
  {
    id: "maintenance",
    label: "Tune-up or maintenance",
    hint: "Seasonal service, no active problem",
    questions: ["maintenance-scope", "maintenance-last", "equipment-age"],
    weight: 0,
  },
  {
    id: "replacement",
    label: "Replacement estimate",
    hint: "Thinking about a new system",
    questions: ["replace-reason", "replace-scope", "replace-timing", "financing-interest"],
    weight: 2,
    signals: ["replacement-intent", "estimate-request"],
  },
  {
    id: "other",
    label: "Something else",
    questions: ["other-detail", "other-when", "equipment-age"],
    weight: 4,
  },
];

const heatingIssues: IssueOption[] = [
  {
    id: "no-heat",
    label: "No heat",
    hint: "The building isn't getting warm",
    questions: ["heating-state", "thermostat", "started-when", "equipment-age"],
    weight: 20,
    signals: ["no-conditioning"],
  },
  {
    id: "weak-heat",
    label: "Weak or uneven heat",
    hint: "Runs, but can't keep up — or some rooms stay cold",
    questions: ["heating-state", "scope", "filter-age", "equipment-age"],
    weight: 10,
    signals: ["partial-conditioning"],
  },
  {
    id: "wont-start",
    label: "Furnace won't start",
    hint: "No response at all when heat is called for",
    questions: ["thermostat", "breaker", "started-when", "equipment-age"],
    weight: 20,
    signals: ["system-dead", "no-conditioning"],
  },
  {
    id: "noise",
    label: "Strange noise",
    hint: "Banging, grinding, squealing or rattling",
    questions: ["noise-type", "noise-when", "heating-state", "equipment-age"],
    weight: 11,
  },
  {
    id: "smell",
    label: "Strange smell",
    hint: "Something doesn't smell right when it runs",
    questions: ["smell-type", "started-when", "equipment-age"],
    weight: 18,
  },
  {
    id: "short-cycling",
    label: "Turns on and off constantly",
    hint: "Fires up, then shuts down again quickly",
    questions: ["heating-state", "thermostat", "filter-age", "equipment-age"],
    weight: 12,
    signals: ["system-short-cycling"],
  },
  {
    id: "maintenance",
    label: "Tune-up or safety check",
    questions: ["maintenance-scope", "maintenance-last", "equipment-age"],
    weight: 0,
  },
  {
    id: "replacement",
    label: "Replacement estimate",
    questions: ["replace-reason", "replace-scope", "replace-timing", "financing-interest"],
    weight: 2,
    signals: ["replacement-intent", "estimate-request"],
  },
];

const plumbingIssues: IssueOption[] = [
  {
    id: "leak",
    label: "Leaking pipe",
    hint: "Water where it shouldn't be",
    questions: ["water-active", "water-shutoff", "leak-location", "started-when"],
    weight: 20,
  },
  {
    id: "clogged-drain",
    label: "Clogged or slow drain",
    questions: ["drain-scope", "started-when", "prior-service"],
    weight: 10,
  },
  {
    id: "water-heater",
    label: "Water heater",
    hint: "No hot water, not enough, or leaking",
    questions: ["hot-water-state", "water-heater-type", "equipment-age"],
    weight: 14,
  },
  {
    id: "toilet",
    label: "Toilet",
    questions: ["toilet-issue", "only-bathroom", "started-when"],
    weight: 10,
  },
  {
    id: "faucet",
    label: "Faucet or fixture",
    questions: ["faucet-issue", "water-shutoff", "started-when"],
    weight: 6,
  },
  {
    id: "no-water",
    label: "No water",
    questions: ["no-water-scope", "neighbors", "started-when"],
    weight: 24,
    signals: ["no-water"],
  },
  {
    id: "low-pressure",
    label: "Low water pressure",
    questions: ["pressure-scope", "started-when", "prior-service"],
    weight: 6,
  },
  {
    id: "sump-pump",
    label: "Sump pump",
    questions: ["sump-state", "weather-context", "equipment-age"],
    weight: 16,
  },
  {
    id: "other",
    label: "Something else",
    questions: ["other-detail", "other-when", "water-active"],
    weight: 6,
  },
];

const maintenanceIssues: IssueOption[] = [
  {
    id: "seasonal",
    label: "Seasonal tune-up",
    hint: "Get the system ready for the season ahead",
    questions: ["maintenance-scope", "maintenance-last", "equipment-age"],
  },
  {
    id: "plan",
    label: "Maintenance plan",
    hint: "Ask about scheduled service",
    questions: ["maintenance-scope", "maintenance-last", "equipment-age"],
  },
  {
    id: "water-heater",
    label: "Water heater service",
    questions: ["water-heater-type", "maintenance-last", "equipment-age"],
  },
  {
    id: "drains",
    label: "Preventive drain cleaning",
    questions: ["drain-scope", "maintenance-last", "prior-service"],
  },
];

const installIssues: IssueOption[] = [
  {
    id: "ac",
    label: "Air conditioner",
    questions: ["replace-reason", "replace-timing", "equipment-age", "financing-interest"],
    signals: ["replacement-intent", "estimate-request"],
  },
  {
    id: "furnace",
    label: "Furnace",
    questions: ["replace-reason", "replace-timing", "equipment-age", "financing-interest"],
    signals: ["replacement-intent", "estimate-request"],
  },
  {
    id: "full-system",
    label: "Full HVAC system",
    hint: "Furnace and air conditioning together",
    questions: ["replace-reason", "replace-timing", "equipment-age", "financing-interest"],
    signals: ["replacement-intent", "estimate-request"],
  },
  {
    id: "water-heater",
    label: "Water heater",
    questions: ["hot-water-state", "water-heater-type", "replace-timing", "financing-interest"],
    signals: ["replacement-intent", "estimate-request"],
  },
  {
    id: "thermostat",
    label: "Thermostat",
    questions: ["thermostat", "replace-timing", "equipment-age"],
    signals: ["replacement-intent"],
  },
  {
    id: "other",
    label: "Something else",
    questions: ["other-detail", "replace-timing", "financing-interest"],
    signals: ["estimate-request"],
  },
];

const otherIssues: IssueOption[] = [
  {
    id: "not-sure",
    label: "I'm not sure what it is",
    hint: "Tell us what you're seeing and we'll sort it out",
    questions: ["other-detail", "other-when", "scope"],
    weight: 6,
  },
  {
    id: "question",
    label: "I have a question",
    hint: "About a bill, a past visit, or a system you own",
    questions: ["other-detail", "other-when"],
  },
  {
    id: "commercial",
    label: "Commercial property",
    hint: "A shop, office, rental or other business property",
    questions: ["other-detail", "other-when", "equipment-age"],
    weight: 8,
    signals: ["business-property"],
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "cooling",
    label: "Air Conditioning",
    blurb: "Not cooling, won't start, noisy or leaking",
    icon: "snowflake",
    issues: coolingIssues,
  },
  {
    id: "heating",
    label: "Heating / Furnace",
    blurb: "No heat, weak heat, noises or odd smells",
    icon: "flame",
    issues: heatingIssues,
  },
  {
    id: "plumbing",
    label: "Plumbing",
    blurb: "Leaks, drains, water heaters, fixtures",
    icon: "droplets",
    issues: plumbingIssues,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    blurb: "Seasonal tune-ups and scheduled service",
    icon: "wrench",
    issues: maintenanceIssues,
  },
  {
    id: "install",
    label: "Installation / Replacement",
    blurb: "New equipment and replacement estimates",
    icon: "package",
    issues: installIssues,
  },
  {
    id: "other",
    label: "Something else",
    blurb: "Not sure, a question, or a commercial property",
    icon: "circle-help",
    issues: otherIssues,
  },
];

export const CATEGORY_BY_ID: Record<ServiceCategoryId, ServiceCategory> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.id, c]),
) as Record<ServiceCategoryId, ServiceCategory>;

export function getCategory(id: ServiceCategoryId): ServiceCategory {
  return CATEGORY_BY_ID[id];
}

export function getIssue(categoryId: ServiceCategoryId, issueId: string): IssueOption | undefined {
  return CATEGORY_BY_ID[categoryId]?.issues.find((i) => i.id === issueId);
}

export function questionsFor(categoryId: ServiceCategoryId, issueId: string): FollowUpQuestion[] {
  const issue = getIssue(categoryId, issueId);
  if (!issue) return [];
  return issue.questions.map(getQuestion);
}

/* ==========================================================================
   Urgency
   ========================================================================== */

export const URGENCY_OPTIONS: {
  id: import("./types").UrgencyId;
  label: string;
  hint: string;
  weight: number;
}[] = [
  {
    id: "emergency",
    label: "Emergency — as soon as possible",
    hint: "Something is actively causing damage or the building is unusable",
    weight: 30,
  },
  {
    id: "today",
    label: "Today if possible",
    hint: "It's a real problem, but it can wait a few hours",
    weight: 18,
  },
  {
    id: "next-available",
    label: "Next available appointment",
    hint: "Get me on the schedule",
    weight: 6,
  },
  {
    id: "planning",
    label: "I'm planning ahead",
    hint: "No rush — quotes, maintenance or future work",
    weight: 0,
  },
];

export const URGENCY_LABEL: Record<import("./types").UrgencyId, string> = {
  emergency: "Emergency",
  today: "Today if possible",
  "next-available": "Next available",
  planning: "Planning ahead",
};
