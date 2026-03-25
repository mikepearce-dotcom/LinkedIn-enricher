import OpenAI from "openai";
import { buildDraftSystemPrompt, buildDraftUserPrompt, DEFAULT_DRAFT_MODEL } from "./prompts";
import { DRAFT_FIELD_KEYS, type DraftBundle, type LeadContext } from "./types";

function isDraftBundle(value: unknown): value is DraftBundle {
  if (!value || typeof value !== "object") return false;
  return DRAFT_FIELD_KEYS.every((key) => typeof (value as DraftBundle)[key] === "string");
}

export async function generateDraftBundle(lead: LeadContext): Promise<{ drafts: DraftBundle; model: string }> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: DEFAULT_DRAFT_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.3,
    messages: [
      { role: "system", content: buildDraftSystemPrompt() },
      { role: "user", content: buildDraftUserPrompt(lead) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response while generating drafts.");
  }

  const parsed = JSON.parse(content) as unknown;
  if (!isDraftBundle(parsed)) {
    throw new Error("OpenAI response did not match the required draft schema.");
  }

  return { drafts: parsed, model: completion.model };
}
