import { Suspense } from "react";
import { connection } from "next/server";

import { NewJournalEditor } from "@/components/journals/new-journal-editor";
import { PageHeader } from "@/components/ui/stage2";
import { createClient } from "@/lib/supabase/server";

function JournalEditorFallback() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-muted" />
    </div>
  );
}

async function JournalEditor() {
  await connection();

  const supabase = await createClient();

  const { data: canUseAi, error } = await supabase.rpc("can_use_ai");

  if (error) {
    console.error("Unable to check AI availability:", error.message);
  }

  return <NewJournalEditor aiEnabled={!error && canUseAi === true} />;
}

export default function NewJournalPage() {
  return (
    <>
      <PageHeader
        eyebrow="New reflection"
        title="Start a new journal"
        description="Write freely in a quiet and private space."
      />

      <Suspense fallback={<JournalEditorFallback />}>
        <JournalEditor />
      </Suspense>
    </>
  );
}