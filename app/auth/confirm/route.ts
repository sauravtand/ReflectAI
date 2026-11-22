import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/dashboard";
  redirectUrl.search = "";

  const supabase = await createClient();

  // Current PKCE confirmation flow.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Token-hash flow used by customized Supabase email templates.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(redirectUrl);
    }
  }

  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set(
    "error",
    "The confirmation link is invalid or has expired.",
  );

  return NextResponse.redirect(redirectUrl);
}