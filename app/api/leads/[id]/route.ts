import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";

const updateSchema = z.object({
  companyName: z.string().min(1).optional(),
  websiteUrl: z.string().url().optional(),
  contactName: z.string().min(1).optional(),
  linkedinProfileUrl: z.string().url().optional().or(z.literal("")),
  role: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional()
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      analyses: { orderBy: { fetchedAt: "desc" }, take: 1 },
      messageDraftSets: { orderBy: { createdAt: "desc" }, take: 1 },
      leadNotes: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lead = await prisma.lead.update({ where: { id }, data: parsed.data });
  await logEvent(id, "updated", "Lead updated");
  return NextResponse.json(lead);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
