import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Centres page content and applies the shared horizontal gutters.
 * Use for every top-level block so left edges line up across the whole app.
 */
export function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-page px-5 sm:px-8 lg:px-10", className)} {...props} />
  );
}
