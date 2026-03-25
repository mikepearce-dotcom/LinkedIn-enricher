export type DraftFieldKey =
  | "whyThisLead"
  | "coreProblemAngle"
  | "valueHook"
  | "connectionNote"
  | "followUp1"
  | "followUp2"
  | "auditOffer";

export type DraftBundle = Record<DraftFieldKey, string>;

export const DRAFT_FIELD_LABELS: Record<DraftFieldKey, string> = {
  whyThisLead: "Why this lead",
  coreProblemAngle: "Core problem angle",
  valueHook: "Value hook",
  connectionNote: "Connection note",
  followUp1: "Follow-up 1",
  followUp2: "Follow-up 2",
  auditOffer: "Audit offer message",
};

export const DRAFT_FIELD_KEYS = Object.keys(DRAFT_FIELD_LABELS) as DraftFieldKey[];

export function coerceDraftBundle(value: unknown): DraftBundle | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const auditOffer = typeof raw.auditOffer === "string" ? raw.auditOffer : raw.auditOfferMessage;
  if (
    typeof raw.whyThisLead !== "string" ||
    typeof raw.coreProblemAngle !== "string" ||
    typeof raw.valueHook !== "string" ||
    typeof raw.connectionNote !== "string" ||
    typeof raw.followUp1 !== "string" ||
    typeof raw.followUp2 !== "string" ||
    typeof auditOffer !== "string"
  ) {
    return null;
  }

  return {
    whyThisLead: raw.whyThisLead,
    coreProblemAngle: raw.coreProblemAngle,
    valueHook: raw.valueHook,
    connectionNote: raw.connectionNote,
    followUp1: raw.followUp1,
    followUp2: raw.followUp2,
    auditOffer,
  };
}

export type LeadContext = {
  id: string;
  fullName?: string;
  role?: string;
  company?: string;
  headline?: string;
  recentSignals?: string[];
};

export type GeneratedDraftPayload = {
  leadId: string;
  drafts: DraftBundle;
  model: string;
  generatedAt: string;
};

export type ApprovedDraftPayload = {
  leadId: string;
  drafts: DraftBundle;
  approvedAt: string;
};
