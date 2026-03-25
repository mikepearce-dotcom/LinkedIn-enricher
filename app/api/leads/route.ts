import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";

const leadSchema = z.object({
  companyName: z.string().min(1),
  websiteUrl: z.string().url(),
  contactName: z.string().min(1),
  linkedinProfileUrl: z.string().url().optional().or(z.literal("")),
  role: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional()
});

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lead = await prisma.lead.create({ data: parsed.data });
  await logEvent(lead.id, "created", "Lead created");
  return NextResponse.json(lead, { status: 201 });
}
