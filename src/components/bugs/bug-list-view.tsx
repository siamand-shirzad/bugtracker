"use client"

import * as React from "react"
import {
  AlertTriangle,
  Bug as BugIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  Tags,
  Trash2,
  Upload,
  UserCog,
  X,
  CheckSquare,
  Square,
  Loader2,
  Save,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/bugs/status-badge"
import { PriorityBadge } from "@/components/bugs/priority-badge"
import { StageBadge } from "@/components/bugs/stage-badge"
import { LabelBadge } from "@/components/bugs/label-badge"
import { EmptyState } from "@/components/bugs/empty-state"
import {
  useBugList,
  useLabels,
  useBulkAction,
  useExportBugs,
  useImportBugs,
} from "@/hooks/use-bugs"
import { useBugStore } from "@/store/bug-store"
import { useSavedFilters } from "@/hooks/use-saved-filters"
import {
  PRIORITY_CONFIG,
  STAGE_CONFIG,
  STATUS_CONFIG,
} from "@/lib/constants"
import type {
  BugPriority,
  BugStatus,
  EnvironmentStage,
  BulkAction,
  ImportItem,
} from "@/lib/types"
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
  const bulkMut = useBulkAction()
  const exportMut = useExportBugs()
  const importMut = useImportBugs()
  const { savedFilters, saveCurrentFilter, deleteSavedFilter, applySavedFilter } = useSavedFilters()

  // local search input (debounced)
  const [searchInput, setSearchInput] = React.useState(filters.search ?? "")
  const searchInputRef = React.useRef<HTMLInputElement>(null)
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

  // ---- Selection state ----
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const allVisibleSelected = bugs.length > 0 && bugs.every((b) => selected.has(b.id))
  const someSelected = bugs.some((b) => selected.has(b.id))
  const selectedCount = selected.size

  React.useEffect(() => {
    // Prune selected ids that are no longer on the current page
    setSelected((prev) => {
      const visibleIds = new Set(bugs.map((b) => b.id))
      const next = new Set<string>()
      prev.forEach((id) => {
        if (!visibleIds.has(id)) next.add(id)
      })
      return next.size === prev.size ? prev : next
    })
  }, [bugs])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev)
        bugs.forEach((b) => next.delete(b.id))
        return next
      }
      const next = new Set(prev)
      bugs.forEach((b) => next.add(b.id))
      return next
    })
  }
  const clearSelection = () => setSelected(new Set())

  const applyBulk = (action: BulkAction["action"]) => {
    if (selectedCount === 0) return
    bulkMut.mutate(
      { bugIds: Array.from(selected), action },
      {
        onSuccess: () => {
          if (action.type === "delete") clearSelection()
        },
      },
    )
  }

  const hasActiveFilters =
    (filters.search && filters.search.length > 0) ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.platform !== "all" ||
    filters.stage !== "all"

  // ---- Export dropdown ----
  const handleExport = (format: "csv" | "json") => {
    exportMut.mutate({ format, limit: 1000 })
  }

  // ---- Import dialog ----
  const [importOpen, setImportOpen] = React.useState(false)
  const [importText, setImportText] = React.useState("")
  const [importFormat, setImportFormat] = React.useState<"json" | "csv">("json")
  const handleImport = () => {
    let parsed: ImportItem[] = []
    if (importFormat === "csv") {
      parsed = parseCsv(importText)
    } else {
      try {
        const obj = JSON.parse(importText)
        if (Array.isArray(obj)) {
          parsed = obj as ImportItem[]
        } else if (obj && Array.isArray((obj as { bugs?: ImportItem[] }).bugs)) {
          parsed = (obj as { bugs: ImportItem[] }).bugs
        } else {
          throw new Error("Expected an array or { bugs: [...] }")
        }
      } catch (e) {
        toast.error("Invalid JSON: " + (e instanceof Error ? e.message : "parse error"))
        return
      }
    }
    if (parsed.length === 0) {
      toast.error("No bugs found in input")
      return
    }
    importMut.mutate(parsed, {
      onSuccess: () => {
        setImportOpen(false)
        setImportText("")
      },
    })
  }

  // Expose search ref for keyboard shortcut focus
  React.useEffect(() => {
    // Allow external focus via custom event (used by keyboard shortcuts)
    const handler = () => searchInputRef.current?.focus()
    window.addEventListener("ib4g:focus-search", handler)
    return () => window.removeEventListener("ib4g:focus-search", handler)
  }, [])

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
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" disabled={exportMut.isPending}>
                {exportMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <Download className="h-3.5 w-3.5 mr-2" />
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <Download className="h-3.5 w-3.5 mr-2" />
                Download as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" className="gap-2" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New bug
          </Button>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedCount > 0 && (
        <Card className="border-primary/30 bg-primary/5 animate-slide-in-right">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <CheckSquare className="h-3 w-3" />
                  {selectedCount} selected
                </Badge>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      Status <ChevronRight className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Set status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => applyBulk({ type: "status", value: "open" })}>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2" /> Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyBulk({ type: "status", value: "closed" })}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" /> Closed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      Priority <ChevronRight className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Set priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(["critical", "high", "medium", "low"] as BugPriority[]).map((p) => (
                      <DropdownMenuItem
                        key={p}
                        onClick={() => applyBulk({ type: "priority", value: p })}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full mr-2", PRIORITY_CONFIG[p].dot)} />
                        <span className="capitalize">{p}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      Stage <ChevronRight className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Set environment</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(["dev", "staging", "production"] as EnvironmentStage[]).map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => applyBulk({ type: "stage", value: s })}
                      >
                        <span>{STAGE_CONFIG[s].icon}</span>
                        <span className="ml-2 capitalize">{s}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <Tags className="h-3.5 w-3.5" /> Add label <ChevronRight className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-72 overflow-y-auto scrollbar-thin">
                    <DropdownMenuLabel>Add label to all</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {labels.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                        No labels yet
                      </div>
                    ) : (
                      labels.map((l) => (
                        <DropdownMenuItem
                          key={l.id}
                          onClick={() => applyBulk({ type: "addLabel", value: l.id })}
                        >
                          <span className="font-medium mr-2">{l.name}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {l.color}
                          </Badge>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <Tags className="h-3.5 w-3.5" /> Remove label <ChevronRight className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-72 overflow-y-auto scrollbar-thin">
                    <DropdownMenuLabel>Remove label from all</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {labels.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                        No labels yet
                      </div>
                    ) : (
                      labels.map((l) => (
                        <DropdownMenuItem
                          key={l.id}
                          onClick={() => applyBulk({ type: "removeLabel", value: l.id })}
                        >
                          <span className="font-medium mr-2">{l.name}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {l.color}
                          </Badge>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <UserCog className="h-3.5 w-3.5" /> Assignee <ChevronRight className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Set assignee</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => applyBulk({ type: "assignee", value: "Sara Chen" })}>
                      <span className="mr-2">🧑‍💻</span> Sara Chen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyBulk({ type: "assignee", value: "Marco Diaz" })}>
                      <span className="mr-2">🧑‍💻</span> Marco Diaz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyBulk({ type: "assignee", value: "Priya Nair" })}>
                      <span className="mr-2">🧑‍💻</span> Priya Nair
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => applyBulk({ type: "assignee", value: null })}>
                      <span className="mr-2 text-muted-foreground">∅</span>
                      <span className="text-muted-foreground">Clear assignee</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                  onClick={() => applyBulk({ type: "delete" })}
                  disabled={bulkMut.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search summary, jira ID, notes… (press / to focus)"
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
            {(hasActiveFilters || savedFilters.length > 0) && (
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {hasActiveFilters && (
                  <>
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Filters active</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={resetFilters}>
                      Reset
                    </Button>
                  </>
                )}
                {savedFilters.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Save className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Saved:</span>
                    {savedFilters.map((sf) => (
                      <Popover key={sf.id}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs gap-1 px-2"
                            title={`Load "${sf.name}"`}
                          >
                            {sf.name}
                            <X
                              className="h-3 w-3 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSavedFilter(sf.id)
                                toast.success(`Deleted "${sf.name}"`)
                              }}
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start">
                          <p className="text-xs font-medium mb-1.5">{sf.name}</p>
                          <pre className="text-[10px] text-muted-foreground font-mono mb-2 max-h-32 overflow-y-auto scrollbar-thin">
                            {JSON.stringify(sf.filters, null, 2)}
                          </pre>
                          <Button
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => {
                              applySavedFilter(sf.filters)
                              toast.success(`Applied "${sf.name}"`)
                            }}
                          >
                            Apply filter
                          </Button>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                )}
                {hasActiveFilters && (
                  <SaveCurrentFilterButton onSave={saveCurrentFilter} />
                )}
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
                  <TableHead className="w-[36px] pl-3">
                    <Checkbox
                      checked={allVisibleSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                  <TableHead className="w-[40%] min-w-[240px]">Bug</TableHead>
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
                      <TableCell className="pl-3"><Skeleton className="h-4 w-4" /></TableCell>
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
                    <TableCell colSpan={7} className="text-center py-16">
                      <EmptyState
                        icon={BugIcon}
                        title="No bug reports found"
                        description={
                          hasActiveFilters
                            ? "Try adjusting or resetting your filters."
                            : "Create your first bug report to get started."
                        }
                        action={{
                          label: "New bug",
                          icon: Plus,
                          onClick: openCreateForm,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  bugs.map((bug, idx) => {
                    const isSelected = selected.has(bug.id)
                    return (
                      <TableRow
                        key={bug.id}
                        data-state={isSelected ? "selected" : undefined}
                        onClick={() => selectBug(bug.id)}
                        className={cn(
                          "cursor-pointer group animate-fade-in",
                          isSelected && "bg-primary/5",
                        )}
                        style={{ animationDelay: `${Math.min(idx * 25, 200)}ms` }}
                      >
                        <TableCell
                          className="pl-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelect(bug.id)
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            aria-label={`Select ${bug.summary}`}
                          />
                        </TableCell>
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
                    )
                  })
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
                {selectedCount > 0 && (
                  <span className="ml-2 text-primary">· {selectedCount} selected</span>
                )}
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

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import bug reports</DialogTitle>
            <DialogDescription>
              Paste {importFormat === "json" ? "a JSON array" : "CSV with a header row"} or upload a file.
              Each bug requires a <code>summary</code> field; all other fields are optional.
              Templates in <code>overview</code> will be auto-parsed.
            </DialogDescription>
          </DialogHeader>

          {/* Format toggle + file upload */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex rounded-md border overflow-hidden">
              <button
                type="button"
                onClick={() => setImportFormat("json")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  importFormat === "json"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent text-muted-foreground",
                )}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setImportFormat("csv")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors border-l",
                  importFormat === "csv"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent text-muted-foreground",
                )}
              >
                CSV
              </button>
            </div>
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              <FileText className="h-3.5 w-3.5" />
              Upload file
              <input
                type="file"
                accept={importFormat === "json" ? ".json,application/json" : ".csv,text/csv"}
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  const text = await f.text()
                  setImportText(text)
                  e.target.value = ""
                }}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-text" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {importFormat === "json" ? "JSON payload" : "CSV data (with header row)"}
            </Label>
            <Textarea
              id="import-text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                importFormat === "json"
                  ? `[
  {
    "summary": "Cannot login with valid credentials",
    "jiraId": "IB4G-1234",
    "priority": "critical",
    "environmentStage": "production",
    "overview": "## Overview\\nIB4G (Production) > Logged Out > Web > Login Page > Submit > Error\\n...",
    "labelNames": ["auth", "regression"]
  }
]`
                  : `summary,jiraId,priority,environmentStage,status,assignee,labels
Cannot login,IB4G-1234,critical,production,open,Sara Chen,auth | regression
Dark mode broken,IB4G-1235,medium,dev,open,Priya Nair,ui`
              }
              className="min-h-[280px] font-mono text-xs scrollbar-thin"
            />
            <p className="text-[11px] text-muted-foreground">
              {importFormat === "csv" && (
                <>
                  CSV columns: <code>summary</code> (required), <code>jiraId</code>,{" "}
                  <code>priority</code>, <code>environmentStage</code>, <code>status</code>,{" "}
                  <code>assignee</code>, <code>labels</code> (pipe-separated),{" "}
                  <code>envPlatform</code>, <code>envOS</code>, <code>envBrowser</code>.
                </>
              )}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importText.trim() || importMut.isPending}>
              {importMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import bugs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SaveCurrentFilterButton({
  onSave,
}: {
  onSave: (name: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
          <Save className="h-3 w-3" />
          Save current
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Filter name
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Critical open bugs"
          className="h-8 text-xs"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              onSave(name.trim())
              setName("")
              setOpen(false)
            }
          }}
        />
        <Button
          size="sm"
          className="w-full mt-2 h-7 text-xs"
          disabled={!name.trim()}
          onClick={() => {
            onSave(name.trim())
            setName("")
            setOpen(false)
          }}
        >
          Save filter
        </Button>
      </PopoverContent>
    </Popover>
  )
}

// ---- CSV parser (RFC 4180-ish) ----
function parseCsv(text: string): ImportItem[] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuotes = true
      } else if (c === ",") {
        row.push(field)
        field = ""
      } else if (c === "\n") {
        row.push(field)
        rows.push(row)
        row = []
        field = ""
      } else if (c === "\r") {
        // skip
      } else {
        field += c
      }
    }
  }
  // last field
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  if (rows.length < 2) return []
  const headers = rows[0].map((h) => h.trim().toLowerCase())
  const items: ImportItem[] = []
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]
    if (cells.length === 1 && !cells[0].trim()) continue
    const obj: Record<string, string> = {}
    for (let c = 0; c < headers.length && c < cells.length; c++) {
      obj[headers[c]] = cells[c]
    }
    const summary = obj.summary || obj.title || ""
    if (!summary) continue
    items.push({
      summary,
      jiraId: obj.jiraid || obj.jira_id || undefined,
      priority: (obj.priority as ImportItem["priority"]) || undefined,
      environmentStage: (obj.environmentstage || obj.stage) as ImportItem["environmentStage"] | undefined,
      status: obj.status as ImportItem["status"] | undefined,
      assignee: obj.assignee || undefined,
      reporter: obj.reporter || undefined,
      envPlatform: obj.envplatform || obj.platform || undefined,
      envOS: obj.envos || obj.os || undefined,
      envBrowser: obj.envbrowser || obj.browser || undefined,
      labelNames: (obj.labels || "").split("|").map((s) => s.trim()).filter(Boolean),
    })
  }
  return items
}
