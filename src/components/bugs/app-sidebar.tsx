"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Bug as BugIcon,
  ChevronsLeft,
  ChevronsRight,
  Command as CommandIcon,
  Github,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SIDEBAR_ITEMS, APP_NAME, APP_VERSION } from "@/lib/constants"
import { useBugStore } from "@/store/bug-store"
import type { SidebarView } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
  variant?: "desktop" | "mobile"
}

export function AppSidebar({ collapsed, onToggle, onNavigate, variant = "desktop" }: AppSidebarProps) {
  const view = useBugStore((s) => s.view)
  const setView = useBugStore((s) => s.setView)
  const selectedBugId = useBugStore((s) => s.selectedBugId)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const handleSelect = (v: SidebarView) => {
    setView(v)
    if (v !== "bugs") {
      useBugStore.getState().selectBug(null)
    }
    onNavigate?.()
  }

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("ib4g:open-command-palette"))
    onNavigate?.()
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200 ease-out",
        collapsed ? "w-[60px]" : "w-[224px]",
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 px-3 border-b border-sidebar-border shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <BugIcon className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 animate-fade-in">
            <span className="text-sm font-semibold leading-tight truncate">{APP_NAME}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">v{APP_VERSION}</span>
          </div>
        )}
      </div>

      {/* Command palette trigger */}
      <div className="p-2 shrink-0">
        <button
          onClick={openCommandPalette}
          title={collapsed ? "Command palette (⌘K)" : undefined}
          className={cn(
            "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors border border-sidebar-border bg-sidebar/50 group",
            collapsed && "justify-center",
          )}
        >
          <CommandIcon className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-xs">Search…</span>
              <kbd className="rounded border bg-sidebar px-1 py-0.5 text-[9px] font-mono font-medium">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
        )}
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors group relative",
                collapsed && "justify-center",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 shrink-0", active && "text-primary")} />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!collapsed && active && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              )}
              {collapsed && active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-primary" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bug detail quick indicator */}
      {selectedBugId && view === "bugs" && !collapsed && (
        <div className="px-2 pb-2">
          <div className="px-2.5 py-2 rounded-md bg-accent/40 border text-[11px] text-muted-foreground">
            Viewing bug detail. Click <span className="font-medium text-foreground">Bug Reports</span> to return to the list.
          </div>
        </div>
      )}

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-2 space-y-1 shrink-0">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={collapsed ? "Toggle theme" : undefined}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors",
            collapsed && "justify-center",
          )}
        >
          {mounted ? (
            theme === "dark" ? (
              <>
                <Sun className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>Light mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>Dark mode</span>}
              </>
            )
          ) : (
            <>
              <Sun className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>Theme</span>}
            </>
          )}
        </button>

        {variant === "desktop" && (
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4.5 w-4.5 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  )
}
