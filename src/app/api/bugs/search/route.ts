import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeBug } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "10", 10),
      50,
    );

    if (!q) {
      return NextResponse.json({ data: [], q: "" });
    }

    // Search across summary, jiraId, actualResult, expectedResult, technicalNotes
    const rows = await db.bug.findMany({
      where: {
        OR: [
          { summary: { contains: q } },
          { jiraId: { contains: q } },
          { actualResult: { contains: q } },
          { expectedResult: { contains: q } },
          { technicalNotes: { contains: q } },
          { envPlatform: { contains: q } },
          { envPage: { contains: q } },
          { overviewModule: { contains: q } },
        ],
      },
      include: { labels: { include: { label: true } } },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      data: rows.map(serializeBug),
      q,
      total: rows.length,
    });
  } catch (err) {
    console.error("[GET /api/bugs/search] error:", err);
    return NextResponse.json({ error: "Failed to search bugs" }, { status: 500 });
  }
}
