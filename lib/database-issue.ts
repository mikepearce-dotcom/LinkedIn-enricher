import { Prisma } from "@prisma/client";

export type DatabaseIssue = {
  title: string;
  description: string;
  action: string;
  status: 500 | 503;
};

export function getDatabaseIssue(error: unknown): DatabaseIssue {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    if (error.message.includes("Environment variable not found: DATABASE_URL")) {
      return {
        title: "Database configuration missing",
        description: "The app could not find a DATABASE_URL at runtime.",
        action: "Add DATABASE_URL to the Railway service variables and redeploy.",
        status: 503
      };
    }

    if (error.message.includes("Can't reach database server")) {
      return {
        title: "Database unavailable",
        description: "The app could not connect to PostgreSQL from the running server.",
        action: "Check that the Railway Postgres service is attached and the DATABASE_URL points to it.",
        status: 503
      };
    }

    return {
      title: "Database unavailable",
      description: "Prisma could not initialise a database connection.",
      action: "Check the Railway DATABASE_URL and database connectivity, then redeploy.",
      status: 503
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return {
        title: "Database schema not ready",
        description: "The app connected to PostgreSQL, but the expected tables or columns are missing.",
        action: "Run prisma migrate deploy against the Railway database or restart after updating the start command to apply migrations.",
        status: 503
      };
    }
  }

  return {
    title: "Server error",
    description: "The app hit an unexpected server-side error while talking to the database.",
    action: "Check the Railway logs for the underlying stack trace and request id.",
    status: 500
  };
}

export function logDatabaseIssue(context: string, error: unknown) {
  console.error(`[${context}]`, error);
}
