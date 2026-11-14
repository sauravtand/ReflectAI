import { updatePassword } from "@/app/auth/actions";
export const instant = false;
export default function UpdatePasswordPage() {
  return (
    <main className="grid min-h-[75vh] place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm">
        <h1 className="font-serif text-4xl font-semibold">
          Choose a new password
        </h1>

        <p className="mt-2 text-muted-foreground">
          Use at least eight characters.
        </p>

        <form
          action={updatePassword}
          className="mt-7 space-y-4"
        >
          <label className="block text-sm font-medium">
            New password

            <input
              required
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3"
              placeholder="At least 8 characters"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}