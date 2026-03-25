import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";
import { databaseErrorResponse } from "@/lib/api-error";
import { parseLinkedInHtml } from "@/lib/linkedin-import";

const importSchema = z.object({
  html: z.string().min(1),
  mode: z.enum(["preview", "import"]).default("preview")
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const leads = parseLinkedInHtml(parsed.data.html);
  if (leads.length === 0) {
    return NextResponse.json({ error: "No LinkedIn leads could be extracted from that HTML." }, { status: 400 });
  }

  if (parsed.data.mode === "preview") {
    return NextResponse.json({ leads });
  }

  try {
    const imported = [];
    const skipped = [];

    for (const lead of leads) {
      const conditions: Prisma.LeadWhereInput[] = [{ companyName: lead.companyName, contactName: lead.contactName }];
      if (lead.linkedinProfileUrl) {
        conditions.unshift({ linkedinProfileUrl: lead.linkedinProfileUrl });
      }

      const existing = await prisma.lead.findFirst({ where: { OR: conditions } });
      if (existing) {
        skipped.push({ ...lead, existingId: existing.id });
        continue;
      }

      const created = await prisma.lead.create({ data: lead });
      await logEvent(created.id, "imported", "Lead imported from LinkedIn HTML paste");
      imported.push(created);
    }

    return NextResponse.json({
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped,
      leads
    });
  } catch (error) {
    return databaseErrorResponse("POST /api/import/linkedin", error);
  }
}
