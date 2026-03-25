import type { LeadContext } from "./types";

export const DEFAULT_DRAFT_MODEL = process.env.OPENAI_DRAFT_MODEL ?? "gpt-4.1-mini";

const styleRules = [
  "Problem-first: lead with the pain/risk before talking about solution.",
  "Keep each field short and specific (1-3 short sentences, no fluff).",
  "No hype, no buzzwords, no claims you cannot prove.",
  "Anti-spam constraints: no manipulative urgency, no fake familiarity, no clickbait.",
  "Write in British English spelling and tone.",
  "Use plain language and concrete business outcomes.",
  "Do not include links, emojis, hashtags, or all-caps words.",
  "If context is missing, write a cautious, honest line instead of inventing facts.",
].join("\n- ");

export function buildDraftSystemPrompt(): string {
  return [
    "You are an expert B2B outbound copywriter.",
    "Return strict JSON only.",
    "Write copy that is useful, respectful, and non-spammy.",
    "Follow these constraints:",
    `- ${styleRules}`,
  ].join("\n");
}

export function buildDraftUserPrompt(lead: LeadContext): string {
  return JSON.stringify(
    {
      task: "Generate a draft outreach pack",
      requiredFields: [
        "whyThisLead",
        "coreProblemAngle",
        "valueHook",
        "connectionNote",
        "followUp1",
        "followUp2",
        "auditOffer",
      ],
      lead,
      outputSchema: {
        whyThisLead: "string",
        coreProblemAngle: "string",
        valueHook: "string",
        connectionNote: "string",
        followUp1: "string",
        followUp2: "string",
        auditOffer: "string",
      },
      guardrails: {
        maxWordsPerField: 45,
        tone: "specific, consultative, problem-first",
        avoid: ["generic intros", "hard-sell CTA", "spam language"],
      },
    },
    null,
    2,
  );
}
