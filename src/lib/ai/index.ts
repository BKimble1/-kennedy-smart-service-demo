import { DemoAIProvider, demoProvider } from "./demo-provider";
import { LiveAIProvider } from "./live-provider";
import type { AIProvider } from "./provider";

export * from "./provider";
export { DemoAIProvider, demoProvider, LiveAIProvider };

let cached: AIProvider | null = null;

/**
 * Resolve the active provider.
 *
 * `NEXT_PUBLIC_AI_MODE=live` opts into the hosted-model path; anything else
 * (including unset) runs the deterministic demo engine. There is no way for the
 * app to end up broken because a key is missing — `LiveAIProvider` itself falls
 * back to the demo engine per call.
 */
export function getProvider(): AIProvider {
  if (cached) return cached;
  const mode = process.env.NEXT_PUBLIC_AI_MODE;
  cached = mode === "live" ? new LiveAIProvider() : demoProvider;
  return cached;
}

export function isLiveMode(): boolean {
  return process.env.NEXT_PUBLIC_AI_MODE === "live";
}
