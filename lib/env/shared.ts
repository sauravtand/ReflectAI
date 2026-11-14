import type { z } from "zod";

/**
 * Thrown when environment variables are missing or invalid.
 * The message lists variable NAMES and the problem only, never their values,
 * so it is safe to appear in logs.
 */
export class EnvValidationError extends Error {
  readonly issues: ReadonlyArray<{ name: string; message: string }>;

  constructor(scope: string, issues: ReadonlyArray<{ name: string; message: string }>) {
    const lines = issues.map((issue) => `  - ${issue.name}: ${issue.message}`);
    super(
      `Invalid ${scope} environment variables:\n${lines.join("\n")}\n` +
        "See .env.example for the variables you need to configure.",
    );
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

export type EnvSource = Record<string, string | undefined>;

/**
 * Parse an env source against a schema. Empty strings are treated as unset so
 * that `FOO=` in a .env file counts as missing rather than as a valid value.
 */
export function parseEnv<TSchema extends z.ZodType>(
  scope: string,
  schema: TSchema,
  source: EnvSource,
): z.infer<TSchema> {
  const cleaned = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, value === "" ? undefined : value]),
  );
  const result = schema.safeParse(cleaned);
  if (!result.success) {
    throw new EnvValidationError(
      scope,
      result.error.issues.map((issue) => ({
        name: issue.path.join(".") || "(root)",
        message: issue.code === "invalid_type" ? "is required" : issue.message,
      })),
    );
  }
  return result.data;
}
