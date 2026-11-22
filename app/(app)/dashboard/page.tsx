import { journalEntries, stats } from "@/lib/fixtures/journals";
import { JournalCard } from "@/components/journals/journal-card";
import { Badge, Card, PageHeader, PrimaryLink } from "@/components/ui/stage2";
import Link from "next/link";
export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Saturday, 14 November"
        title="Welcome back, Saurav"
        description="Take a moment to check in with yourself."
        action={<PrimaryLink href="/journals/new">New journal</PrimaryLink>}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold">Recent entries</h2>
            <Link href="/journals" className="text-sm font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {journalEntries.slice(0, 2).map((e) => (
              <JournalCard entry={e} key={e.id} />
            ))}
          </div>
        </Card>
        <Card>
          <Badge>Research phase 1</Badge>
          <h2 className="mt-4 font-serif text-2xl font-semibold">Normal journaling</h2>
          <p className="mt-2 text-muted-foreground">
            Day 4 of 10. AI assistance unlocks from day 11.
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/5 bg-primary" />
          </div>
        </Card>
        <Card>
          <h2 className="font-serif text-2xl font-semibold">November</h2>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-sm">
            {"MTWTFSS".split("").map((d, i) => (
              <span key={i} className="text-muted-foreground">
                {d}
              </span>
            ))}
            {Array.from({ length: 21 }, (_, i) => (
              <span
                key={i}
                className={
                  i === 13 ? "rounded-full bg-primary py-1 text-primary-foreground" : "py-1"
                }
              >
                {i + 1}
              </span>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-serif text-2xl font-semibold">Your journaling</h2>
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              ["Entries", stats.entries],
              ["Day streak", stats.streak],
              ["Words", stats.words],
              ["Minutes", stats.minutes],
            ].map((x) => (
              <div key={x[0]}>
                <p className="text-3xl font-semibold">{x[1]}</p>
                <p className="text-sm text-muted-foreground">{x[0]}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
