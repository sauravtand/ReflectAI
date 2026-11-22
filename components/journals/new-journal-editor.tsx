"use client";

import Link from "next/link";
import { useState } from "react";

import { AiJournalAssistant } from "@/components/journals/ai-journal-assistant";
import { Badge, Card } from "@/components/ui/stage2";

type NewJournalEditorProps = {
  aiEnabled: boolean;
};

export function NewJournalEditor({
  aiEnabled,
}: NewJournalEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <>
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
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-6 w-full bg-transparent font-serif text-3xl font-semibold outline-none placeholder:text-muted-foreground"
          placeholder="Give this moment a title..."
          maxLength={240}
        />

        <label htmlFor="journal-content" className="sr-only">
          Journal content
        </label>

        <textarea
          id="journal-content"
          name="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-5 min-h-72 w-full resize-y rounded-xl border border-input bg-background p-4 leading-7 outline-none focus:ring-2 focus:ring-primary"
          placeholder="Start writing what is on your mind..."
          maxLength={12000}
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

      {aiEnabled ? (
        <div className="mx-auto max-w-3xl">
          <AiJournalAssistant title={title} content={content} />
        </div>
      ) : (
        <Card className="mx-auto mt-6 max-w-3xl">
          <Badge>AI assistance unavailable</Badge>

          <p className="mt-3 text-sm text-muted-foreground">
            AI assistance is currently turned off by the administrator. You can
            continue writing and saving a normal journal.
          </p>
        </Card>
      )}
    </>
  );
}