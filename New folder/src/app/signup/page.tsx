import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl place-items-center px-6 py-12 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2.5rem] border border-line bg-ink p-8 text-white shadow-glow lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Workspace setup</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Start with one Admin, then invite your Members.</h1>
          <p className="mt-4 max-w-lg text-white/75">
            The first user becomes Admin automatically, which makes it easy to bootstrap the team without a separate seed step.
          </p>
          <Link href="/login" className="mt-8 inline-flex rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white">
            Already have an account?
          </Link>
        </section>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
