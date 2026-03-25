import { NextRequest, NextResponse } from "next/server";
import { generateDraftBundle } from "@/lib/drafts/service";
import { DRAFT_FIELD_KEYS, type ApprovedDraftPayload, type LeadContext } from "@/lib/drafts/types";
import { logEvent } from "@/lib/server/events";
import { saveApprovedDraft } from "@/lib/server/drafts-repo";

function coerceLeadContext(id: string, body: unknown): LeadContext {
  if (!body || typeof body !== "object") {
    return { id };
  }

  const payload = body as Partial<LeadContext>;
  return {
    id,
    fullName: payload.fullName,
    role: payload.role,
    company: payload.company,
    headline: payload.headline,
    recentSignals: Array.isArray(payload.recentSignals) ? payload.recentSignals.filter(Boolean) : undefined,
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await request.json().catch(() => ({}));
  const lead = coerceLeadContext(id, json);

  const { drafts, model } = await generateDraftBundle(lead);
  const generatedAt = new Date().toISOString();

  await logEvent("DraftsGenerated", {
    leadId: id,
    model,
    generatedAt,
    fields: DRAFT_FIELD_KEYS,
  });

  return NextResponse.json({
    leadId: id,
    drafts,
    model,
    generatedAt,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json()) as Partial<ApprovedDraftPayload>;

  if (!payload?.drafts || typeof payload.drafts !== "object") {
    return NextResponse.json({ error: "Missing drafts payload." }, { status: 400 });
  }

  const missingKey = DRAFT_FIELD_KEYS.find((key) => typeof payload.drafts?.[key] !== "string");
  if (missingKey) {
    return NextResponse.json({ error: `Missing required draft field: ${missingKey}` }, { status: 400 });
  }

  const approved: ApprovedDraftPayload = {
    leadId: id,
    drafts: payload.drafts,
    approvedAt: new Date().toISOString(),
  };

  await saveApprovedDraft(approved);
  await logEvent("DraftApproved", {
    leadId: id,
    approvedAt: approved.approvedAt,
    fields: DRAFT_FIELD_KEYS,
  });

  return NextResponse.json(approved);
}
