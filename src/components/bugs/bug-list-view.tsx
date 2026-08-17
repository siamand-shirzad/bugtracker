"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  Bug as BugIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardCopy,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/bugs/status-badge"
import { PriorityBadge } from "@/components/bugs/priority-badge"
import { StageBadge } from "@/components/bugs/stage-badge"
import { LabelBadge } from "@/components/bugs/label-badge"
import { useBugList, useLabels } from "@/hooks/use-bugs"
import { useBugStore } from "@/store/bug-store"
import {
  PRIORITY_CONFIG,
  STAGE_CONFIG,
  STATUS_CONFIG,
} from "@/lib/constants"
import type { BugPriority, BugStatus, EnvironmentStage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { value: BugStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
]
const PRIORITY_OPTIONS: { value: BugPriority | "all"; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]
const STAGE_OPTIONS: { value: EnvironmentStage | "all"; label: string }[] = [
  { value: "all", label: "All environments" },
  { value: "dev", label: "Dev" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
]
const PLATFORM_OPTIONS = [
  { value: "all", label: "All platforms" },
  { value: "Web", label: "Web" },
  { value: "API", label: "API" },
  { value: "Mobile", label: "Mobile" },
]

export function BugListView() {
  const filters = useBugStore((s) => s.filters)
  const setSearch = useBugStore((s) => s.setSearch)
  const setStatus = useBugStore((s) => s.setStatus)
  const setPriority = useBugStore((s) => s.setPriority)
  const setPlatform = useBugStore((s) => s.setPlatform)
  const setStage = useBugStore((s) => s.setStage)
  const setPage = useBugStore((s) => s.setPage)
  const resetFilters = useBugStore((s) => s.resetFilters)
  const selectBug = useBugStore((s) => s.selectBug)
  const openCreateForm = useBugStore((s) => s.openCreateForm)
  const { data: labels = [] } = useLabels()

  // local search input (debounced)
  const [searchInput, setSearchInput] = React.useState(filters.search ?? "")
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== (filters.search ?? "")) setSearch(searchInput)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isFetching } = useBugList(filters)

  const bugs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const page = data?.page ?? 1
  const pageSize = data?.pageSize ?? filters.pageSize ?? 10

  const hasActiveFilters =
    (filters.search && filters.search.length > 0) ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.platform !== "all" ||
    filters.stage !== "all"

  const handleExportAll = async () => {
    try {
      const res = await fetch(`/api/bugs?pageSize=1000`)
      const json = await res.json()
      const lines = (json.data as { id: string; jiraId: string | null; summary: string }[]).map(
        (b) => `${b.jiraId ?? "(no-jira)"}\t${b.summary}\t${b.id}`,
      )
      const text = lines.join("\n")
      await navigator.clipboard.writeText(text)
      toast.success(`Copied ${lines.length} bug(s) to clipboard`)
    } catch {
      toast.error("Failed to export bugs")
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bug Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} report{total === 1 ? "" : "s"} tracked
            {isFetching && !isLoading && (
              <span className="ml-2 text-xs text-muted-foreground">refreshing…</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportAll}>
            <ClipboardCopy className="h-4 w-4" />
            Export all
          </Button>
          <Button size="sm" className="gap-2" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New bug
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search summary, jira ID, notes…"
                  className="pl-9"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Select value={filters.status ?? "all"} onValueChange={(v) => setStatus(v as BugStatus | "all")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.priority ?? "all"} onValueChange={(v) => setPriority(v as BugPriority | "all")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.stage ?? "all"} onValueChange={(v) => setStage(v as EnvironmentStage | "all")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.platform ?? "all"} onValueChange={(v) => setPlatform(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-xs">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Filters active</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%] min-w-[280px]">Bug</TableHead>
                  <TableHead className="w-[90px]">Status</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[120px] hidden md:table-cell">Stage</TableHead>
                  <TableHead className="w-[160px] hidden lg:table-cell">Labels</TableHead>
                  <TableHead className="w-[120px] hidden sm:table-cell text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-full max-w-[260px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : bugs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BugIcon className="h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No bug reports found</p>
                        <p className="text-xs">
                          {hasActiveFilters
                            ? "Try adjusting or resetting your filters."
                            : "Create your first bug report to get started."}
                        </p>
                        <Button size="sm" variant="outline" className="mt-2 gap-2" onClick={openCreateForm}>
                          <Plus className="h-4 w-4" />
                          New bug
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bugs.map((bug) => (
                    <TableRow
                      key={bug.id}
                      onClick={() => selectBug(bug.id)}
                      className="cursor-pointer group"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            {bug.jiraId && (
                              <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                                {bug.jiraId}
                              </span>
                            )}
                            <span className="text-sm font-medium truncate group-hover:text-foreground">
                              {bug.summary}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-mono">{bug.id.slice(0, 8)}</span>
                            <span>·</span>
                            <span className="hidden sm:inline">
                              {bug.envPlatform ?? "—"}
                            </span>
                            <span className="sm:hidden">
                              {STAGE_CONFIG[bug.environmentStage]?.label}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={bug.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={bug.priority} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StageBadge stage={bug.environmentStage} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {bug.labels.slice(0, 2).map((l) => (
                            <LabelBadge key={l.id} label={l} />
                          ))}
                          {bug.labels.length > 2 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{bug.labels.length - 2}
                            </span>
                          )}
                          {bug.labels.length === 0 && (
                            <span className="text-[11px] text-muted-foreground italic">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(bug.updatedAt), { addSuffix: true })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {bugs.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span>–
                <span className="font-medium text-foreground">{Math.min(page * pageSize, total)}</span> of{" "}
                <span className="font-medium text-foreground">{total}</span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2 tabular-nums">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
