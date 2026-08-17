"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Bug as BugIcon,
  CircleDot,
  CheckCircle2,
  AlertOctagon,
  Command as CommandIcon,
} from "lucide-react"
import { APP_NAME, APP_VERSION } from "@/lib/constants"
import { useBugStats } from "@/hooks/use-bugs"
import { cn } from "@/lib/utils"

export function AppFooter() {
  const { data: stats } = useBugStats()
  const { theme } = useTheme()

  return (
    <footer className="border-t bg-muted/30 mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {/* Left: app identity + version */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 rounded bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <BugIcon className="h-3 w-3" />
            </div>
            <span className="font-medium text-foreground">{APP_NAME}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="font-mono">v{APP_VERSION}</span>
            <span className="text-muted-foreground/60 hidden sm:inline">·</span>
            <span className="hidden sm:inline capitalize">
              {theme} mode
            </span>
          </div>

          {/* Middle: quick stats */}
          <div className="flex items-center gap-4">
            <FooterStat
              icon={<CircleDot className="h-3 w-3" />}
              label="Open"
              value={stats?.open ?? 0}
              color="text-amber-600 dark:text-amber-400"
            />
            <FooterStat
              icon={<CheckCircle2 className="h-3 w-3" />}
              label="Closed"
              value={stats?.closed ?? 0}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <FooterStat
              icon={<AlertOctagon className="h-3 w-3" />}
              label="Critical"
              value={stats?.critical ?? 0}
              color="text-rose-600 dark:text-rose-400"
            />
          </div>

          {/* Right: shortcut hint */}
          <div className="hidden md:flex items-center gap-2 text-muted-foreground">
            <span>Press</span>
            <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono font-medium flex items-center gap-0.5">
              <CommandIcon className="h-2.5 w-2.5" />K
            </kbd>
            <span>for commands</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn(color)}>{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  )
}
