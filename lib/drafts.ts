import OpenAI from "openai";

const MODEL = "gpt-4.1-mini";

type Inputs = {
  companyName: string;
  contactName: string;
  role?: string | null;
  summary: string;
  issues: string[];
};

export async function generateDrafts(input: Inputs) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      whyThisLead: `${input.companyName} appears to have clear buying intent and visible CRO opportunities.`,
      coreProblemAngle: "Mixed CTA hierarchy may be weakening demo or enquiry conversion.",
      valueHook: "A focused fixed-price audit can prioritise revenue-impact fixes quickly.",
      connectionNote: `Hi ${input.contactName}, had a quick look at ${input.companyName} and noticed a possible CTA clarity gap on the homepage. Open to connect?`,
      followUpOne: "Thanks for connecting — I can share 2-3 specific CRO observations from your homepage if useful.",
      followUpTwo: "Quick nudge — one issue seems to be competing actions above the fold, which can suppress conversion intent.",
      auditOfferMessage: "If helpful, I run a fixed-price CRO audit (£500) with prioritised fixes and practical screenshots.",
      offerPositioning: "Focused CRO audit, fixed fee, clear actions your team can implement quickly."
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Generate concise LinkedIn outreach drafts in British English.
Tone: plain, sharp, human, problem-first, no hype.
Lead: ${input.contactName} at ${input.companyName} (${input.role || "unknown role"}).
Homepage summary: ${input.summary}
Observed issues: ${input.issues.join("; ")}
Return JSON keys: whyThisLead, coreProblemAngle, valueHook, connectionNote, followUpOne, followUpTwo, auditOfferMessage, offerPositioning.`;

  const completion = await client.responses.create({
    model: MODEL,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "drafts",
        schema: {
          type: "object",
          properties: {
            whyThisLead: { type: "string" },
            coreProblemAngle: { type: "string" },
            valueHook: { type: "string" },
            connectionNote: { type: "string" },
            followUpOne: { type: "string" },
            followUpTwo: { type: "string" },
            auditOfferMessage: { type: "string" },
            offerPositioning: { type: "string" }
          },
          required: ["whyThisLead", "coreProblemAngle", "valueHook", "connectionNote", "followUpOne", "followUpTwo", "auditOfferMessage", "offerPositioning"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.output_text);
}
