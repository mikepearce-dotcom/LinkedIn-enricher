import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";
import { databaseErrorResponse } from "@/lib/api-error";

const noteSchema = z.object({ content: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const note = await prisma.note.create({ data: { leadId: id, content: parsed.data.content } });
    await logEvent(id, "note_added", "Internal note added");
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(`POST /api/leads/${id}/notes`, error);
  }
}
