"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const decisionSchema = z.discriminatedUnion("decision", [
  z.object({
    interactionId: z.string().uuid(),
    decision: z.literal("accepted"),
    editedContent: z.null().optional(),
  }),
  z.object({
    interactionId: z.string().uuid(),
    decision: z.literal("rejected"),
    editedContent: z.null().optional(),
  }),
  z.object({
    interactionId: z.string().uuid(),
    decision: z.literal("edited_accepted"),
    editedContent: z.string().trim().min(1).max(12000),
  }),
]);

export type AiDecisionInput = z.infer<typeof decisionSchema>;

export type AiDecisionData = {
  interaction_id: string;
  journal_id: string;
  decision: "accepted" | "rejected" | "edited_accepted";
  acceptance_value: number;
  levenshtein_distance: number | null;
  normalized_levenshtein_distance: number | null;
  ai_word_count: number | null;
  final_word_count: number | null;
  final_content: string | null;
};

export type AiDecisionResult =
  | {
      success: true;
      data: AiDecisionData;
    }
  | {
      success: false;
      error: string;
    };

export async function decideAiSuggestion(input: AiDecisionInput): Promise<AiDecisionResult> {
  await requireUser();

  const parsedInput = decisionSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error:
        "The AI decision is invalid. Edited journals must contain between 1 and 12,000 characters.",
    };
  }

  const supabase = await createClient();

  const editedContent =
    parsedInput.data.decision === "edited_accepted" ? parsedInput.data.editedContent : null;

  const { data, error } = await supabase.rpc("decide_ai_suggestion", {
    p_interaction_id: parsedInput.data.interactionId,
    p_decision: parsedInput.data.decision,
    p_edited_content: editedContent,
  });

  if (error || !data) {
    console.error("Unable to record AI decision:", error?.message ?? "No decision result returned");

    return {
      success: false,
      error:
        error?.message ?? "The AI decision could not be recorded. Your journal was not changed.",
    };
  }

  const parsedResult = z
    .object({
      interaction_id: z.string().uuid(),
      journal_id: z.string().uuid(),
      decision: z.enum(["accepted", "rejected", "edited_accepted"]),
      acceptance_value: z.coerce.number().min(0).max(1),
      levenshtein_distance: z.coerce.number().int().nonnegative().nullable(),
      normalized_levenshtein_distance: z.coerce.number().min(0).max(1).nullable(),
      ai_word_count: z.coerce.number().int().nonnegative().nullable(),
      final_word_count: z.coerce.number().int().nonnegative().nullable(),
      final_content: z.string().nullable(),
    })
    .safeParse(data);

  if (!parsedResult.success) {
    console.error("Invalid AI decision result:", parsedResult.error.message);

    return {
      success: false,
      error: "The decision was recorded, but its result could not be verified.",
    };
  }

  return {
    success: true,
    data: parsedResult.data,
  };
}
