"use client";

import { useState } from "react";

type AiJournalAssistantProps = {
  title: string;
  content: string;
};

type AiResponse = {
  assistance?: string;
  error?: string;
};

export function AiJournalAssistant({
  title,
  content,
}: AiJournalAssistantProps) {
  const [assistance, setAssistance] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function requestAssistance() {
    setErrorMessage("");
    setAssistance("");

    const trimmedContent = content.trim();

    if (trimmedContent.length < 10) {
      setErrorMessage(
        "Write at least 10 characters in your journal before requesting AI assistance.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: trimmedContent,
        }),
      });

      const result = (await response.json()) as AiResponse;

      if (!response.ok) {
        setErrorMessage(
          result.error ?? "AI assistance could not be generated.",
        );
        return;
      }

      if (!result.assistance) {
        setErrorMessage("The AI assistant returned an empty response.");
        return;
      }

      setAssistance(result.assistance);
    } catch {
      setErrorMessage(
        "The AI assistant could not be reached. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
        AI-assisted journaling
      </p>

      <h2 className="mt-3 font-serif text-2xl font-semibold text-amber-950">
        Reflect more deeply
      </h2>

      <p className="mt-2 text-sm leading-6 text-amber-900">
        The assistant can reflect on themes in your journal, suggest questions,
        and offer one optional next step. Your original writing will not be
        replaced.
      </p>

      <button
        type="button"
        onClick={requestAssistance}
        disabled={isLoading}
        className="mt-5 rounded-full bg-amber-900 px-5 py-3 font-semibold text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Generating reflection..." : "Ask AI for reflection"}
      </button>

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {assistance && (
        <div
          className="mt-6 rounded-xl border border-amber-200 bg-white p-5"
          aria-live="polite"
        >
          <h3 className="font-semibold text-amber-950">AI reflection</h3>

          <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
            {assistance}
          </div>

          <p className="mt-5 border-t border-amber-100 pt-4 text-xs text-muted-foreground">
            AI responses can be inaccurate. Use only what feels useful and keep
            your own perspective central.
          </p>
        </div>
      )}
    </section>
  );
}