"use client";

import { useState, useTransition } from "react";

import { decideAiSuggestion } from "@/app/(app)/journals/new/ai-actions";

type AiJournalAssistantProps = {
  journalId: string;
  title: string;
  content: string;
  onFinalContent: (content: string) => void;
};

type AiResponse = {
  assistance?: string;
  interactionId?: string;
  model?: string;
  error?: string;
};

type DecisionMode = "view" | "edit";

export function AiJournalAssistant({
  journalId,
  title,
  content,
  onFinalContent,
}: AiJournalAssistantProps) {
  const [assistance, setAssistance] = useState("");
  const [editedAssistance, setEditedAssistance] = useState("");
  const [interactionId, setInteractionId] = useState<string | null>(
    null,
  );
  const [rejectedInteractionId, setRejectedInteractionId] = useState<
    string | null
  >(null);
  const [usedModel, setUsedModel] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [decisionMode, setDecisionMode] =
    useState<DecisionMode>("view");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeciding, startDecision] = useTransition();

  function clearPendingSuggestion() {
    setInteractionId(null);
    setAssistance("");
    setEditedAssistance("");
    setUsedModel("");
    setDecisionMode("view");
  }

  async function requestAssistance(
    regenerationOf: string | null,
  ) {
    setErrorMessage("");
    setStatusMessage("");
    setAssistance("");
    setEditedAssistance("");
    setInteractionId(null);
    setUsedModel("");
    setDecisionMode("view");
    setIsGenerating(true);

    const trimmedContent = content.trim();

    if (trimmedContent.length < 10) {
      setErrorMessage(
        "Write at least 10 characters before requesting AI assistance.",
      );
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch("/api/ai/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          journalId,
          title: title.trim(),
          content: trimmedContent,
          regenerationOf,
        }),
      });

      const result = (await response.json()) as AiResponse;

      if (!response.ok) {
        setErrorMessage(
          result.error ??
          "AI assistance could not be generated.",
        );
        return;
      }

      if (!result.assistance || !result.interactionId) {
        setErrorMessage(
          "The AI reflection was not returned or recorded correctly.",
        );
        return;
      }

      setAssistance(result.assistance);
      setEditedAssistance(result.assistance);
      setInteractionId(result.interactionId);
      setRejectedInteractionId(null);
      setUsedModel(result.model ?? "");
    } catch {
      setErrorMessage(
        "The AI assistant could not be reached. Check your connection and try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept() {
    if (!interactionId) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    startDecision(async () => {
      const result = await decideAiSuggestion({
        interactionId,
        decision: "accepted",
        editedContent: null,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      if (!result.data.final_content) {
        setErrorMessage(
          "The accepted journal content was not returned.",
        );
        return;
      }

      onFinalContent(result.data.final_content);

      clearPendingSuggestion();
      setRejectedInteractionId(null);

      setStatusMessage(
        "The AI reflection was accepted and is now the final journal content. Acceptance value: 1.",
      );
    });
  }

  function handleEditAndAccept() {
    if (!interactionId) {
      return;
    }

    const trimmedEditedContent = editedAssistance.trim();

    if (!trimmedEditedContent) {
      setErrorMessage(
        "The edited reflection cannot be empty.",
      );
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    startDecision(async () => {
      const result = await decideAiSuggestion({
        interactionId,
        decision: "edited_accepted",
        editedContent: trimmedEditedContent,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      if (!result.data.final_content) {
        setErrorMessage(
          "The edited journal content was not returned.",
        );
        return;
      }

      onFinalContent(result.data.final_content);

      clearPendingSuggestion();
      setRejectedInteractionId(null);

      setStatusMessage(
        `The edited reflection is now the final journal. Acceptance value: ${result.data.acceptance_value.toFixed(7)}. Word-level Levenshtein distance: ${result.data.levenshtein_distance ?? 0}.`,
      );
    });
  }

  function handleReject() {
    if (!interactionId) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    startDecision(async () => {
      const result = await decideAiSuggestion({
        interactionId,
        decision: "rejected",
        editedContent: null,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      const rejectedId = interactionId;

      clearPendingSuggestion();
      setRejectedInteractionId(rejectedId);

      setStatusMessage(
        "The AI reflection was rejected. Acceptance value: 0. Your existing journal was not changed.",
      );
    });
  }

  const hasPendingSuggestion =
    Boolean(assistance) && Boolean(interactionId);

  const hasFinalDecision =
    statusMessage.includes("final journal content") ||
    statusMessage.includes("final journal.");

  return (
    <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
        AI-assisted journaling
      </p>

      <h2 className="mt-3 font-serif text-2xl font-semibold text-amber-950">
        Create a first-person reflection
      </h2>

      <p className="mt-2 text-sm leading-6 text-amber-900">
        The assistant transforms your original writing into a proposed
        first-person journal. Your original text and every AI suggestion
        remain stored separately for research.
      </p>

      {!hasPendingSuggestion &&
        !rejectedInteractionId &&
        !hasFinalDecision && (
          <button
            type="button"
            onClick={() => requestAssistance(null)}
            disabled={isGenerating || isDeciding}
            className="mt-5 rounded-full bg-amber-900 px-5 py-3 font-semibold text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating
              ? "Generating reflection..."
              : "Generate first-person reflection"}
          </button>
        )}

      {rejectedInteractionId && (
        <button
          type="button"
          onClick={() =>
            requestAssistance(rejectedInteractionId)
          }
          disabled={isGenerating || isDeciding}
          className="mt-5 rounded-full bg-amber-900 px-5 py-3 font-semibold text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating
            ? "Regenerating reflection..."
            : "Regenerate reflection"}
        </button>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {statusMessage && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {statusMessage}
        </div>
      )}

      {hasPendingSuggestion && (
        <div
          className="mt-6 rounded-xl border border-amber-200 bg-white p-5"
          aria-live="polite"
        >
          <h3 className="font-semibold text-amber-950">
            Proposed journal reflection
          </h3>

          {decisionMode === "edit" ? (
            <>
              <label
                htmlFor="edited-ai-reflection"
                className="mt-4 block text-sm font-semibold text-foreground"
              >
                Edit the reflection before accepting
              </label>

              <textarea
                id="edited-ai-reflection"
                value={editedAssistance}
                onChange={(event) => {
                  setEditedAssistance(event.target.value);
                  setErrorMessage("");
                }}
                maxLength={12000}
                className="mt-2 min-h-64 w-full resize-y rounded-xl border border-input bg-background p-4 text-sm leading-7 outline-none focus:ring-2 focus:ring-amber-800"
              />
            </>
          ) : (
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                {assistance}
            </div>
          )}

          {usedModel && (
            <p className="mt-4 text-xs text-muted-foreground">
              Generated using {usedModel}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3 border-t border-amber-100 pt-5">
            {decisionMode === "view" ? (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isDeciding || isGenerating}
                  className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeciding
                    ? "Recording decision..."
                    : "Accept"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionMode("edit");
                    setEditedAssistance(assistance);
                    setErrorMessage("");
                    setStatusMessage("");
                  }}
                  disabled={isDeciding || isGenerating}
                  className="rounded-full border border-amber-800 px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isDeciding || isGenerating}
                  className="rounded-full border border-red-700 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEditAndAccept}
                  disabled={isDeciding || isGenerating}
                  className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeciding
                    ? "Calculating and saving..."
                    : "Accept edited reflection"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionMode("view");
                    setEditedAssistance(assistance);
                    setErrorMessage("");
                  }}
                  disabled={isDeciding}
                  className="rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel editing
                </button>
              </>
            )}
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Accept records a value of 1. Reject records a value of 0.
            Editing calculates the word-level normalized Levenshtein
            distance and stores 1 minus that distance.
          </p>
        </div>
      )}
    </section>
  );
}