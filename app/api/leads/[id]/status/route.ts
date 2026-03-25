import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";
import { databaseErrorResponse } from "@/lib/api-error";

const statusSchema = z.object({ status: z.nativeEnum(LeadStatus) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const lead = await prisma.lead.update({ where: { id }, data: { status: parsed.data.status } });
    await logEvent(id, "status_changed", `Status changed to ${parsed.data.status}`);
    return NextResponse.json(lead);
  } catch (error) {
    return databaseErrorResponse(`POST /api/leads/${id}/status`, error);
  }
}
