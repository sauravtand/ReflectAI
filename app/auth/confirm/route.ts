import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.search = "";

  if (!tokenHash || !type) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set(
      "error",
      "The confirmation link is invalid or incomplete.",
    );

    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set(
      "error",
      "The confirmation link is invalid or has expired.",
    );

    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.pathname = "/dashboard";

  return NextResponse.redirect(redirectUrl);
}