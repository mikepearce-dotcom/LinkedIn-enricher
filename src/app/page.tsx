export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">LinkedIn Enricher</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Centralize lead ingestion, enrichment, scoring, and review workflows in one place.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Leads imported', value: '0' },
            { label: 'Profiles enriched', value: '0' },
            { label: 'High-fit matches', value: '0' },
            { label: 'Tasks pending', value: '0' },
          ].map((card) => (
            <article
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-medium">Ready for your first enrichment run</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Wire up extraction and scoring services from <code className="rounded bg-slate-100 px-1">src/lib</code>{' '}
            and server workflows from <code className="rounded bg-slate-100 px-1">src/server</code>.
          </p>
        </section>
      </div>
    </main>
  );
}
