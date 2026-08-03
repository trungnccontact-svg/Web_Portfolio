import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbGet, dbSet } from "@/lib/tidb";

const KEY_PREFIX = "portfolio:notepad_notes";

// Default notes are no longer auto-seeded for new users.
// New accounts start with a completely empty notepad.
// The content below is kept as reference only.
//
// const DEFAULT_NOTES = [
//   {
//     id: "note-1",
//     content: "Interactive Notepad 📝\n\nWelcome to your new multi-card notepad dashboard! ...",
//     originalContent: null,
//     createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
//   },
//   {
//     id: "note-2",
//     content: "Pro Tips 💡\n\n- Click the Pencil icon on any popup card to edit its content.",
//     originalContent: null,
//     createdAt: new Date().toISOString()
//   }
// ];

// GET /api/notepad — Fetch all notes
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userKey = `${KEY_PREFIX}:${session.user.email}`;

  try {
    const data = await dbGet(userKey);
    // New users get an empty notepad — no pre-seeded default notes
    return NextResponse.json(data ? JSON.parse(data) : []);
  } catch (error) {
    console.error("[GET /api/notepad] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/notepad — Save entire notes list
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
        { error: "Invalid payload: expected an array of notes" },
        { status: 400 }
      );
    }

    // Save to TiDB (user-scoped)
    await dbSet(userKey, JSON.stringify(body));

    return NextResponse.json({ success: true, count: body.length });
  } catch (error) {
    console.error("[POST /api/notepad] Error:", error);
    return NextResponse.json(
      { error: "Failed to save notes" },
      { status: 500 }
    );
  }
}
