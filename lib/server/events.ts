import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const EVENT_LOG_PATH = path.join(process.cwd(), ".data", "events.log");

type EventName = "DraftsGenerated" | "DraftApproved";

export async function logEvent(event: EventName, payload: Record<string, unknown>): Promise<void> {
  const line = JSON.stringify({ event, payload, ts: new Date().toISOString() });
  await mkdir(path.dirname(EVENT_LOG_PATH), { recursive: true });
  await appendFile(EVENT_LOG_PATH, `${line}\n`, "utf8");
}
