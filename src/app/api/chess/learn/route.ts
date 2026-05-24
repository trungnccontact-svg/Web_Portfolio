import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

let pool: mysql.Pool | null = null;

// Get or initialize connection pool
function getPool() {
  if (pool) return pool;

  const connectionString = process.env.TIDB_DATABASE_URL;
  if (!connectionString) {
    throw new Error("TIDB_DATABASE_URL is not defined");
  }

  const useSsl = connectionString.includes("tidbcloud.com") || 
                  connectionString.includes("ssl=") || 
                  connectionString.includes("sslmode=");

  pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    ssl: useSsl ? { rejectUnauthorized: true } : undefined
  });

  return pool;
}

// Ensure the chess lessons table exists in TiDB
async function ensureTableExists(pool: mysql.Pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS chess_lessons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lesson TEXT NOT NULL,
      outcome VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.execute(query);
}

// Local JSON File Fallback Helpers
const getLocalFilePath = () => path.join(process.cwd(), "src", "data", "chess_lessons.json");

async function readLocalLessons(): Promise<any[]> {
  try {
    const filePath = getLocalFilePath();
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function writeLocalLesson(lessonText: string, outcome: string) {
  try {
    const dataDir = path.join(process.cwd(), "src", "data");
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = getLocalFilePath();
    const current = await readLocalLessons();

    const newLesson = {
      id: Date.now(),
      lesson: lessonText,
      outcome,
      created_at: new Date().toISOString()
    };

    current.push(newLesson);
    await fs.writeFile(filePath, JSON.stringify(current, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Chess Learn] Local file write failed:", err);
    return false;
  }
}

// GET: Fetch all lessons learned
export async function GET() {
  try {
    let dbPool;
    try {
      dbPool = getPool();
      await ensureTableExists(dbPool);

      const [rows] = await dbPool.execute("SELECT * FROM chess_lessons ORDER BY created_at DESC");
      return NextResponse.json({
        success: true,
        source: "tidb",
        lessons: rows
      });
    } catch (dbErr: any) {
      console.warn("[Chess Learn] TiDB offline on GET. Loading local fallback lessons...", dbErr.message || dbErr);
      const localLessons = await readLocalLessons();
      return NextResponse.json({
        success: true,
        source: "local_json",
        lessons: localLessons
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new lesson learned from a completed match
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lesson, outcome } = body;

    if (!lesson) {
      return NextResponse.json({ error: "Missing lesson description" }, { status: 400 });
    }

    let dbPool;
    try {
      dbPool = getPool();
      await ensureTableExists(dbPool);

      const query = "INSERT INTO chess_lessons (lesson, outcome) VALUES (?, ?)";
      await dbPool.execute(query, [lesson, outcome || "unknown"]);

      console.log("[Chess Learn] Lesson archived to TiDB.");
      return NextResponse.json({
        success: true,
        savedToTiDB: true,
        message: "Lesson successfully archived to TiDB database."
      });
    } catch (dbErr: any) {
      console.warn("[Chess Learn] TiDB offline on POST. Archiving to local JSON fallback...", dbErr.message || dbErr);
      const localSaved = await writeLocalLesson(lesson, outcome || "unknown");

      if (localSaved) {
        return NextResponse.json({
          success: true,
          savedToTiDB: false,
          message: "TiDB offline. Lesson archived to local JSON fallback."
        });
      } else {
        return NextResponse.json({ error: "Archiving failed locally and on TiDB" }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error("[Chess Learn API] POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
