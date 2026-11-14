import Link from "next/link";

import { requestPasswordReset } from "@/app/auth/actions";
export const instant = false;
export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-[75vh] place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm">
        <h1 className="font-serif text-4xl font-semibold">
          Reset your password
        </h1>

        <p className="mt-2 text-muted-foreground">
          Enter your email address and we will send you a password-reset link.
        </p>

        <form
          action={requestPasswordReset}
          className="mt-7 space-y-4"
        >
          <label className="block text-sm font-medium">
            Email

            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3"
              placeholder="you@example.com"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Return to login
          </Link>
        </p>
      </div>
    </main>
  );
}