import { prisma } from "@/lib/prisma";

export async function logEvent(leadId: string, type: string, message: string) {
  await prisma.activityEvent.create({
    data: { leadId, type, message }
  });
}
