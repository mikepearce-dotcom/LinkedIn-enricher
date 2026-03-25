import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";
import { databaseErrorResponse } from "@/lib/api-error";

const leadSchema = z.object({
  companyName: z.string().min(1),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  contactName: z.string().min(1),
  linkedinProfileUrl: z.string().url().optional().or(z.literal("")),
  role: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional()
});

function normaliseOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(leads);
  } catch (error) {
    return databaseErrorResponse("GET /api/leads", error);
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = {
    ...parsed.data,
    websiteUrl: normaliseOptionalString(parsed.data.websiteUrl),
    linkedinProfileUrl: normaliseOptionalString(parsed.data.linkedinProfileUrl),
    role: normaliseOptionalString(parsed.data.role),
    companySize: normaliseOptionalString(parsed.data.companySize),
    industry: normaliseOptionalString(parsed.data.industry),
    source: normaliseOptionalString(parsed.data.source),
    notes: normaliseOptionalString(parsed.data.notes)
  };

  try {
    const lead = await prisma.lead.create({ data });
    await logEvent(lead.id, "created", "Lead created");
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return databaseErrorResponse("POST /api/leads", error);
  }
}
