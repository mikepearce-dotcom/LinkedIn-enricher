import { prisma } from "@/lib/prisma";
import { LeadsClient } from "@/components/leads-client";
import { DatabaseErrorState } from "@/components/database-error-state";
import { getDatabaseIssue, logDatabaseIssue } from "@/lib/database-issue";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    return <LeadsClient initialLeads={leads} />;
  } catch (error) {
    logDatabaseIssue("leads page", error);
    return <DatabaseErrorState {...getDatabaseIssue(error)} />;
  }
}
