import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/** The ReflectAI leaf mark. Decorative: always paired with the wordmark or a label. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M9 23C9 14 14 9 23 9c0 9-5 14-14 14Z" className="fill-primary-foreground" />
      <path
        d="M9.5 22.5 17 15"
        className="stroke-primary"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Mark plus wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-serif text-xl font-medium tracking-tight">{siteConfig.name}</span>
    </span>
  );
}
