/**
 * Public, factual information about the business this concept was built around.
 *
 * Sourced from Kennedy's Inc.'s public listings and website. Nothing here is
 * proprietary, and nothing in this app should imply Kennedy's commissioned,
 * reviewed or approved it — see `CONCEPT_NOTICE`.
 */
export const BUSINESS = {
  name: "Kennedy's Inc.",
  shortName: "Kennedy's",
  trade: "Heating, Cooling & Plumbing",
  since: 1975,
  phone: "(765) 664-5578",
  phoneHref: "tel:+17656645578",
  address: "214 E 2nd St",
  city: "Marion",
  state: "IN",
  zip: "46952",
  website: "kennedyheatingandair.com",
  websiteUrl: "https://kennedyheatingandair.com/",
  /** Publicly listed office hours. Used only to show after-hours capture. */
  officeHours: { openHour: 8, closeHour: 17, weekdaysOnly: true },
  officeHoursLabel: "Mon–Fri, 8:00am – 5:00pm",
  serviceAreaLabel: "Marion, Gas City & the greater Grant County area",
  credentials: [
    "NATE-certified technicians",
    "Authorized Bryant dealer",
    "Serving Grant County since 1975",
  ],
} as const;

/** Towns used for demo addresses — all real places inside the stated service area. */
export const SERVICE_AREA_TOWNS = [
  { city: "Marion", zip: "46952" },
  { city: "Marion", zip: "46953" },
  { city: "Gas City", zip: "46933" },
  { city: "Jonesboro", zip: "46938" },
  { city: "Upland", zip: "46989" },
  { city: "Fairmount", zip: "46928" },
  { city: "Van Buren", zip: "46991" },
  { city: "Sweetser", zip: "46987" },
  { city: "Converse", zip: "46919" },
  { city: "Swayzee", zip: "46986" },
] as const;

export const CONCEPT_NOTICE = {
  short: "Concept demonstration prepared for Kennedy's Inc.",
  long:
    "This is an independent prototype built to explore how a service-request workflow could work. " +
    "It is not an official Kennedy's Inc. system, it is not connected to their scheduling or billing, " +
    "and nothing submitted here reaches the business.",
  builtBy: "Built as a working concept by an independent developer.",
} as const;

/**
 * The person showing this demo. Filled in once, here, and used on the About
 * page and in the footer. Left blank the UI simply omits the contact block —
 * the demo never invents a name.
 */
export interface Builder {
  name: string;
  email: string;
  phone: string;
  /** One line on who you are. Shown under the name on /about. */
  blurb: string;
}

export const BUILDER: Builder = {
  name: "",
  email: "",
  phone: "",
  blurb: "Independent software developer.",
};

export function hasBuilderContact(): boolean {
  return Boolean(BUILDER.name || BUILDER.email || BUILDER.phone);
}

export const PRODUCT = {
  name: "Smart Service Desk",
  fullName: "Kennedy's Smart Service Desk",
  tagline: "Structured service requests, ready to dispatch.",
} as const;
