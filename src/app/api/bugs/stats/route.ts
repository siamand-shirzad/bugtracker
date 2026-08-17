import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeBug } from "@/lib/serialize";
import type { BugStats } from "@/lib/types";

export async function GET() {
  try {
    const [total, open, closed, critical, byPlatformRows, recentRows] = await Promise.all([
      db.bug.count(),
      db.bug.count({ where: { status: "open" } }),
      db.bug.count({ where: { status: "closed" } }),
      db.bug.count({ where: { priority: "critical" } }),
      db.bug.groupBy({
        by: ["envPlatform"],
        _count: { _all: true },
      }),
      db.bug.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { labels: { include: { label: true } } },
      }),
    ]);

    const byStatusRows = await db.bug.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const byPriorityRows = await db.bug.groupBy({
      by: ["priority"],
      _count: { _all: true },
    });
    const byStageRows = await db.bug.groupBy({
      by: ["environmentStage"],
      _count: { _all: true },
    });

    const statusColors: Record<string, string> = {
      open: "var(--chart-4)",
      closed: "var(--chart-2)",
    };
    const priorityColors: Record<string, string> = {
      critical: "var(--chart-3)",
      high: "var(--chart-4)",
      medium: "var(--chart-5)",
      low: "var(--chart-1)",
    };
    const stageColors: Record<string, string> = {
      dev: "var(--chart-1)",
      staging: "var(--chart-2)",
      production: "var(--chart-3)",
    };

    const stats: BugStats = {
      total,
      open,
      closed,
      critical,
      byStatus: byStatusRows.map((r) => ({
        name: r.status,
        value: r._count._all,
        fill: statusColors[r.status] ?? "var(--chart-1)",
      })),
      byPriority: byPriorityRows.map((r) => ({
        name: r.priority,
        value: r._count._all,
        fill: priorityColors[r.priority] ?? "var(--chart-1)",
      })),
      byStage: byStageRows.map((r) => ({
        name: r.environmentStage,
        value: r._count._all,
        fill: stageColors[r.environmentStage] ?? "var(--chart-1)",
      })),
      byPlatform: byPlatformRows
        .filter((r) => r.envPlatform)
        .map((r) => ({ name: r.envPlatform ?? "Unknown", value: r._count._all })),
      recent: recentRows.map(serializeBug),
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[GET /api/bugs/stats] error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
