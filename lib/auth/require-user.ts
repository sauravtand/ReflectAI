import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=Your%20account%20is%20not%20active");
  }

  return {
    user,
    profile,
  };
}

export async function requireAdmin() {
  const { user, profile } = await requireUser();

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return {
    user,
    profile,
  };
}