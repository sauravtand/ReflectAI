import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  title: z.string().trim().max(240).optional().default(""),
  content: z.string().trim().min(10).max(12000),
});

const MAX_ATTEMPTS_PER_MODEL = 2;

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown Gemini error";
  }
}

function isRetryableGeminiError(error: unknown) {
  const errorText = getErrorText(error).toUpperCase();

  return (
    errorText.includes('"CODE":429') ||
    errorText.includes('"CODE":503') ||
    errorText.includes("RESOURCE_EXHAUSTED") ||
    errorText.includes("UNAVAILABLE") ||
    errorText.includes("HIGH DEMAND") ||
    errorText.includes("TIMED OUT") ||
    errorText.includes("TIMEOUT")
  );
}

async function generateWithRetry({
  ai,
  model,
  prompt,
}: {
  ai: GoogleGenAI;
  model: string;
  prompt: string;
}) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 1600,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const assistance = result.text?.trim();

      if (!assistance) {
        throw new Error("Gemini returned an empty response.");
      }

      return assistance;
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error)) {
        throw error;
      }

      if (attempt < MAX_ATTEMPTS_PER_MODEL) {
        const exponentialDelay = 1000 * 2 ** (attempt - 1);
        const jitter = Math.floor(Math.random() * 500);

        await wait(exponentialDelay + jitter);
      }
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to use AI assistance." },
        { status: 401 },
      );
    }

    const { data: canUseAi, error: accessError } = await supabase.rpc("can_use_ai");

    if (accessError) {
      console.error("AI access check failed:", accessError.message);

      return NextResponse.json({ error: "Unable to verify AI availability." }, { status: 500 });
    }

    if (canUseAi !== true) {
      return NextResponse.json(
        {
          error: "AI assistance is currently disabled by the administrator.",
        },
        { status: 403 },
      );
    }

    const requestBody: unknown = await request.json();
    const parsedRequest = requestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error: "Enter at least 10 characters before requesting AI assistance.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const primaryModel = process.env.GEMINI_MODEL;
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL;

    if (!apiKey || !primaryModel || !fallbackModel) {
      console.error("Gemini server environment variables are missing.");

      return NextResponse.json(
        { error: "AI assistance is not configured on the server." },
        { status: 503 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a careful journaling reflection assistant.

Your purpose is to help the user reflect on their own writing. Do not diagnose
mental-health conditions. Do not claim to be a therapist. Do not rewrite the
journal as if you were the user. Do not invent facts, memories, people, or
events.

Read the journal entry below and respond with:

1. A brief, respectful reflection of the main themes in 2 or 3 sentences.
2. Three open-ended questions that may help the user reflect more deeply.
3. One optional small next step the user may consider.

Keep the complete response under 350 words.
Use calm, plain language.
Do not use markdown tables.

Journal title:
${parsedRequest.data.title || "Untitled"}

Journal content:
${parsedRequest.data.content}
`.trim();

    try {
      const assistance = await generateWithRetry({
        ai,
        model: primaryModel,
        prompt,
      });

      return NextResponse.json({
        assistance,
        model: primaryModel,
      });
    } catch (primaryError) {
      if (!isRetryableGeminiError(primaryError)) {
        throw primaryError;
      }

      console.warn(
        `Primary Gemini model ${primaryModel} unavailable. Trying fallback model ${fallbackModel}.`,
      );

      try {
        const assistance = await generateWithRetry({
          ai,
          model: fallbackModel,
          prompt,
        });

        return NextResponse.json({
          assistance,
          model: fallbackModel,
        });
      } catch (fallbackError) {
        if (!isRetryableGeminiError(fallbackError)) {
          throw fallbackError;
        }

        console.error(
          "Both Gemini models are temporarily unavailable:",
          getErrorText(fallbackError),
        );

        return NextResponse.json(
          {
            error:
              "AI assistance is temporarily busy. Your journal is still here. Please try again in a few minutes.",
          },
          {
            status: 503,
            headers: {
              "Retry-After": "60",
            },
          },
        );
      }
    }
  } catch (error) {
    console.error("Journal AI request failed:", getErrorText(error));

    return NextResponse.json(
      {
        error: "AI assistance could not be generated. Your journal has not been changed.",
      },
      { status: 500 },
    );
  }
}
