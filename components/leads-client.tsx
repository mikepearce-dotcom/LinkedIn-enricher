"use client";

import Link from "next/link";
import { useState } from "react";

type Lead = {
  id: string;
  companyName: string;
  websiteUrl: string | null;
  contactName: string;
  status: string;
  score: number | null;
};

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [form, setForm] = useState({ companyName: "", websiteUrl: "", contactName: "" });
  const [message, setMessage] = useState<string | null>(null);

  async function createLead() {
    setMessage(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setMessage(payload?.error || "Could not create lead.");
      return;
    }

    const lead = await res.json();
    setLeads([lead, ...leads]);
    setForm({ companyName: "", websiteUrl: "", contactName: "" });
    setMessage("Lead created.");
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 font-medium">Add lead</h2>
            <p className="text-sm text-slate-500">Website is optional. You can also bulk import pasted LinkedIn HTML.</p>
          </div>
          <Link href="/import" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Open import</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input className="input" placeholder="Company" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <input className="input" placeholder="Website URL (optional)" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <input className="input" placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button className="btn" onClick={createLead}>Create lead</button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">Lead list</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b text-slate-500"><th className="py-2">Company</th><th>Contact</th><th>Status</th><th>Score</th></tr></thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b">
                  <td className="py-2"><Link className="text-teal-700" href={`/leads/${lead.id}`}>{lead.companyName}</Link></td>
                  <td>{lead.contactName}</td>
                  <td>{lead.status}</td>
                  <td>{lead.score ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
