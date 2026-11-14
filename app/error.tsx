"use client";

import { useEffect } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

/**
 * Root error boundary. In this version of Next.js the recovery callback is
 * named `retry` (older versions called it `reset`).
 */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Logged to the console only. Do not send entry content anywhere from here.
    console.error(error);
  }, [error]);

  return (
    <SiteShell>
      <PageContainer className="py-20 sm:py-28">
        <h1 className="text-heading">Something went wrong</h1>
        <p className="mt-5 max-w-reading text-lead text-muted-foreground">
          This page failed to load. Try again, and if the problem continues, come back in a few
          minutes.
        </p>
        <Button size="lg" className="mt-10" onClick={() => retry()}>
          Try again
        </Button>
      </PageContainer>
    </SiteShell>
  );
}
