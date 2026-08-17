import {
  AlertTriangle,
  Bug as BugIcon,
  CheckCircle2,
  CircleDot,
  LayoutDashboard,
  ListChecks,
  Info,
  Tag,
  type LucideIcon,
} from "lucide-react"
import type {
  BugPriority,
  BugStatus,
  EnvironmentStage,
} from "@/lib/types"

// ---- App meta ----
export const APP_NAME = "IB4G BugTracker"
export const APP_VERSION = "1.0.0"
export const APP_FRAMEWORK = "Next.js 16 (App Router)"
export const APP_DATABASE = "SQLite"
export const APP_ORM = "Prisma 6"
export const APP_TEMPLATE = "IB4G Jira Bug Report Template"

// ---- Status config ----
export const STATUS_CONFIG: Record<
  BugStatus,
  { label: string; icon: LucideIcon; badge: string; dot: string }
> = {
  open: {
    label: "Open",
    icon: CircleDot,
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900",
    dot: "bg-amber-500",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
}

// ---- Priority config ----
export const PRIORITY_CONFIG: Record<
  BugPriority,
  {
    label: string
    icon: LucideIcon
    badge: string
    dot: string
    order: number
  }
> = {
  low: {
    label: "Low",
    icon: CircleDot,
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
    order: 0,
  },
  medium: {
    label: "Medium",
    icon: CircleDot,
    badge: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900",
    dot: "bg-sky-500",
    order: 1,
  },
  high: {
    label: "High",
    icon: AlertTriangle,
    badge: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-900",
    dot: "bg-orange-500",
    order: 2,
  },
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    badge: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900",
    dot: "bg-rose-500",
    order: 3,
  },
}

export const PRIORITY_ORDER: BugPriority[] = ["critical", "high", "medium", "low"]

// ---- Stage config ----
export const STAGE_CONFIG: Record<
  EnvironmentStage,
  { label: string; icon: string; badge: string; dot: string }
> = {
  dev: {
    label: "Dev",
    icon: "💻",
    badge: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-900",
    dot: "bg-violet-500",
  },
  staging: {
    label: "Staging",
    icon: "🧪",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900",
    dot: "bg-cyan-500",
  },
  production: {
    label: "Production",
    icon: "🚀",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900",
    dot: "bg-red-500",
  },
}

// ---- Label color palette ----
export const LABEL_COLORS = [
  "neutral",
  "rose",
  "orange",
  "amber",
  "emerald",
  "teal",
  "cyan",
  "violet",
  "fuchsia",
  "slate",
] as const

export const LABEL_COLOR_MAP: Record<
  string,
  { badge: string; dot: string }
> = {
  neutral: {
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900",
    dot: "bg-rose-500",
  },
  orange: {
    badge: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-900",
    dot: "bg-orange-500",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900",
    dot: "bg-amber-500",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
  teal: {
    badge: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900",
    dot: "bg-teal-500",
  },
  cyan: {
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900",
    dot: "bg-cyan-500",
  },
  violet: {
    badge: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-900",
    dot: "bg-violet-500",
  },
  fuchsia: {
    badge: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:border-fuchsia-900",
    dot: "bg-fuchsia-500",
  },
  slate: {
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
    dot: "bg-slate-500",
  },
}

// ---- Sidebar nav ----
export type SidebarView = "dashboard" | "bugs" | "labels" | "endpoints"

export interface SidebarItem {
  id: SidebarView
  label: string
  icon: LucideIcon
  description: string
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
  {
    id: "bugs",
    label: "Bug Reports",
    icon: ListChecks,
    description: "All bug reports",
  },
  {
    id: "labels",
    label: "Labels",
    icon: Tag,
    description: "Manage labels",
  },
  {
    id: "endpoints",
    label: "Endpoints",
    icon: Info,
    description: "API reference",
  },
]

// ---- Chart colors ----
export const CHART_COLORS = {
  open: "var(--chart-1)",
  closed: "var(--chart-2)",
  critical: "var(--chart-3)",
  high: "var(--chart-4)",
  medium: "var(--chart-5)",
  low: "var(--chart-1)",
  dev: "var(--chart-1)",
  staging: "var(--chart-2)",
  production: "var(--chart-3)",
}

// ---- Default template (for the form popover) ----
export const DEFAULT_TEMPLATE = `## Jira Summary
\`[Bug][Login] Cannot login with valid credentials\`

## Overview
IB4G (Dev) > Logged Out > Web > Login Page > Submit > Error

## Environment
App: IB4G (Dev)
Page: Login > Login Page
Platform: Web
OS: Windows
Browser: Chrome

## Preconditions
- User has a valid account
- User is on the login page

## Steps to Reproduce
1. Enter valid email
2. Enter valid password
3. Click Login button

## Actual Result
Error 500 shown, user not logged in.

## Expected Result
User redirected to dashboard.

## Impact
**User Impact:**
- Users cannot access the application

**Business Impact:**
- Revenue loss from abandoned sessions

**QA Impact:**
- QA cannot verify login flow

## Technical Notes
API returns 500, stack trace points to auth middleware.`

// ---- Bug icon (used in header / empty states) ----
export const BUG_ICON = BugIcon
