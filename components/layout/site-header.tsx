import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { PageContainer } from "@/components/layout/page-container";

export function SiteHeader() {
  return (
    <header className="border-b border-border/70">
      <PageContainer className="flex h-16 items-center justify-between">
        <Link href="/" className="rounded-sm" aria-label="ReflectAI home">
          <Logo />
        </Link>
      </PageContainer>
    </header>
  );
}
