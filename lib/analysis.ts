import * as cheerio from "cheerio";
import OpenAI from "openai";

const MODEL = "gpt-4.1-mini";

type AnalysisResult = {
  homepageTitle?: string;
  homepageDescription?: string;
  homepageSummary: string;
  observedIssues: string[];
  likelyHypotheses: string[];
  nextChecks: string[];
};

function extractPageSignals(html: string) {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const description = $("meta[name='description']").attr("content")?.trim();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);
  return { title, description, bodyText };
}

export async function analyseWebsite(url: string): Promise<AnalysisResult> {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  const html = await response.text();
  const signals = extractPageSignals(html);

  if (!process.env.OPENAI_API_KEY) {
    return {
      homepageTitle: signals.title,
      homepageDescription: signals.description,
      homepageSummary: signals.bodyText.slice(0, 220) || "No visible text extracted.",
      observedIssues: ["Manual review needed: OpenAI key not configured."],
      likelyHypotheses: ["Primary CTA or trust hierarchy may need tightening."],
      nextChecks: ["Check mobile hero, form friction and social proof placement."]
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `You are reviewing homepage copy for CRO outreach prep.
Return strict JSON with keys: homepageSummary, observedIssues(array max 3), likelyHypotheses(array max 3), nextChecks(array max 3).
Use British English. Do not invent facts beyond provided text.
Homepage title: ${signals.title || "N/A"}
Homepage description: ${signals.description || "N/A"}
Visible text: ${signals.bodyText}`;

  const completion = await client.responses.create({
    model: MODEL,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "website_analysis",
        schema: {
          type: "object",
          properties: {
            homepageSummary: { type: "string" },
            observedIssues: { type: "array", items: { type: "string" } },
            likelyHypotheses: { type: "array", items: { type: "string" } },
            nextChecks: { type: "array", items: { type: "string" } }
          },
          required: ["homepageSummary", "observedIssues", "likelyHypotheses", "nextChecks"],
          additionalProperties: false
        }
      }
    }
  });

  const output = JSON.parse(completion.output_text);
  return {
    homepageTitle: signals.title,
    homepageDescription: signals.description,
    ...output
  };
}
