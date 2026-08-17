"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  GitBranch,
  History,
  ListChecks,
  Plus,
  Tags,
  User,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { BugEvent, BugEventType } from "@/lib/types"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivityTimelineProps {
  events: BugEvent[] | undefined
  isLoading: boolean
}

const EVENT_META: Record<
  BugEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string; dot: string }
> = {
  created: {
    icon: Plus,
    color: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  status_changed: {
    icon: CircleDot,
    color: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  priority_changed: {
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  stage_changed: {
    icon: GitBranch,
    color: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  assignee_changed: {
    icon: User,
    color: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  labels_changed: {
    icon: Tags,
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    dot: "bg-fuchsia-500",
  },
  summary_changed: {
    icon: Pencil,
    color: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-500",
  },
  details_updated: {
    icon: Sparkles,
    color: "text-teal-600 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  deleted: {
    icon: Trash2,
    color: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
}

export function ActivityTimeline({ events, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <History className="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Changes to this bug will appear here.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="max-h-[420px] scrollbar-thin pr-3">
      <ol className="relative space-y-1">
        {/* Vertical line */}
        <div
          className="absolute left-[13px] top-2 bottom-2 w-px bg-border"
          aria-hidden
        />
        {events.map((event, idx) => {
          const meta = EVENT_META[event.type] ?? EVENT_META.details_updated
          const Icon = meta.icon
          return (
            <li
              key={event.id}
              className="relative flex items-start gap-3 pl-0.5 py-1.5 group animate-fade-in"
              style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
            >
              <div
                className={cn(
                  "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background border-2 transition-colors",
                  meta.dot.replace("bg-", "border-"),
                )}
              >
                <div className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-snug">
                    <Icon className={cn("inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5", meta.color)} />
                    <span className="font-medium">{event.summary}</span>
                  </p>
                  <time
                    className="text-[10px] text-muted-foreground shrink-0 tabular-nums whitespace-nowrap"
                    title={format(new Date(event.createdAt), "MMM d, yyyy 'at' HH:mm:ss")}
                  >
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  </time>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {event.actor}
                  </span>
                  {event.field && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="font-mono">{event.field}</span>
                    </>
                  )}
                  {event.oldValue && event.newValue && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="line-through opacity-70">{event.oldValue}</span>
                        <span>→</span>
                        <span className="font-medium text-foreground">{event.newValue}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </ScrollArea>
  )
}
