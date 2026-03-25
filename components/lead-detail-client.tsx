"use client";

import { useState } from "react";

export function LeadDetailClient({ lead }: { lead: any }) {
  const [data, setData] = useState(lead);
  const [note, setNote] = useState("");

  async function refresh() {
    const res = await fetch(`/api/leads/${data.id}`);
    setData(await res.json());
  }

  async function runAnalysis() {
    await fetch(`/api/leads/${data.id}/analyse`, { method: "POST" });
    refresh();
  }

  async function generateDrafts() {
    await fetch(`/api/leads/${data.id}/drafts`, { method: "POST" });
    refresh();
  }

  async function addNote() {
    await fetch(`/api/leads/${data.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note })
    });
    setNote("");
    refresh();
  }

  const analysis = data.analyses?.[0];
  const drafts = data.messageDraftSets?.[0];

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{data.companyName}</h2>
          <p className="text-sm text-slate-600">{data.contactName} • {data.status} • Score {data.score ?? "-"}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={runAnalysis}>Run website analysis</button>
          <button className="btn" onClick={generateDrafts}>Generate message drafts</button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-2 font-medium">Latest analysis</h3>
          {analysis ? (
            <div className="space-y-2 text-sm">
              <p><b>Summary:</b> {analysis.homepageSummary}</p>
              <p><b>Observed issues:</b> {(analysis.observedIssues || []).join(" | ")}</p>
              <p><b>Hypotheses:</b> {(analysis.likelyHypotheses || []).join(" | ")}</p>
              <p><b>Next checks:</b> {(analysis.nextChecks || []).join(" | ")}</p>
            </div>
          ) : <p className="text-sm text-slate-500">No analysis yet.</p>}
        </div>

        <div className="card">
          <h3 className="mb-2 font-medium">Draft sequence</h3>
          {drafts ? (
            <div className="space-y-2 text-sm">
              <p><b>Why this lead:</b> {drafts.whyThisLead}</p>
              <p><b>Connection:</b> {drafts.connectionNote}</p>
              <p><b>Follow-up 1:</b> {drafts.followUpOne}</p>
              <p><b>Follow-up 2:</b> {drafts.followUpTwo}</p>
              <p><b>Audit offer:</b> {drafts.auditOfferMessage}</p>
            </div>
          ) : <p className="text-sm text-slate-500">No draft set yet.</p>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-2 font-medium">Internal notes</h3>
          <div className="mb-2 flex gap-2">
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
            <button className="btn" onClick={addNote}>Save</button>
          </div>
          <ul className="space-y-2 text-sm">{data.leadNotes.map((n: any) => <li key={n.id}>• {n.content}</li>)}</ul>
        </div>
        <div className="card">
          <h3 className="mb-2 font-medium">Activity log</h3>
          <ul className="space-y-2 text-sm">{data.events.map((e: any) => <li key={e.id}>{new Date(e.createdAt).toLocaleString()} — {e.message}</li>)}</ul>
        </div>
      </section>
    </div>
  );
}
