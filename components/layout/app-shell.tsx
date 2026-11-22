"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

const participantNav = [
  ["/dashboard", "Overview"],
  ["/journals", "Journal history"],
  ["/calendar", "Calendar"],
  ["/research", "Research"],
  ["/settings", "Settings"],
] as const;

export function AppShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const path = usePathname();

  const nav = isAdmin
    ? ([...participantNav, ["/admin", "Admin"]] as const)
    : participantNav;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-card p-6 lg:flex lg:flex-col">
        <Link href="/" className="font-serif text-2xl font-bold">
          ReflectAI
        </Link>

        <p className="mt-1 text-sm text-muted-foreground">
          Your private reflection space
        </p>

        <nav className="mt-10 space-y-1">
          {nav.map(([href, label]) => {
            const isActive =
              href === "/dashboard"
                ? path === "/dashboard"
                : path.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "block rounded-xl px-4 py-3 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <Link
            href="/journals/new"
            className="block rounded-full bg-primary px-4 py-3 text-center font-semibold text-primary-foreground"
          >
            New journal
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="font-serif text-xl font-bold">
          ReflectAI
        </Link>

        <Link
          href="/journals/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          New entry
        </Link>
      </header>

      <main className="pb-24 lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </div>
      </main>

      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-card p-2 lg:hidden",
          isAdmin ? "grid-cols-6" : "grid-cols-5",
        )}
      >
        {nav.map(([href, label]) => {
          const isActive =
            href === "/dashboard"
              ? path === "/dashboard"
              : path.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-1 py-2 text-center text-[11px]",
                isActive
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground",
              )}
            >
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}