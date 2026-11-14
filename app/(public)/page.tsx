import { PageContainer } from "@/components/layout/page-container";
import { siteConfig } from "@/lib/site";

/**
 * Foundation placeholder. The real landing page is built in the UI stage.
 * It exists to show the design system working end to end: display type,
 * lead text, and the journal reading style with Danish characters.
 */
export default function HomePage() {
  return (
    <PageContainer className="py-20 sm:py-28 lg:py-36">
      <h1 className="max-w-3xl text-display">{siteConfig.tagline}</h1>
      <p className="mt-8 max-w-reading text-lead text-muted-foreground">
        Write freely, one fragment at a time, at your own pace.
      </p>

      <figure className="mt-20 max-w-reading border-l-2 border-primary/40 pl-6 sm:mt-28">
        <blockquote className="journal-prose">
          <p>
            The harbour was still when I got there. Røde sejl, a thin morning light, and for once
            nothing I needed to answer. I stayed until the <em>ferry</em> came in.
          </p>
        </blockquote>
        <figcaption className="mt-4 text-sm text-muted-foreground">Example entry</figcaption>
      </figure>
    </PageContainer>
  );
}
