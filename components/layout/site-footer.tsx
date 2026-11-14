import { PageContainer } from "@/components/layout/page-container";

/**
 * Deliberately has no copyright year: this project uses Next.js Cache
 * Components, where reading the current date in a prerendered shell is a build
 * error.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <PageContainer className="py-10 text-sm text-muted-foreground">
        DiaryMate is a journaling application for research participants.
      </PageContainer>
    </footer>
  );
}
