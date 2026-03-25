import OpenAI from "openai";
import { buildDraftSystemPrompt, buildDraftUserPrompt, DEFAULT_DRAFT_MODEL } from "./prompts";
import { coerceDraftBundle, type DraftBundle, type LeadContext } from "./types";

function parseJsonPayload(content: string): unknown {
  const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
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

  const parsed = parseJsonPayload(content);
  const drafts = coerceDraftBundle(parsed);
  if (!drafts) {
    throw new Error("OpenAI response did not match the required draft schema.");
  }

  return { drafts, model: completion.model };
}
