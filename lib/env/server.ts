import "server-only";

import { z } from "zod";

import { parseEnv, type EnvSource } from "./shared";

/**
 * Secrets and server-only configuration. The `server-only` import above makes
 * the build fail if this module is ever imported from a Client Component, which
 * keeps service-role keys and API keys out of the browser bundle.
 */
export const serverEnvSchema = z.object({
  // Supabase: the service-role key bypasses row-level security. Server only.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Cloudflare R2 (S3-compatible object storage for media).
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),

  // Gemini. The model name is deliberately required, with no default, because
  // it is recorded alongside every AI interaction for research integrity.
GEMINI_API_KEY: z.string().min(1),
GEMINI_MODEL: z.string().min(1),
GEMINI_FALLBACK_MODEL: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: EnvSource): ServerEnv {
  return parseEnv("server", serverEnvSchema, source);
}

/** Read and validate server-only env vars. Call lazily, not at module load. */
export function getServerEnv(): ServerEnv {
  return parseServerEnv(process.env);
}
