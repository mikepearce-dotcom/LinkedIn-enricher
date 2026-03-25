import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDrafts } from "@/lib/drafts";
import { logEvent } from "@/lib/events";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { analyses: { orderBy: { fetchedAt: "desc" }, take: 1 } }
  });

  if (!lead || lead.analyses.length === 0) {
    return NextResponse.json({ error: "Analysis required before draft generation" }, { status: 400 });
  }

  const analysis = lead.analyses[0];
  const drafts = await generateDrafts({
    companyName: lead.companyName,
    contactName: lead.contactName,
    role: lead.role,
    summary: analysis.homepageSummary,
    issues: analysis.observedIssues as string[]
  });

  const created = await prisma.messageDraftSet.create({ data: { leadId: id, ...drafts } });
  await prisma.lead.update({ where: { id }, data: { status: "READY_TO_CONTACT" } });
  await logEvent(id, "drafts_generated", "Draft message sequence generated");

  return NextResponse.json(created);
}
