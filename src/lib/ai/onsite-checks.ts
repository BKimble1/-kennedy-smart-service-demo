import type { RequestSignal, ServiceCategoryId } from "@/lib/domain/types";

/**
 * "Information worth confirming onsite" — deliberately observational.
 *
 * These are things for a technician to *record*, not conclusions about what is
 * wrong. Nothing in this file states a cause, and nothing recommends a repair or
 * a replacement. A form cannot diagnose equipment and this product never
 * pretends otherwise.
 */
const BY_ISSUE: Record<string, string[]> = {
  "cooling:not-cooling": [
    "Thermostat mode, setpoint and current room temperature on arrival",
    "Filter condition and size (for restock)",
    "Whether the outdoor unit runs when cooling is called",
    "Supply and return temperatures",
  ],
  "cooling:warm-air": [
    "Whether the outdoor condenser is running when cooling is called",
    "Supply and return air temperature split",
    "Condition of the outdoor coil and the indoor filter",
    "Model and serial from the data plate for age and parts lookup",
  ],
  "cooling:wont-start": [
    "Whether the thermostat has power and is calling",
    "Breaker and disconnect positions at the air handler and outdoor unit",
    "Condition of the float switch / condensate safety",
    "Any fault code displayed on the equipment",
  ],
  "cooling:noise": [
    "Where the noise originates — indoor unit, outdoor unit or ductwork",
    "Whether it occurs on start-up, during run, or on shutdown",
    "Blower wheel and outdoor fan condition",
    "Model and serial from the data plate",
  ],
  "cooling:leak": [
    "Where water is collecting and whether the drain line is clear",
    "Condition of the condensate pan, trap and float switch",
    "Whether there is ice on the line set or the coil",
    "Filter condition and airflow restriction",
  ],
  "cooling:maintenance": [
    "Full seasonal checklist and readings",
    "Filter size and condition for the customer's records",
    "Model and serial from the data plate",
  ],
  "cooling:replacement": [
    "Existing equipment model, serial and location",
    "Ductwork condition and available space for a change-out",
    "Electrical service and line set condition",
    "Any comfort complaints room by room",
  ],
  "heating:no-heat": [
    "Thermostat mode, setpoint and whether it is calling for heat",
    "Any fault code or flashing diagnostic light on the furnace board",
    "Filter condition and size",
    "Confirm gas supply is on at the appliance shutoff",
  ],
  "heating:weak-heat": [
    "Supply and return temperature rise against the data-plate range",
    "Filter condition and static pressure if measurable",
    "Whether any registers or returns are blocked or closed",
    "Room-by-room temperatures the customer mentioned",
  ],
  "heating:wont-start": [
    "Thermostat power and call for heat",
    "Furnace door switch, breaker and disconnect",
    "Any fault code on the control board",
    "Condition of the condensate trap on high-efficiency units",
  ],
  "heating:noise": [
    "Where the noise originates and at which stage of the cycle",
    "Blower wheel, motor mounts and inducer condition",
    "Whether ductwork expansion accounts for the sound",
    "Model and serial from the data plate",
  ],
  "heating:smell": [
    "Confirm no gas odor is present before proceeding",
    "Whether the smell is dust burn-off on first seasonal run",
    "Condition of the heat exchanger and burner compartment",
    "Whether a working CO alarm is present in the building",
  ],
  "heating:short-cycling": [
    "Filter condition and airflow restriction",
    "Flame sensor and limit switch condition",
    "Thermostat location and any heat sources near it",
    "Any lockout or fault code history on the board",
  ],
  "heating:maintenance": [
    "Full seasonal checklist and combustion readings",
    "Whether the building has working CO alarms",
    "Filter size and condition for the customer's records",
  ],
  "heating:replacement": [
    "Existing furnace model, serial, venting and location",
    "Ductwork condition and combustion air supply",
    "Electrical and gas service at the appliance",
    "Comfort complaints room by room",
  ],
  "plumbing:leak": [
    "Exact source of the leak and whether it is supply or drain side",
    "Whether the shutoff serving that line holds",
    "Extent of water damage to surrounding materials",
    "Pipe material and size for parts",
  ],
  "plumbing:clogged-drain": [
    "Which fixtures are affected and whether they share a branch",
    "Cleanout location and accessibility",
    "Whether water surfaces elsewhere when another fixture runs",
    "Any history of recurring blockages at the same spot",
  ],
  "plumbing:water-heater": [
    "Model, serial, capacity and fuel type from the data plate",
    "Whether the tank, fittings or relief valve are leaking",
    "Thermostat setting and recovery behavior",
    "Venting, clearances and shutoff condition",
  ],
  "plumbing:toilet": [
    "Whether the leak is at the base, the tank or the supply",
    "Rough-in size and mounting condition",
    "Whether the shutoff holds",
    "Whether other fixtures on the same line are affected",
  ],
  "plumbing:faucet": [
    "Fixture make and model if identifiable",
    "Whether the supply stops hold",
    "Condition of the cabinet or surrounding surfaces",
  ],
  "plumbing:no-water": [
    "Whether the meter and main shutoff are open and the meter is turning",
    "Whether the building is on municipal water or a well",
    "Pressure at an outside spigot if reachable",
    "Whether neighboring properties are affected",
  ],
  "plumbing:low-pressure": [
    "Static pressure at a hose bib",
    "Whether the pressure-reducing valve is present and functioning",
    "Whether aerators or fixture screens are restricted",
    "Whether hot and cold are both affected",
  ],
  "plumbing:sump-pump": [
    "Pump make, model and age",
    "Whether the float and check valve operate freely",
    "Discharge line routing and whether it is frozen or blocked",
    "Whether a battery backup is present",
  ],
  "install:water-heater": [
    "Existing unit model, serial, capacity and fuel type",
    "Venting, combustion air and clearances at the location",
    "Access route for removal and replacement",
    "Expansion tank and shutoff condition",
  ],
  "install:thermostat": [
    "Existing thermostat model and wiring available at the wall",
    "Whether a common wire is present",
    "Equipment stages and accessories to be controlled",
  ],
};

const BY_CATEGORY: Record<ServiceCategoryId, string[]> = {
  cooling: [
    "Thermostat setting and current indoor temperature",
    "Filter condition and size",
    "Model and serial from the data plate",
  ],
  heating: [
    "Thermostat setting and whether the system is calling",
    "Any fault code shown on the equipment",
    "Model and serial from the data plate",
  ],
  plumbing: [
    "Exact location and source of the problem",
    "Whether the nearest shutoff holds",
    "Pipe material and fitting sizes for parts",
  ],
  maintenance: [
    "Full seasonal checklist and readings",
    "Filter size and condition for the customer's records",
    "Model and serial from the data plate",
  ],
  install: [
    "Existing equipment model, serial and location",
    "Access, clearances and utility connections at the site",
    "Anything the customer wants improved over the current setup",
  ],
  other: [
    "What the customer is seeing, in their words, on arrival",
    "Equipment involved and its location",
    "Model and serial from the data plate",
  ],
};

/** Signals that add a universally useful check regardless of the issue. */
const BY_SIGNAL: Partial<Record<RequestSignal, string>> = {
  "aging-equipment":
    "Confirm actual equipment age from the data plate — the customer's estimate may be off",
  "very-old-equipment":
    "Confirm actual equipment age from the data plate before any estimate conversation",
  "repeat-repair":
    "Pull the history on this address before arrival — the customer reports recent work",
  "business-property": "Confirm site access, after-hours entry and who signs off on work",
  "active-water": "Note whether water is still escaping on arrival and where it is reaching",
};

export function onsiteChecks(
  category: ServiceCategoryId,
  issueId: string,
  signals: RequestSignal[],
): string[] {
  const base = BY_ISSUE[`${category}:${issueId}`] ?? BY_CATEGORY[category];
  const extra = signals.map((s) => BY_SIGNAL[s]).filter((x): x is string => Boolean(x));
  const seen = new Set<string>();
  return [...base, ...extra].filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });
}
