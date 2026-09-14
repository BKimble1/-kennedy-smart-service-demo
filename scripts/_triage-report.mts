import { buildSeedRequests } from "../src/lib/store/seed";
import { demoProvider } from "../src/lib/ai/demo-provider";

const seeds = buildSeedRequests(new Date(2026, 8, 15, 10, 30, 0));
const counts: Record<string, number> = {};
for (const r of seeds) {
  counts[r.triage.priority] = (counts[r.triage.priority] ?? 0) + 1;
  console.log(
    `${r.reference}  ${r.triage.priority.padEnd(10)} score=${String(r.triage.score).padStart(3)}  urgency=${r.urgency.padEnd(15)} ${r.issueLabel}`,
  );
}
console.log("\nDISTRIBUTION", counts);
console.log("\n--- call summary sample ---");
console.log(await demoProvider.callSummary(seeds.find((s) => s.reference === "KSD-4206")!));
console.log("\n--- planning-ahead sample ---");
console.log(await demoProvider.callSummary(seeds.find((s) => s.reference === "KSD-4194")!));
