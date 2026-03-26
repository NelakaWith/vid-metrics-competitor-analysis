import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsUpIcon } from "@hugeicons/core-free-icons";

export function Hero() {
  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <div className="mb-3 flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
        <HugeiconsIcon
          icon={AnalyticsUpIcon}
          size={12}
          color="currentColor"
          strokeWidth={1.5}
        />
        YouTube Competitor Intelligence
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Which videos are <span className="text-amber-400">crushing it</span>{" "}
        right now?
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Paste any competitor&apos;s YouTube channel URL to instantly see their
        top&#8209;performing content.
      </p>
    </div>
  );
}
