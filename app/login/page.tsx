"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (result?.ok && result.url) {
      window.location.href = result.url;
      return;
    }

    setIsLoading(false);
    setShake(true);
    setTimeout(() => setShake(false), 600);
    setError("Invalid username or password.");
  };

  return (
    <main
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-[var(--bg-warm)] px-4 py-6 text-[var(--text)] sm:px-6 lg:px-8`}
    >
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-4 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg)] p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-[var(--red)]">
              Help Me Help You NGO
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl leading-none tracking-tight text-[var(--text)] sm:text-5xl">
              One portal for programs, people, and field operations.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              This admin workspace is built for a multi-service NGO. Manage
              events, volunteers, user access, impact locations, and blood
              support workflows without a heavy interface.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Events",
                body: "Register and update camps, drives, and outreach programs.",
              },
              {
                title: "Volunteers",
                body: "Review applications, approve volunteers, and assign roles.",
              },
              {
                title: "Operations",
                body: "Track users, map impact, and handle support requests.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--border-warm)] hover:border-[var(--red-glow)] bg-[var(--bg-subtle)] p-4 transition-colors"
              >
                <p className="text-base font-semibold text-[var(--text)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-subtle)] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--red)]">
              Secure access
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Admin sign-in is protected and management actions are audit-logged.
              Use the assigned credentials for your team account.
            </p>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg)] p-6 shadow-sm sm:p-7 relative overflow-hidden">
            {/* Background design element with yellow highlight */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--yellow-glow)] opacity-50 blur-2xl pointer-events-none" />

            <div className="mb-6 flex items-center gap-3 relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--red-glow)] bg-[var(--bg-subtle)]">
                <Image src="/logo.png" alt="Logo" width={40} height={40} />
              </div>
              <div>
                <h2 className="font-[var(--font-display)] text-3xl font-bold leading-none text-[var(--text)]">
                  Admin Login
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Secure access to the NGO operations panel.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleLogin}
              className={`space-y-4 relative z-10 ${shake ? "animate-[shake_0.55s_cubic-bezier(.36,.07,.19,.97)_both]" : ""}`}
            >
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--red-dark)]"
                >
                  Username <span className="required-indicator text-[var(--yellow-dark)]">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--red)] focus:ring-4 focus:ring-[var(--red-glow)]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--red-dark)]"
                >
                  Password <span className="required-indicator text-[var(--yellow-dark)]">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--red)] focus:ring-4 focus:ring-[var(--red-glow)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="rounded-xl border border-[var(--red-light)] bg-[var(--red-glow)] px-4 py-3 text-sm font-medium text-[var(--red-dark)]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--red)] px-4 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[var(--red-dark)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-75"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in
                  </>
                ) : (
                  "Enter dashboard"
                )}
              </button>
            </form>

            <p className="mt-5 text-sm text-[var(--muted)] relative z-10">
              Need help?{" "}
              <a
                href="mailto:support@helpmehelpyou.org"
                className="font-semibold text-[var(--red)] transition hover:text-[var(--red-dark)]"
              >
                Contact support
              </a>
            </p>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes shake {
          10%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          80% {
            transform: translateX(4px);
          }
          30%,
          50%,
          70% {
            transform: translateX(-6px);
          }
          40%,
          60% {
            transform: translateX(6px);
          }
        }
      `}</style>
    </main>
  );
}
