"use client";

import Link from "next/link";
import { useState } from "react";

type Lead = {
  id: string;
  companyName: string;
  websiteUrl: string;
  contactName: string;
  status: string;
  score: number | null;
};

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [form, setForm] = useState({ companyName: "", websiteUrl: "", contactName: "" });

  async function createLead() {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!res.ok) return;
    const lead = await res.json();
    setLeads([lead, ...leads]);
    setForm({ companyName: "", websiteUrl: "", contactName: "" });
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="mb-3 font-medium">Add lead</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input" placeholder="Company" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <input className="input" placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <input className="input" placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        </div>
        <button className="btn mt-3" onClick={createLead}>Create lead</button>
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
