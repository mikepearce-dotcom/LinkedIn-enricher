import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ApprovedDraftPayload } from "../drafts/types";

const APPROVED_DRAFTS_PATH = path.join(process.cwd(), ".data", "approved-drafts.json");

type ApprovedDraftStore = Record<string, ApprovedDraftPayload>;

async function readStore(): Promise<ApprovedDraftStore> {
  try {
    const text = await readFile(APPROVED_DRAFTS_PATH, "utf8");
    return JSON.parse(text) as ApprovedDraftStore;
  } catch {
    return {};
  }
}

export async function saveApprovedDraft(payload: ApprovedDraftPayload): Promise<void> {
  const store = await readStore();
  store[payload.leadId] = payload;

  await mkdir(path.dirname(APPROVED_DRAFTS_PATH), { recursive: true });
  await writeFile(APPROVED_DRAFTS_PATH, JSON.stringify(store, null, 2), "utf8");
}
