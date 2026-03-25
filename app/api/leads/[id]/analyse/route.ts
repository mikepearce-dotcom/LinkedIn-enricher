import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyseWebsite } from "@/lib/analysis";
import { calculateOpportunityScore } from "@/lib/scoring";
import { logEvent } from "@/lib/events";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const analysis = await analyseWebsite(lead.websiteUrl);
  const score = calculateOpportunityScore({
    hasCommercialIntent: /pricing|book|demo|contact|service/i.test(analysis.homepageSummary),
    hasVisibleIssues: analysis.observedIssues.length,
    role: lead.role,
    websiteUrl: lead.websiteUrl
  });

  const created = await prisma.leadAnalysis.create({
    data: {
      leadId: id,
      homepageTitle: analysis.homepageTitle,
      homepageDescription: analysis.homepageDescription,
      homepageSummary: analysis.homepageSummary,
      observedIssues: analysis.observedIssues,
      likelyHypotheses: analysis.likelyHypotheses,
      nextChecks: analysis.nextChecks
    }
  });

  await prisma.lead.update({ where: { id }, data: { score, status: "ANALYSED" } });
  await logEvent(id, "analysed", `Website analysed. Score updated to ${score}`);

  return NextResponse.json({ analysis: created, score });
}
