"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Bug as BugIcon,
  CheckCircle2,
  CircleDot,
  Clock,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StatusBadge } from "@/components/bugs/status-badge"
import { PriorityBadge } from "@/components/bugs/priority-badge"
import { StageBadge } from "@/components/bugs/stage-badge"
import { LabelBadge } from "@/components/bugs/label-badge"
import { useBugStats } from "@/hooks/use-bugs"
import { useBugStore } from "@/store/bug-store"
import { PRIORITY_CONFIG, STATUS_CONFIG, STAGE_CONFIG } from "@/lib/constants"
import type { BugPriority, BugStatus, EnvironmentStage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export function DashboardView() {
  const { data: stats, isLoading } = useBugStats()
  const setView = useBugStore((s) => s.setView)
  const selectBug = useBugStore((s) => s.selectBug)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of bug reports across all environments.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setView("bugs")} className="gap-2">
          <BugIcon className="h-4 w-4" />
          View all bugs
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Reports"
          value={stats?.total}
          icon={BugIcon}
          accent="text-foreground"
          loading={isLoading}
          hint="All-time tracked"
        />
        <StatCard
          label="Open"
          value={stats?.open}
          icon={CircleDot}
          accent="text-amber-600 dark:text-amber-400"
          loading={isLoading}
          hint="Awaiting resolution"
        />
        <StatCard
          label="Closed"
          value={stats?.closed}
          icon={CheckCircle2}
          accent="text-emerald-600 dark:text-emerald-400"
          loading={isLoading}
          hint="Resolved & verified"
        />
        <StatCard
          label="Critical"
          value={stats?.critical}
          icon={AlertOctagon}
          accent="text-rose-600 dark:text-rose-400"
          loading={isLoading}
          hint="Needs immediate attention"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status bar chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              By Status
            </CardTitle>
            <CardDescription className="text-xs">
              Open vs closed distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats?.byStatus ?? []} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {(stats?.byStatus ?? []).map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Priority donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              By Priority
            </CardTitle>
            <CardDescription className="text-xs">
              Severity breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart data={stats?.byPriority ?? []} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
                      {(stats?.byPriority ?? []).map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-semibold tabular-nums">
                    {stats?.total ?? 0}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    total
                  </span>
                </div>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 justify-center">
              {(stats?.byPriority ?? []).map((p) => (
                <div key={p.name} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: p.fill }}
                  />
                  <span className="capitalize text-muted-foreground">{p.name}</span>
                  <span className="font-medium tabular-nums">{p.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stage donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BugIcon className="h-4 w-4 text-muted-foreground" />
              By Environment
            </CardTitle>
            <CardDescription className="text-xs">
              Dev / staging / production
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart data={stats?.byStage ?? []} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
                      {(stats?.byStage ?? []).map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-semibold tabular-nums">
                    {stats?.byStage.reduce((a, b) => a + b.value, 0) ?? 0}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    reports
                  </span>
                </div>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 justify-center">
              {(stats?.byStage ?? []).map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: s.fill }}
                  />
                  <span className="capitalize text-muted-foreground">{s.name}</span>
                  <span className="font-medium tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent bugs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Last 5 updated bug reports
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setView("bugs")}>
              See all
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (stats?.recent ?? []).length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <BugIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No bug reports yet.
            </div>
          ) : (
            <div className="space-y-1">
              {(stats?.recent ?? []).map((bug) => (
                <button
                  key={bug.id}
                  onClick={() => {
                    setView("bugs")
                    selectBug(bug.id)
                  }}
                  className="w-full text-left group flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {bug.jiraId && (
                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                          {bug.jiraId}
                        </span>
                      )}
                      <p className="text-sm font-medium truncate group-hover:text-foreground">
                        {bug.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <StatusBadge status={bug.status} />
                      <PriorityBadge priority={bug.priority} />
                      <StageBadge stage={bug.environmentStage} />
                      {bug.labels.slice(0, 2).map((l) => (
                        <LabelBadge key={l.id} label={l} />
                      ))}
                      {bug.labels.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{bug.labels.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:block">
                    {formatDistanceToNow(new Date(bug.updatedAt), { addSuffix: true })}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
  hint,
}: {
  label: string
  value: number | undefined
  icon: React.ComponentType<{ className?: string }>
  accent: string
  loading?: boolean
  hint?: string
}) {
  return (
    <Card className="overflow-hidden relative group">
      <CardHeader className="pb-1.5 pt-4">
        <div className="flex items-center justify-between">
          <CardDescription className="text-[11px] font-semibold uppercase tracking-wider">
            {label}
          </CardDescription>
          <Icon className={cn("h-4 w-4", accent)} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className={cn("text-3xl font-semibold tabular-nums", accent)}>
            {value ?? 0}
          </div>
        )}
        {hint && (
          <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  )
}
