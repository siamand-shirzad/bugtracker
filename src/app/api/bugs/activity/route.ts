import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "20", 10),
      100,
    );

    // Fetch recent events across ALL bugs, joined with the bug summary + jiraId
    const rows = await db.bugEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        bug: {
          select: { summary: true, jiraId: true },
        },
      },
    });

    const events = rows.map((r) => ({
      id: r.id,
      bugId: r.bugId,
      type: r.type,
      summary: r.summary,
      actor: r.actor,
      createdAt: r.createdAt.toISOString(),
      bugSummary: r.bug.summary,
      jiraId: r.bug.jiraId,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[GET /api/bugs/activity] error:", err);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
