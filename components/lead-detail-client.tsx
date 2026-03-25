"use client";

import { useState } from "react";

export function LeadDetailClient({ lead }: { lead: any }) {
  const [data, setData] = useState(lead);
  const [note, setNote] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(lead.websiteUrl ?? "");
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/leads/${data.id}`);
    const next = await res.json();
    setData(next);
    setWebsiteUrl(next.websiteUrl ?? "");
  }

  async function runAnalysis() {
    setMessage(null);

    if (!data.websiteUrl) {
      setMessage("Add a website URL before running analysis.");
      return;
    }

    const res = await fetch(`/api/leads/${data.id}/analyse`, { method: "POST" });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setMessage(payload?.error || "Could not run analysis.");
      return;
    }

    await refresh();
    setMessage("Website analysis complete.");
  }

  async function generateDrafts() {
    setMessage(null);
    const res = await fetch(`/api/leads/${data.id}/drafts`, { method: "POST" });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setMessage(payload?.error || "Could not generate drafts.");
      return;
    }

    await refresh();
    setMessage("Draft sequence generated.");
  }

  async function addNote() {
    setMessage(null);
    const res = await fetch(`/api/leads/${data.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note })
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setMessage(payload?.error || "Could not save note.");
      return;
    }

    setNote("");
    await refresh();
    setMessage("Note added.");
  }

  async function saveWebsite() {
    setMessage(null);
    const res = await fetch(`/api/leads/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteUrl })
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setMessage(payload?.error || "Could not update website.");
      return;
    }

    await refresh();
    setMessage("Website updated.");
  }

  const analysis = data.analyses?.[0];
  const drafts = data.messageDraftSets?.[0];

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{data.companyName}</h2>
          <p className="text-sm text-slate-600">{data.contactName} - {data.status} - Score {data.score ?? "-"}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
            {data.linkedinProfileUrl ? <a className="text-teal-700 underline-offset-2 hover:underline" href={data.linkedinProfileUrl} target="_blank" rel="noreferrer">LinkedIn profile</a> : <span>No LinkedIn profile saved</span>}
            <span>Source: {data.source ?? "manual"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={runAnalysis}>Run website analysis</button>
          <button className="btn" onClick={generateDrafts}>Generate message drafts</button>
        </div>
      </section>

      <section className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[260px] flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Website URL</label>
            <input className="input" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
          </div>
          <button className="btn" onClick={saveWebsite}>Save website</button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
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
          <ul className="space-y-2 text-sm">{data.leadNotes.map((n: any) => <li key={n.id}>- {n.content}</li>)}</ul>
        </div>
        <div className="card">
          <h3 className="mb-2 font-medium">Activity log</h3>
          <ul className="space-y-2 text-sm">{data.events.map((e: any) => <li key={e.id}>{new Date(e.createdAt).toLocaleString()} - {e.message}</li>)}</ul>
        </div>
      </section>
    </div>
  );
}
