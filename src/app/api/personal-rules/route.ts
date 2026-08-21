import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbGet, dbSet } from "@/lib/tidb";

const KEY_PREFIX = "portfolio:personal_rules";

const DEFAULT_STATE = {
  playFund: 0,
  walkingStreak: 10,
  shopeeStreak: -2,
  updatedAt: new Date().toISOString(),
};

// GET /api/personal-rules
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userKey = `${KEY_PREFIX}:${session.user.email}`;

  try {
    const data = await dbGet(userKey);
    return NextResponse.json(data ? JSON.parse(data) : DEFAULT_STATE);
  } catch (error) {
    console.error("[GET /api/personal-rules] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal rules data" },
      { status: 500 }
    );
  }
}

// POST /api/personal-rules
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userKey = `${KEY_PREFIX}:${session.user.email}`;

  try {
    const body = await request.json();

    if (
      typeof body.playFund !== "number" ||
      typeof body.walkingStreak !== "number" ||
      typeof body.shopeeStreak !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 }
      );
    }

    const payload = {
      playFund: body.playFund,
      walkingStreak: body.walkingStreak,
      shopeeStreak: body.shopeeStreak,
      updatedAt: new Date().toISOString(),
    };

    // Save to TiDB
    await dbSet(userKey, JSON.stringify(payload));

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error("[POST /api/personal-rules] Error:", error);
    return NextResponse.json(
      { error: "Failed to save personal rules data" },
      { status: 500 }
    );
  }
}
