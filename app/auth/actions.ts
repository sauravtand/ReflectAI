"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function register(formData: FormData) {
  const displayName = getFormValue(formData, "display_name");
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!displayName || !email || password.length < 8) {
    redirect(
      "/register?error=Enter%20a%20name%2C%20email%2C%20and%20a%20password%20of%20at%20least%208%20characters",
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/login?message=Check%20your%20email%20to%20confirm%20your%20account",
  );
}

export async function login(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  const email = getFormValue(formData, "email");
  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
  });

  redirect(
    "/login?message=If%20the%20account%20exists%2C%20a%20reset%20link%20was%20sent",
  );
}

export async function updatePassword(formData: FormData) {
  const password = getFormValue(formData, "password");

  if (password.length < 8) {
    redirect(
      "/auth/update-password?error=Use%20at%20least%208%20characters",
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(
      `/auth/update-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/dashboard");
}