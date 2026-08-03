import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbGet, dbSet } from "@/lib/tidb";
// CLAUDE_ARTIFACTS import removed — new users now start with an empty list,
// not pre-seeded mockdata. The mockdata still exists in src/mockdata/artifacts.ts
// for reference / admin use only.

const KEY_PREFIX = "portfolio:artifacts";

// GET /api/artifacts — Fetch artifact list
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userKey = `${KEY_PREFIX}:${session.user.email}`;

  try {
    const data = await dbGet(userKey);
    // New users get an empty list — no pre-seeded mockdata
    return NextResponse.json(data ? JSON.parse(data) : []);
  } catch (error) {
    console.error("[GET /api/artifacts] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artifacts" },
      { status: 500 }
    );
  }
}

// POST /api/artifacts — Save entire artifact list
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userKey = `${KEY_PREFIX}:${session.user.email}`;

  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid payload: expected an array" },
        { status: 400 }
      );
    }

    // Save to TiDB (user-scoped)
    await dbSet(userKey, JSON.stringify(body));

    return NextResponse.json({ success: true, count: body.length });
  } catch (error) {
    console.error("[POST /api/artifacts] Error:", error);
    return NextResponse.json(
      { error: "Failed to save artifacts" },
      { status: 500 }
    );
  }
}
