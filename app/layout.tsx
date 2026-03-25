import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-7xl px-6 py-6">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">LinkedIn Outreach Prep</h1>
              <p className="text-sm text-slate-600">CRO audit prospecting workspace</p>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link href="/" className="rounded-md px-3 py-1 hover:bg-slate-200">Dashboard</Link>
              <Link href="/leads" className="rounded-md px-3 py-1 hover:bg-slate-200">Leads</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
