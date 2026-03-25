import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadDetailClient } from "@/components/lead-detail-client";
import { DatabaseErrorState } from "@/components/database-error-state";
import { getDatabaseIssue, logDatabaseIssue } from "@/lib/database-issue";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        analyses: { orderBy: { fetchedAt: "desc" }, take: 1 },
        messageDraftSets: { orderBy: { createdAt: "desc" }, take: 1 },
        leadNotes: { orderBy: { createdAt: "desc" } },
        events: { orderBy: { createdAt: "desc" } }
      }
    });

    if (!lead) return notFound();
    return <LeadDetailClient lead={lead} />;
  } catch (error) {
    logDatabaseIssue(`lead page ${id}`, error);
    return <DatabaseErrorState {...getDatabaseIssue(error)} />;
  }
}
