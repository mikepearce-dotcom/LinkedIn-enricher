"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DRAFT_FIELD_KEYS, DRAFT_FIELD_LABELS, type DraftBundle } from "@/lib/drafts/types";

type GenerateStatus = "idle" | "loading" | "ready" | "error";

const EMPTY_DRAFTS: DraftBundle = {
  whyThisLead: "",
  coreProblemAngle: "",
  valueHook: "",
  connectionNote: "",
  followUp1: "",
  followUp2: "",
  auditOfferMessage: "",
};

export default function LeadDraftsPage() {
  const params = useParams<{ id: string }>();
  const leadId = params.id;

  const [drafts, setDrafts] = useState<DraftBundle>(EMPTY_DRAFTS);
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [approvedAt, setApprovedAt] = useState<string>("");

  async function onGenerate() {
    setStatus("loading");
    setError("");
    setApprovedAt("");

    try {
      const response = await fetch(`/api/leads/${leadId}/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed (${response.status})`);
      }

      const payload = (await response.json()) as { drafts: DraftBundle };
      setDrafts(payload.drafts);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown generation error");
    }
  }

  async function onApprove() {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/leads/${leadId}/drafts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drafts }),
      });

      if (!response.ok) {
        throw new Error(`Approve failed (${response.status})`);
      }

      const payload = (await response.json()) as { approvedAt: string };
      setApprovedAt(payload.approvedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown save error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <h1>Drafting flow</h1>
      <p>Lead ID: {leadId || "loading..."}</p>
      <p>Generate, edit, and approve outreach drafts with anti-spam constraints.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button type="button" onClick={onGenerate} disabled={status === "loading" || !leadId}>
          {status === "loading" ? "Generating..." : "Generate drafts"}
        </button>
        <button type="button" onClick={onApprove} disabled={isSaving || status !== "ready"}>
          {isSaving ? "Saving..." : "Save approved copy"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {approvedAt && <p style={{ color: "green" }}>Approved at: {new Date(approvedAt).toLocaleString()}</p>}

      <section style={{ display: "grid", gap: 12 }}>
        {DRAFT_FIELD_KEYS.map((field) => (
          <label key={field} style={{ display: "grid", gap: 6 }}>
            <strong>{DRAFT_FIELD_LABELS[field]}</strong>
            <textarea
              value={drafts[field]}
              onChange={(event) => {
                const next = event.target.value;
                setDrafts((prev) => ({ ...prev, [field]: next }));
              }}
              rows={3}
              placeholder={`Write ${DRAFT_FIELD_LABELS[field].toLowerCase()}...`}
            />
          </label>
        ))}
      </section>
    </main>
  );
}
