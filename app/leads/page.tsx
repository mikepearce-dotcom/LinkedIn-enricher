import { prisma } from "@/lib/prisma";
import { LeadsClient } from "@/components/leads-client";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return <LeadsClient initialLeads={leads} />;
}
