"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function setAiAssistanceEnabled(formData: FormData) {
  await requireAdmin();

  const enabled = formData.get("enabled") === "true";
  const supabase = await createClient();

  const { error } = await supabase.rpc("set_ai_assistance_enabled", {
    p_enabled: enabled,
  });

  if (error) {
    throw new Error(`Unable to update AI assistance: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/journals");
  revalidatePath("/journals/new");
}