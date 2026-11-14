import { z } from "zod";

import { parseEnv, type EnvSource } from "./shared";

/**
 * Variables that are safe to expose to the browser. Anything prefixed
 * NEXT_PUBLIC_ is inlined into the client bundle at build time, so never put a
 * secret here.
 */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(source: EnvSource): PublicEnv {
  return parseEnv("public", publicEnvSchema, source);
}

/**
 * Read and validate public env vars. Call it lazily (inside a function), never
 * at module top level, so that builds without credentials still succeed.
 *
 * NEXT_PUBLIC_* values must be referenced statically (`process.env.NAME`) or
 * Next.js cannot inline them into the client bundle. Do not replace this
 * object with `process.env` spread or dynamic lookups.
 */
export function getPublicEnv(): PublicEnv {
  return parsePublicEnv({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
