import { Suspense } from "react";
import { connection } from "next/server";

import { requireAdmin } from "@/lib/auth/require-user";

function AdminFallback() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="mt-4 h-12 w-72 rounded bg-muted" />
      <div className="mt-8 h-64 rounded-2xl bg-muted" />
    </div>
  );
}

async function AuthorizedAdmin({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  await requireAdmin();

  return children;
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AuthorizedAdmin>{children}</AuthorizedAdmin>
    </Suspense>
  );
}