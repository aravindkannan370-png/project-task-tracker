import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-16">
      <section className="overflow-hidden rounded-[2.5rem] border border-line bg-white/80 p-8 shadow-glow backdrop-blur lg:p-12">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-700">Project Task Tracker</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink lg:text-6xl">
            Projects, tasks, and team progress in one role-aware workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Built for Admin and Member workflows with secure authentication, REST APIs, Prisma-backed data,
            and Railway deployment support.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-2xl bg-ink px-5 py-3 font-semibold text-white">
              Get started
            </Link>
            <Link href="/login" className="rounded-2xl border border-line bg-sand px-5 py-3 font-semibold text-ink">
              Sign in
            </Link>
            <Link href="/dashboard" className="rounded-2xl border border-line bg-white px-5 py-3 font-semibold text-ink">
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["Authentication", "JWT cookie auth with signup and login endpoints."],
            ["RBAC", "Admin and Member checks on all protected routes."],
            ["Tracking", "Project, task, overdue, and status metrics on the dashboard."]
          ].map(([title, copy]) => (
            <article key={title} className="rounded-3xl border border-line bg-sand/60 p-5">
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
