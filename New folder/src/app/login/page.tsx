import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl place-items-center px-6 py-12 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2.5rem] border border-line bg-ink p-8 text-white shadow-glow lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Secure access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to manage projects and tasks.</h1>
          <p className="mt-4 max-w-lg text-white/75">
            Access the dashboard, update task status, manage team members, and monitor overdue work.
          </p>
          <Link href="/signup" className="mt-8 inline-flex rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white">
            Create a new account
          </Link>
        </section>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
