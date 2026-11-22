import { setAiAssistanceEnabled } from "@/app/(app)/admin/actions";
import { requireAdmin } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function AdminPage() {
  await connection();
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("ai_feature_settings")
    .select("ai_assistance_enabled, updated_at")
    .eq("id", 1)
    .single();

  if (error || !settings) {
    throw new Error(
      `Unable to load AI settings: ${error?.message ?? "Setting not found"}`,
    );
  }

  const enabled = settings.ai_assistance_enabled;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Administration
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold">
          AI assistance
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Control whether active ReflectAI users can access AI assistance in
          their journals.
        </p>
      </header>

      <section className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Global AI assistance
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {enabled
                ? "AI assistance is currently available to all active users."
                : "AI assistance is currently unavailable to users."}
            </p>
          </div>

          <span
            className={
              enabled
                ? "w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800"
                : "w-fit rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground"
            }
          >
            {enabled ? "ON" : "OFF"}
          </span>
        </div>

        <form action={setAiAssistanceEnabled} className="mt-6">
          <input
            type="hidden"
            name="enabled"
            value={enabled ? "false" : "true"}
          />

          <button
            type="submit"
            className={
              enabled
                ? "rounded-full border border-destructive px-5 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                : "rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            }
          >
            {enabled
              ? "Turn AI assistance off"
              : "Turn AI assistance on"}
          </button>
        </form>

        <p className="mt-5 text-xs text-muted-foreground">
          Last database update:{" "}
          {new Date(settings.updated_at).toLocaleString("en-DK", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Copenhagen",
          })}
        </p>
      </section>

      <section className="max-w-2xl rounded-2xl border border-border bg-muted/30 p-6">
        <h2 className="font-semibold">Access control</h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Only active administrators can open this page.</li>
          <li>Only administrators can change the global setting.</li>
          <li>
            The AI endpoint must also check the setting before every Gemini
            request.
          </li>
        </ul>

        <p className="mt-4 text-sm text-muted-foreground">
          Signed in as {profile.display_name ?? "Administrator"}.
        </p>
      </section>
    </div>
  );
}