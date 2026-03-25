export type DraftFieldKey =
  | "whyThisLead"
  | "coreProblemAngle"
  | "valueHook"
  | "connectionNote"
  | "followUp1"
  | "followUp2"
  | "auditOfferMessage";

export type DraftBundle = Record<DraftFieldKey, string>;

export const DRAFT_FIELD_LABELS: Record<DraftFieldKey, string> = {
  whyThisLead: "Why this lead",
  coreProblemAngle: "Core problem angle",
  valueHook: "Value hook",
  connectionNote: "Connection note",
  followUp1: "Follow-up 1",
  followUp2: "Follow-up 2",
  auditOfferMessage: "Audit offer message",
};

export const DRAFT_FIELD_KEYS = Object.keys(DRAFT_FIELD_LABELS) as DraftFieldKey[];

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
