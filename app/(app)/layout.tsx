import { Suspense } from "react";
import { connection } from "next/server";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/require-user";

function AppShellFallback() {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block" />

      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </main>
    </div>
  );
}

async function AuthenticatedApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  const { profile } = await requireUser();
  const isAdmin = profile.role === "admin";

  return <AppShell isAdmin={isAdmin}>{children}</AppShell>;
}

export default function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <AuthenticatedApp>{children}</AuthenticatedApp>
    </Suspense>
  );
}