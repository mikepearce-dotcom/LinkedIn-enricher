import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toLabel } from "@/lib/status";
import { DatabaseErrorState } from "@/components/database-error-state";
import { getDatabaseIssue, logDatabaseIssue } from "@/lib/database-issue";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const [totalLeads, statusCounts, topScored, recentAnalysed, readyToContact] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({ by: ["status"], _count: true }),
      prisma.lead.findMany({ where: { score: { not: null } }, orderBy: { score: "desc" }, take: 5 }),
      prisma.lead.findMany({ where: { status: "ANALYSED" }, orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.lead.findMany({ where: { status: "READY_TO_CONTACT" }, orderBy: { updatedAt: "desc" }, take: 8 })
    ]);

    return (
      <main className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="card"><p className="text-sm text-slate-500">Total Leads</p><p className="text-3xl font-semibold">{totalLeads}</p></div>
          <div className="card md:col-span-3">
            <p className="mb-2 text-sm text-slate-500">Leads by Stage</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {statusCounts.map((item) => <span key={item.status} className="rounded bg-slate-100 px-3 py-1">{toLabel(item.status)}: {item._count}</span>)}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h2 className="mb-3 font-medium">Top scored leads</h2>
            <ul className="space-y-2 text-sm">{topScored.map((lead) => <li key={lead.id}><Link className="text-teal-700" href={`/leads/${lead.id}`}>{lead.companyName}</Link> - {lead.score}</li>)}</ul>
          </div>
          <div className="card">
            <h2 className="mb-3 font-medium">Recently analysed</h2>
            <ul className="space-y-2 text-sm">{recentAnalysed.map((lead) => <li key={lead.id}><Link className="text-teal-700" href={`/leads/${lead.id}`}>{lead.companyName}</Link></li>)}</ul>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium">Ready to contact</h2>
          <ul className="grid gap-2 text-sm md:grid-cols-2">{readyToContact.map((lead) => <li key={lead.id}><Link className="text-teal-700" href={`/leads/${lead.id}`}>{lead.companyName}</Link> ({lead.contactName})</li>)}</ul>
        </section>
      </main>
    );
  } catch (error) {
    logDatabaseIssue("dashboard page", error);
    return <DatabaseErrorState {...getDatabaseIssue(error)} />;
  }
}
