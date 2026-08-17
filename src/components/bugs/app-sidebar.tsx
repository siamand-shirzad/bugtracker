"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Bug as BugIcon,
  Command as CommandIcon,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { NotificationBell } from "@/components/bugs/notification-bell"
import { SIDEBAR_ITEMS, APP_NAME } from "@/lib/constants"
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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const handleSelect = (v: SidebarView) => {
    setView(v)
    if (v !== "bugs") useBugStore.getState().selectBug(null)
    onNavigate?.()
  }

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("ib4g:open-command-palette"))
    onNavigate?.()
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-[width] duration-200 ease-out",
        collapsed ? "w-[56px]" : "w-[220px]",
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 px-3 shrink-0">
        <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <BugIcon className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        )}
      </div>

      {/* Command trigger */}
      <div className="px-2 shrink-0">
        <button
          onClick={openCommandPalette}
          title={collapsed ? "⌘K" : undefined}
          className={cn(
            "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors border border-sidebar-border",
            collapsed && "justify-center",
          )}
        >
          <CommandIcon className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="text-[9px] font-mono opacity-60">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                collapsed && "justify-center",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-2 shrink-0 space-y-1">
        <div className={cn("flex items-center gap-1", collapsed ? "justify-center" : "justify-between")}>
          <NotificationBell />
          {!collapsed && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {mounted ? (
                theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
        )}
        {variant === "desktop" && (
          <button
            onClick={onToggle}
            className={cn(
              "w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>
    </aside>
  )
}
