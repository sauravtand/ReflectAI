export const instant = false;
import { notFound } from "next/navigation";
import { journalEntries } from "@/lib/fixtures/journals";
import { Badge, Card, PageHeader } from "@/components/ui/stage2";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = journalEntries.find((x) => x.id === id);
  if (!e) notFound();
  return (
    <>
      <PageHeader
        eyebrow="Journal entry"
        title={e.title}
        description={new Date(e.date + "T12:00:00").toLocaleDateString("en-GB", {
          dateStyle: "long",
        })}
      />
      <Card className="mx-auto max-w-3xl">
        <div className="flex justify-between">
          <Badge tone={e.mode === "ai" ? "gold" : "sage"}>
            {e.mode === "ai" ? "AI-assisted journal" : "Normal journal"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {e.words} words · {e.minutes} min
          </span>
        </div>
        <article className="journal-prose mt-8 space-y-5 text-lg leading-8">
          <p>{e.excerpt}</p>
          <p>
            I gave myself enough time to notice the details instead of trying to reach a conclusion.
            The small observations made the experience feel more complete.
          </p>
          {e.mode === "ai" && (
            <aside className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-base">
              <strong>AI conversation record</strong>
              <p className="mt-1 text-amber-900">
                The guided questions and final draft remain visibly separate from your original
                fragments.
              </p>
            </aside>
          )}
        </article>
      </Card>
    </>
  );
}
