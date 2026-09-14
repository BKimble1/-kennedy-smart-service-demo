import type { SafetyFlagId } from "./types";

export interface SafetyProtocol {
  id: SafetyFlagId;
  /** Short label used in lists and badges. */
  label: string;
  /** Headline on the interstitial. Direct, no hedging. */
  headline: string;
  /** Ordered steps. The first step is always the one that protects people. */
  steps: string[];
  /** Who to call, in order. */
  contacts: { label: string; detail: string; href?: string; primary?: boolean }[];
  /** Shown after the steps — what we will and won't do. */
  closing: string;
  severity: "evacuate" | "urgent";
}

/**
 * We do not attempt to diagnose any of these. The flow stops, shows the
 * protocol, and makes the emergency contact the largest thing on screen.
 * The customer can still leave their details afterwards so the office has a
 * record — but only after the safety guidance has been shown.
 */
export const SAFETY_PROTOCOLS: Record<SafetyFlagId, SafetyProtocol> = {
  "gas-odor": {
    id: "gas-odor",
    label: "Gas odor reported",
    headline: "Leave the building now, then call for help from outside.",
    severity: "evacuate",
    steps: [
      "Get everyone and any pets out of the building right away.",
      "Do not switch anything on or off — no lights, no appliances, no thermostats.",
      "Do not use a phone, garage door opener or anything electrical while you are inside.",
      "Leave doors open on your way out if you can do so without delay.",
      "Once you are well away from the building, call 911 and your natural gas utility's emergency line.",
      "Do not go back inside until the fire department or the gas utility tells you it is safe.",
    ],
    contacts: [
      { label: "Emergency services", detail: "911", href: "tel:911", primary: true },
      {
        label: "Your natural gas utility",
        detail: "The 24-hour emergency number is printed on your gas bill and on the utility's website.",
      },
    ],
    closing:
      "A suspected gas leak is not something to work through in a form. Once you are safe and the utility has cleared the building, come back and we'll take your request.",
  },
  "carbon-monoxide": {
    id: "carbon-monoxide",
    label: "CO alarm sounding",
    headline: "Get outside into fresh air, then call 911.",
    severity: "evacuate",
    steps: [
      "Move everyone and any pets outside into fresh air immediately.",
      "Leave the alarm sounding — do not silence it, disconnect it or remove the batteries.",
      "Call 911 from outside the building.",
      "If anyone feels dizzy, nauseated, confused, has a headache or has passed out, tell the dispatcher — those can be symptoms of carbon monoxide exposure and need medical attention.",
      "Do not go back inside until emergency responders say it is safe.",
    ],
    contacts: [
      { label: "Emergency services", detail: "911", href: "tel:911", primary: true },
    ],
    closing:
      "Carbon monoxide is invisible and has no smell. Treat every alarm as real. We'll be here when the building has been cleared.",
  },
  "smoke-fire": {
    id: "smoke-fire",
    label: "Smoke or burning smell",
    headline: "If you see smoke or flame, get out and call 911.",
    severity: "evacuate",
    steps: [
      "Leave the building and take everyone with you.",
      "Call 911 from outside.",
      "Do not open a door that is hot to the touch, and do not go back for belongings.",
      "If there is no visible smoke or flame and the smell is faint, you can shut the system off at the thermostat and at the breaker — but only if you can reach both safely.",
    ],
    contacts: [
      { label: "Emergency services", detail: "911", href: "tel:911", primary: true },
    ],
    closing:
      "A burning smell from a heating system can be harmless dust on the first cold day, or it can be a real failure. We won't guess which from a form.",
  },
  electrical: {
    id: "electrical",
    label: "Electrical hazard",
    headline: "Stay away from the equipment and cut power if you safely can.",
    severity: "urgent",
    steps: [
      "Do not touch the equipment, the panel or anything connected to it.",
      "If the breaker panel is dry, accessible and away from the problem, switch off the breaker for that equipment. If there is any doubt, skip this step.",
      "Never stand in water to reach a panel or a switch.",
      "If there is smoke, flame, or scorching that is spreading, leave the building and call 911.",
      "Otherwise, call an electrician or your electric utility before the equipment is used again.",
    ],
    contacts: [
      { label: "Emergency services", detail: "911", href: "tel:911", primary: true },
      {
        label: "Your electric utility",
        detail: "The outage and emergency number is on your electric bill.",
      },
    ],
    closing:
      "Sparking, scorch marks and burning smells around wiring need an electrician, not a form. Once it's safe, we can pick up the HVAC or plumbing side.",
  },
  flooding: {
    id: "flooding",
    label: "Uncontrolled flooding",
    headline: "Shut the water off if you can reach the valve safely.",
    severity: "urgent",
    steps: [
      "If you can reach the main water shutoff without walking through deep or moving water, turn it off. It is usually where the water line enters the building, often near the meter or the water heater.",
      "Keep away from any outlet, panel or appliance that water has reached.",
      "If water is near electrical equipment and you cannot safely reach the breaker panel, leave the area and call 911.",
      "Move what you can out of the water, and take photos for your insurance once it is safe.",
      "Call us as soon as the water is off — an active flood is a phone call, not a web form.",
    ],
    contacts: [
      { label: "Emergency services", detail: "911", href: "tel:911", primary: true },
      { label: "Kennedy's Inc.", detail: "(765) 664-5578", href: "tel:+17656645578" },
    ],
    closing:
      "You can still finish this request so the office has the full picture — but please call first if water is still running.",
  },
  sewage: {
    id: "sewage",
    label: "Sewage backing up",
    headline: "Stop running water and keep everyone out of the affected area.",
    severity: "urgent",
    steps: [
      "Stop using every drain, toilet, washing machine and dishwasher in the building.",
      "Keep people and pets out of the affected rooms — sewage is a health hazard, not just a mess.",
      "Do not try to clear a main line yourself with chemicals.",
      "If sewage has reached electrical outlets or a furnace, keep clear and call 911.",
      "Call us so this is handled as a same-day call rather than a queued request.",
    ],
    contacts: [{ label: "Kennedy's Inc.", detail: "(765) 664-5578", href: "tel:+17656645578", primary: true }],
    closing:
      "Finish the request if you'd like the office to have the details in writing, but a sewage backup should start with a phone call.",
  },
};

export const SAFETY_FLAG_LABEL: Record<SafetyFlagId, string> = Object.fromEntries(
  Object.values(SAFETY_PROTOCOLS).map((p) => [p.id, p.label]),
) as Record<SafetyFlagId, string>;

/** Highest-severity protocol first — that's the one we lead with. */
export function primaryProtocol(flags: SafetyFlagId[]): SafetyProtocol | null {
  if (flags.length === 0) return null;
  const ordered: SafetyFlagId[] = [
    "carbon-monoxide",
    "gas-odor",
    "smoke-fire",
    "electrical",
    "sewage",
    "flooding",
  ];
  const first = ordered.find((f) => flags.includes(f));
  return first ? SAFETY_PROTOCOLS[first] : null;
}
