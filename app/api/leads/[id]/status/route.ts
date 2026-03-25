import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";

const statusSchema = z.object({ status: z.nativeEnum(LeadStatus) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lead = await prisma.lead.update({ where: { id }, data: { status: parsed.data.status } });
  await logEvent(id, "status_changed", `Status changed to ${parsed.data.status}`);
  return NextResponse.json(lead);
}
