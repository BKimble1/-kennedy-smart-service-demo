import { describe, expect, it } from "vitest";
import {
  availabilityPhrase,
  formatAvailability,
  formatBytes,
  formatPhone,
  phoneHref,
  relativeTime,
  smsHref,
  toISODate,
} from "@/lib/utils/format";

const MON = new Date(2026, 8, 14, 9, 0, 0); // Monday 14 Sep 2026

describe("availability", () => {
  it("says today and tomorrow by name", () => {
    expect(formatAvailability([{ date: toISODate(MON), windows: ["afternoon"] }], MON)).toBe(
      "Today afternoon",
    );
    const tue = new Date(MON);
    tue.setDate(tue.getDate() + 1);
    expect(formatAvailability([{ date: toISODate(tue), windows: ["morning"] }], MON)).toBe(
      "Tomorrow morning",
    );
  });

  it("uses weekday names further out and joins with 'or'", () => {
    const wed = new Date(MON);
    wed.setDate(wed.getDate() + 2);
    const thu = new Date(MON);
    thu.setDate(thu.getDate() + 3);
    expect(
      formatAvailability(
        [
          { date: toISODate(wed), windows: ["afternoon"] },
          { date: toISODate(thu), windows: ["morning"] },
        ],
        MON,
      ),
    ).toBe("Wednesday afternoon or Thursday morning");
  });

  it("collapses all three windows to 'any time'", () => {
    expect(
      formatAvailability(
        [{ date: toISODate(MON), windows: ["morning", "afternoon", "evening"] }],
        MON,
      ),
    ).toBe("Today any time");
  });

  it("keeps weekday capitals in the mid-sentence form", () => {
    const wed = new Date(MON);
    wed.setDate(wed.getDate() + 2);
    const phrase = availabilityPhrase(
      [
        { date: toISODate(MON), windows: ["afternoon"] },
        { date: toISODate(wed), windows: ["morning"] },
      ],
      MON,
    );
    expect(phrase).toBe("today afternoon or Wednesday morning");
    expect(phrase).not.toContain("wednesday");
  });

  it("handles no selection in both forms", () => {
    expect(formatAvailability([], MON)).toBe("No preference given");
    expect(availabilityPhrase([], MON)).toBe("no preference given");
  });

  it("ignores days with no window chosen", () => {
    expect(formatAvailability([{ date: toISODate(MON), windows: [] }], MON)).toBe(
      "No preference given",
    );
  });
});

describe("phone formatting", () => {
  it("formats ten digits", () => {
    expect(formatPhone("7655550142")).toBe("(765) 555-0142");
    expect(formatPhone("17655550142")).toBe("(765) 555-0142");
    expect(formatPhone("(765) 555-0142")).toBe("(765) 555-0142");
  });
  it("leaves unparseable input alone", () => {
    expect(formatPhone("call the shop")).toBe("call the shop");
  });
  it("builds tel: and sms: links", () => {
    expect(phoneHref("(765) 555-0142")).toBe("tel:+17655550142");
    expect(smsHref("7655550142", "hi there")).toBe("sms:+17655550142?&body=hi%20there");
  });
});

describe("relative time", () => {
  const now = new Date(2026, 8, 14, 12, 0, 0);
  it("reads naturally across ranges", () => {
    expect(relativeTime(new Date(2026, 8, 14, 11, 58).toISOString(), now)).toBe("2m ago");
    expect(relativeTime(new Date(2026, 8, 14, 9, 0).toISOString(), now)).toBe("3h ago");
    expect(relativeTime(new Date(2026, 8, 13, 22, 0).toISOString(), now)).toBe("Yesterday");
    expect(relativeTime(new Date(2026, 8, 1, 9, 0).toISOString(), now)).toBe("Sep 1");
  });
});

describe("bytes", () => {
  it("scales units", () => {
    expect(formatBytes(900)).toBe("900 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
