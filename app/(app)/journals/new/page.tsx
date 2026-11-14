import Link from "next/link";

import { Badge, Card, PageHeader } from "@/components/ui/stage2";
import { features } from "@/lib/config/features";

export default function NewJournalPage() {
  return (
    <>
      <PageHeader
        eyebrow="New reflection"
        title="Start a new journal"
        description="Write freely in a quiet and private space."
      />

      <Card className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge>Normal journal</Badge>

          <span className="text-sm text-muted-foreground">
            Your changes are not saved yet
          </span>
        </div>

        <label htmlFor="journal-title" className="sr-only">
          Journal title
        </label>

        <input
          id="journal-title"
          name="title"
          className="mt-6 w-full bg-transparent font-serif text-3xl font-semibold outline-none placeholder:text-muted-foreground"
          placeholder="Give this moment a title..."
        />

        <label htmlFor="journal-content" className="sr-only">
          Journal content
        </label>

        <textarea
          id="journal-content"
          name="content"
          className="mt-5 min-h-72 w-full resize-y rounded-xl border border-input bg-background p-4 leading-7 outline-none focus:ring-2 focus:ring-primary"
          placeholder="Start writing what is on your mind..."
        />

        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Link
            href="/journals"
            className="rounded-full border border-border px-5 py-3 font-semibold"
          >
            Cancel
          </Link>

          <button
            type="button"
            className="rounded-full border border-border px-5 py-3 font-semibold"
          >
            Save draft
          </button>

          <button
            type="button"
            className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Finish entry
          </button>
        </div>
      </Card>

      {features.aiJournalingEnabled && (
        <Card className="mx-auto mt-6 max-w-3xl border-amber-300 bg-amber-50">
          <Badge tone="gold">AI-assisted journaling</Badge>

          <h2 className="mt-4 font-serif text-2xl font-semibold text-amber-950">
            Need help reflecting?
          </h2>

          <p className="mt-2 text-amber-900">
            Use guided questions to explore your thoughts more deeply.
          </p>

          <Link
            href="/journals/new/ai"
            className="mt-5 inline-flex rounded-full bg-amber-900 px-5 py-3 font-semibold text-white"
          >
            Start AI-assisted journal
          </Link>
        </Card>
      )}
    </>
  );
}