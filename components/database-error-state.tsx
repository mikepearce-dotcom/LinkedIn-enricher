import type { DatabaseIssue } from "@/lib/database-issue";

export function DatabaseErrorState({ title, description, action }: DatabaseIssue) {
  return (
    <main>
      <section className="card border border-amber-200 bg-amber-50 text-slate-900">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm text-slate-700">{description}</p>
        <p className="mt-2 text-sm text-slate-700">{action}</p>
      </section>
    </main>
  );
}
