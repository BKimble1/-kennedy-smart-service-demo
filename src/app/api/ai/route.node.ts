import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  ASSIST_SYSTEM_PROMPT,
  callSummaryPrompt,
  groundingFacts,
  replyPrompt,
  techNotesPrompt,
} from "@/lib/ai/prompts";
import type { ServiceRequest } from "@/lib/domain/types";

/**
 * Optional live-AI endpoint.
 *
 * This file is only part of the build when `STATIC_EXPORT` is unset — see
 * `next.config.ts`. The demo runs identically without it.
 *
 * Keys are read from the server environment and never leave it. The browser
 * posts a request record and receives text back; it never sees a credential.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AssistSchema = z.object({
  callSummary: z.string(),
  replySubject: z.string(),
  replyBody: z.string(),
  techNotes: z.object({
    reportedIssue: z.string(),
    equipment: z.string(),
    symptoms: z.array(z.string()),
    approximateAge: z.string(),
    photos: z.string(),
    safetyConcerns: z.array(z.string()),
    verifyOnsite: z.array(z.string()),
    access: z.string(),
  }),
});

const BodySchema = z.object({
  request: z.custom<ServiceRequest>((v) => typeof v === "object" && v !== null),
  channel: z.enum(["email", "text"]).default("email"),
});

export async function POST(req: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!anthropicKey && !openaiKey) {
    return NextResponse.json(
      { error: "no_provider", message: "No AI credentials configured on the server." },
      { status: 503 },
    );
  }

  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { request: serviceRequest, channel } = parsed;
  const facts = groundingFacts(serviceRequest);

  try {
    const result = anthropicKey
      ? await viaAnthropic(anthropicKey, facts, channel)
      : await viaOpenAI(openaiKey!, facts, channel);
    return NextResponse.json({ provider: anthropicKey ? "anthropic" : "openai", ...result });
  } catch (error) {
    console.error("[ai] generation failed", error);
    return NextResponse.json(
      { error: "generation_failed", message: "Falling back to the demo engine." },
      { status: 502 },
    );
  }
}

async function viaAnthropic(apiKey: string, facts: string, channel: "email" | "text") {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.parse({
    model: process.env.AI_MODEL ?? "claude-opus-5",
    // Short, bounded outputs — a briefing, a reply draft and a prep sheet.
    max_tokens: 4000,
    system: ASSIST_SYSTEM_PROMPT,
    output_config: { effort: "low", format: zodOutputFormat(AssistSchema) },
    messages: [
      {
        role: "user",
        content: [
          callSummaryPrompt(facts),
          "---",
          replyPrompt(facts, channel),
          "---",
          techNotesPrompt(facts),
          "---",
          "Return all three as a single object. `replySubject` may be an empty string for a text message.",
        ].join("\n\n"),
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Model returned no parsable output");
  return parsed;
}

/**
 * OpenAI adapter, kept deliberately small and separate. Anthropic is the
 * primary path; this exists so an owner who already has an OpenAI key isn't
 * blocked. Uses the Responses API with a JSON schema.
 */
async function viaOpenAI(apiKey: string, facts: string, channel: "email" | "text") {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? "gpt-4.1",
      messages: [
        { role: "system", content: ASSIST_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            callSummaryPrompt(facts),
            "---",
            replyPrompt(facts, channel),
            "---",
            techNotesPrompt(facts),
            "---",
            "Return all three as a single JSON object matching the provided schema.",
          ].join("\n\n"),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "assist", strict: false, schema: OPENAI_SCHEMA },
      },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI responded ${res.status}`);
  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return AssistSchema.parse(JSON.parse(json.choices[0].message.content));
}

const OPENAI_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["callSummary", "replySubject", "replyBody", "techNotes"],
  properties: {
    callSummary: { type: "string" },
    replySubject: { type: "string" },
    replyBody: { type: "string" },
    techNotes: {
      type: "object",
      additionalProperties: false,
      required: [
        "reportedIssue",
        "equipment",
        "symptoms",
        "approximateAge",
        "photos",
        "safetyConcerns",
        "verifyOnsite",
        "access",
      ],
      properties: {
        reportedIssue: { type: "string" },
        equipment: { type: "string" },
        symptoms: { type: "array", items: { type: "string" } },
        approximateAge: { type: "string" },
        photos: { type: "string" },
        safetyConcerns: { type: "array", items: { type: "string" } },
        verifyOnsite: { type: "array", items: { type: "string" } },
        access: { type: "string" },
      },
    },
  },
} as const;
