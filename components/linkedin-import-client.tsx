"use client";

import { useState } from "react";

type ParsedLead = {
  companyName: string;
  websiteUrl: null;
  contactName: string;
  linkedinProfileUrl: string | null;
  role: string | null;
  source: string;
  notes: string | null;
};

export function LinkedInImportClient() {
  const [html, setHtml] = useState("");
  const [preview, setPreview] = useState<ParsedLead[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function previewImport() {
    setIsPreviewing(true);
    setMessage(null);

    const res = await fetch("/api/import/linkedin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, mode: "preview" })
    });

    const payload = await res.json().catch(() => null);
    setIsPreviewing(false);

    if (!res.ok) {
      setPreview([]);
      setMessage(payload?.error || "Could not parse that HTML.");
      return;
    }

    setPreview(payload.leads ?? []);
    setMessage(`Extracted ${payload.leads?.length ?? 0} lead${payload.leads?.length === 1 ? "" : "s"}.`);
  }

  async function importPreview() {
    setIsImporting(true);
    setMessage(null);

    const res = await fetch("/api/import/linkedin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, mode: "import" })
    });

    const payload = await res.json().catch(() => null);
    setIsImporting(false);

    if (!res.ok) {
      setMessage(payload?.error || "Could not import leads.");
      return;
    }

    setPreview(payload.leads ?? []);
    setMessage(`Imported ${payload.importedCount} lead${payload.importedCount === 1 ? "" : "s"}; skipped ${payload.skippedCount} duplicate${payload.skippedCount === 1 ? "" : "s"}.`);
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div>
          <h2 className="text-xl font-semibold">LinkedIn HTML import</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Paste copied LinkedIn table HTML here to extract people into leads. Website URLs are left blank on import, so you can add them later before running website analysis.</p>
        </div>

        <textarea
          className="input min-h-[320px] font-mono text-xs"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="Paste copied LinkedIn table HTML here"
        />

        <div className="flex flex-wrap gap-3">
          <button className="btn" disabled={!html.trim() || isPreviewing} onClick={previewImport}>{isPreviewing ? "Parsing..." : "Preview import"}</button>
          <button className="btn" disabled={preview.length === 0 || isImporting} onClick={importPreview}>{isImporting ? "Importing..." : "Import leads"}</button>
        </div>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </section>

      {preview.length > 0 ? (
        <section className="card">
          <h3 className="mb-3 font-medium">Preview ({preview.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2">Contact</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>LinkedIn</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((lead, index) => (
                  <tr key={`${lead.contactName}-${lead.companyName}-${index}`} className="border-b align-top">
                    <td className="py-2">{lead.contactName}</td>
                    <td>{lead.companyName}</td>
                    <td>{lead.role ?? "-"}</td>
                    <td>{lead.linkedinProfileUrl ? <a className="text-teal-700 hover:underline" href={lead.linkedinProfileUrl} target="_blank" rel="noreferrer">Open</a> : "-"}</td>
                    <td>{lead.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
