"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      const parsedError = responseText ? (() => {
        try {
          return JSON.parse(responseText)?.error as string | undefined;
        } catch {
          return undefined;
        }
      })() : undefined;

      setError(parsedError ?? (responseText || "Unable to sign in right now. Please try again."));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-line bg-white/80 p-8 shadow-glow backdrop-blur">
      <div>
        <h2 className="text-2xl font-semibold text-ink">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {mode === "login"
            ? "Sign in to manage your projects, tasks, and team progress."
            : "Start with the first user as Admin, then invite Members as the team grows."}
        </p>
      </div>

      {mode === "signup" && (
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input name="name" required minLength={2} className="mt-2 w-full rounded-2xl border border-line bg-sand px-4 py-3 outline-none ring-0 focus:border-accent" />
        </label>
      )}

      <label className="block text-sm font-medium text-slate-700">
        Email
        <input name="email" type="email" required className="mt-2 w-full rounded-2xl border border-line bg-sand px-4 py-3 outline-none ring-0 focus:border-accent" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Password
        <input name="password" type="password" required minLength={8} className="mt-2 w-full rounded-2xl border border-line bg-sand px-4 py-3 outline-none ring-0 focus:border-accent" />
      </label>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button disabled={loading} className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
        {loading ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
