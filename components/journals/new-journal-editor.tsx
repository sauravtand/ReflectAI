"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { saveJournalDraft } from "@/app/(app)/journals/new/actions";
import { AiJournalAssistant } from "@/components/journals/ai-journal-assistant";
import { Badge, Card } from "@/components/ui/stage2";

type NewJournalEditorProps = {
  aiEnabled: boolean;
};

type JournalMode = "traditional" | "ai_assisted";

export function NewJournalEditor({
  aiEnabled,
}: NewJournalEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [journalId, setJournalId] = useState<string | null>(null);
  const [journalMode, setJournalMode] =
    useState<JournalMode>("traditional");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, startSaving] = useTransition();

  function clearMessages() {
    setSaveMessage("");
    setSaveError("");
  }

  function validateContent() {
    if (!content.trim()) {
      setSaveError("Write something before saving the journal.");
      return false;
    }

    return true;
  }

  function handleSaveDraft() {
    clearMessages();

    if (!validateContent()) {
      return;
    }

    startSaving(async () => {
      const result = await saveJournalDraft({
        journalId,
        title,
        content,
        mode: journalMode,
      });

      if (!result.success) {
        setSaveError(result.error);
        return;
      }

      setJournalId(result.journalId);
      setSaveMessage("Draft saved successfully.");
    });
  }

  function handleStartAiAssistance() {
    clearMessages();

    if (!aiEnabled) {
      setSaveError(
        "AI assistance is currently disabled by the administrator.",
      );
      return;
    }

    if (content.trim().length < 10) {
      setSaveError(
        "Write at least 10 characters before starting AI assistance.",
      );
      return;
    }

    startSaving(async () => {
      const result = await saveJournalDraft({
        journalId,
        title,
        content,
        mode: "ai_assisted",
      });

      if (!result.success) {
        setSaveError(result.error);
        return;
      }

      setJournalId(result.journalId);
      setJournalMode("ai_assisted");
      setSaveMessage(
        "AI-assisted journal saved. You can now generate a reflection.",
      );
    });
  }

  function handleFinalContent(finalContent: string) {
    setContent(finalContent);
    setSaveMessage(
      "The accepted reflection is now the final journal content.",
    );
    setSaveError("");
  }

  return (
    <>
      <Card className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge>
            {journalMode === "ai_assisted"
              ? "AI-assisted journal"
              : "Normal journal"}
          </Badge>

          <span className="text-sm text-muted-foreground">
            {isSaving
              ? "Saving..."
              : journalId
                ? "Draft saved"
                : "Your changes are not saved yet"}
          </span>
        </div>

        <label htmlFor="journal-title" className="sr-only">
          Journal title
        </label>

        <input
          id="journal-title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            clearMessages();
          }}
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
          onChange={(event) => {
            setContent(event.target.value);
            clearMessages();
          }}
          className="mt-5 min-h-72 w-full resize-y rounded-xl border border-input bg-background p-4 leading-7 outline-none focus:ring-2 focus:ring-primary"
          placeholder="Start writing what is on your mind..."
          maxLength={12000}
        />

        {saveError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            {saveError}
          </div>
        )}

        {saveMessage && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {saveMessage}
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Link
            href="/journals"
            className="rounded-full border border-border px-5 py-3 font-semibold"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="rounded-full border border-border px-5 py-3 font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save draft"}
          </button>

          <button
            type="button"
            disabled
            className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground opacity-50"
            title="Finishing a journal will be connected after the AI decision workflow."
          >
            Finish entry
          </button>
        </div>
      </Card>

      {aiEnabled ? (
        journalMode === "ai_assisted" && journalId ? (
          <div className="mx-auto max-w-3xl">
            <AiJournalAssistant
              journalId={journalId}
              title={title}
              content={content}
              onFinalContent={handleFinalContent}
            />
          </div>
        ) : (
          <Card className="mx-auto mt-6 max-w-3xl border-amber-300 bg-amber-50">
            <Badge tone="gold">AI-assisted journaling</Badge>

            <h2 className="mt-4 font-serif text-2xl font-semibold text-amber-950">
              Create a first-person reflection
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Your original writing will first be saved separately. The AI
              reflection will then be stored as a separate research record for
              you to accept, edit, or reject.
            </p>

            <button
              type="button"
              onClick={handleStartAiAssistance}
              disabled={isSaving}
              className="mt-5 rounded-full bg-amber-900 px-5 py-3 font-semibold text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Preparing AI journal..."
                : "Start AI assistance"}
            </button>
          </Card>
        )
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