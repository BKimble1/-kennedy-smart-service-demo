import { buildSeedRequests } from "../src/lib/store/seed";
import { buildOneLine } from "../src/lib/ai/demo-provider";
for (const r of buildSeedRequests(new Date(2026, 8, 15, 10, 30))) {
  console.log(r.reference.padEnd(9), "|", buildOneLine(r));
}
