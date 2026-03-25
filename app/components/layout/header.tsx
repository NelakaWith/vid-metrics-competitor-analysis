"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  YoutubeIcon,
  ChartIncreaseIcon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "@/app/contexts/theme-provider";
import { fmtCount } from "@/app/lib/format";
import type { ChannelInfo } from "@/app/lib/types";

interface Props {
  channel?: ChannelInfo;
}

export function Header({ channel }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={ChartIncreaseIcon}
            size={20}
            color="currentColor"
            strokeWidth={1.5}
            className="text-primary"
          />
          <span className="text-sm font-semibold tracking-tight">
            VidMetrics
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {channel && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={YoutubeIcon}
                size={14}
                color="currentColor"
                strokeWidth={1.5}
              />
              <span className="font-medium text-foreground">
                {channel.title}
              </span>
              <span>·</span>
              <span>{fmtCount(channel.subscriberCount)} subscribers</span>
            </div>
          )}

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-lg border border-border/60 p-1.5 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <HugeiconsIcon
              icon={theme === "dark" ? Sun01Icon : Moon01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
