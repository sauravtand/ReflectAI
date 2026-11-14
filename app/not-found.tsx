import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <SiteShell>
      <PageContainer className="py-20 sm:py-28">
        <h1 className="text-heading">This page doesn&rsquo;t exist</h1>
        <p className="mt-5 max-w-reading text-lead text-muted-foreground">
          The link may be out of date, or the address may have a typo.
        </p>
        <Button asChild size="lg" className="mt-10">
          <Link href="/">Go to the home page</Link>
        </Button>
      </PageContainer>
    </SiteShell>
  );
}
