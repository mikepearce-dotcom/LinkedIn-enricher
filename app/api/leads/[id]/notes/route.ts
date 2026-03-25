import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";

const noteSchema = z.object({ content: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = noteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const note = await prisma.note.create({ data: { leadId: id, content: parsed.data.content } });
  await logEvent(id, "note_added", "Internal note added");
  return NextResponse.json(note, { status: 201 });
}
