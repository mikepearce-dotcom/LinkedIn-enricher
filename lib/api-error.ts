import { NextResponse } from "next/server";
import { getDatabaseIssue, logDatabaseIssue } from "@/lib/database-issue";

export function databaseErrorResponse(context: string, error: unknown) {
  const issue = getDatabaseIssue(error);
  logDatabaseIssue(context, error);

  return NextResponse.json(
    {
      error: issue.title,
      details: issue.description,
      action: issue.action
    },
    { status: issue.status }
  );
}
