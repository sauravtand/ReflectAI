import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "@/lib/env/public";
import { parseServerEnv } from "@/lib/env/server";
import { EnvValidationError } from "@/lib/env/shared";

const validPublic = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
};

const validServer = {
  SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
  R2_ACCOUNT_ID: "account",
  R2_ACCESS_KEY_ID: "access-key",
  R2_SECRET_ACCESS_KEY: "r2-secret",
  R2_BUCKET_NAME: "bucket",
  GEMINI_API_KEY: "gemini-secret",
  GEMINI_MODEL: "model-name",
};

describe("parsePublicEnv", () => {
  it("accepts a complete, valid configuration", () => {
    expect(parsePublicEnv(validPublic)).toEqual(validPublic);
  });

  it("names every missing variable in one error", () => {
    const error = catchError(() => parsePublicEnv({}));
    expect(error).toBeInstanceOf(EnvValidationError);
    const names = (error as EnvValidationError).issues.map((issue) => issue.name);
    expect(names).toEqual([
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
  });

  it("treats an empty string as missing, as in an unfilled .env file", () => {
    const error = catchError(() =>
      parsePublicEnv({ ...validPublic, NEXT_PUBLIC_SUPABASE_URL: "" }),
    );
    expect((error as EnvValidationError).issues.map((issue) => issue.name)).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
    ]);
  });

  it("rejects a value that is not a URL", () => {
    expect(() => parsePublicEnv({ ...validPublic, NEXT_PUBLIC_APP_URL: "not a url" })).toThrow(
      EnvValidationError,
    );
  });
});

describe("parseServerEnv", () => {
  it("accepts a complete, valid configuration", () => {
    expect(parseServerEnv(validServer)).toEqual(validServer);
  });

  it("requires the Gemini model name explicitly, with no default", () => {
    const error = catchError(() => parseServerEnv({ ...validServer, GEMINI_MODEL: undefined }));
    expect((error as EnvValidationError).issues.map((issue) => issue.name)).toEqual([
      "GEMINI_MODEL",
    ]);
  });

  it("never includes secret values in the error message", () => {
    const error = catchError(() =>
      parseServerEnv({ ...validServer, GEMINI_API_KEY: "", R2_SECRET_ACCESS_KEY: "" }),
    );
    expect(error).toBeInstanceOf(EnvValidationError);
    const message = (error as EnvValidationError).message;
    expect(message).toContain("GEMINI_API_KEY");
    expect(message).toContain("R2_SECRET_ACCESS_KEY");
    // Values of the variables that WERE valid must not leak either.
    expect(message).not.toContain("service-role-secret");
    expect(message).not.toContain("access-key");
  });
});

function catchError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected the function to throw, but it returned normally.");
}
