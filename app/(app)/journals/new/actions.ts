"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const journalInputSchema = z.object({
  title: z.string().trim().max(240),
  content: z.string().trim().min(1).max(12000),
  mode: z.enum(["traditional", "ai_assisted"]),
});

const updateJournalSchema = journalInputSchema.extend({
  journalId: z.string().uuid(),
});

export type SaveJournalResult =
  | {
      success: true;
      journalId: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createJournalDraft(
  input: z.infer<typeof journalInputSchema>,
): Promise<SaveJournalResult> {
  await requireUser();

  const parsedInput = journalInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error:
        "Enter journal content between 1 and 12,000 characters. The title can contain up to 240 characters.",
    };
  }

  const supabase = await createClient();

  const { data: journalId, error } = await supabase.rpc("create_journal_draft", {
    p_title: parsedInput.data.title,
    p_original_content: parsedInput.data.content,
    p_mode: parsedInput.data.mode,
  });

  if (error || !journalId) {
    console.error("Unable to create journal draft:", error?.message ?? "No journal ID returned");

    return {
      success: false,
      error: error?.message ?? "The journal could not be saved. Please try again.",
    };
  }

  return {
    success: true,
    journalId,
  };
}

export async function updateJournalDraft(
  input: z.infer<typeof updateJournalSchema>,
): Promise<SaveJournalResult> {
  await requireUser();

  const parsedInput = updateJournalSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "The journal draft is invalid. Enter content between 1 and 12,000 characters.",
    };
  }

  const supabase = await createClient();

  const { data: journalId, error } = await supabase.rpc("update_journal_draft", {
    p_journal_id: parsedInput.data.journalId,
    p_title: parsedInput.data.title,
    p_content: parsedInput.data.content,
    p_mode: parsedInput.data.mode,
  });

  if (error || !journalId) {
    console.error("Unable to update journal draft:", error?.message ?? "No journal ID returned");

    return {
      success: false,
      error: error?.message ?? "The journal draft could not be updated. Please try again.",
    };
  }

  return {
    success: true,
    journalId,
  };
}

export async function saveJournalDraft(input: {
  journalId: string | null;
  title: string;
  content: string;
  mode: "traditional" | "ai_assisted";
}): Promise<SaveJournalResult> {
  if (input.journalId) {
    return updateJournalDraft({
      journalId: input.journalId,
      title: input.title,
      content: input.content,
      mode: input.mode,
    });
  }

  return createJournalDraft({
    title: input.title,
    content: input.content,
    mode: input.mode,
  });
}
