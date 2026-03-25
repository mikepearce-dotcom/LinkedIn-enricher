import { LeadStatus } from "@prisma/client";

export const LEAD_STATUSES: LeadStatus[] = [
  "NEW",
  "REVIEWING",
  "ANALYSED",
  "READY_TO_CONTACT",
  "CONTACTED",
  "REPLIED",
  "CALL_BOOKED",
  "WON",
  "LOST",
  "ARCHIVED"
];

export const toLabel = (status: LeadStatus) =>
  status
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
