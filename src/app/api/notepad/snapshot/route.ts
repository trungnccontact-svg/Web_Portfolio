import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

let globalPool: mysql.Pool | null = null;

// Helper to get or initialize default connection pool
function getGlobalPool() {
  if (globalPool) return globalPool;

  const connectionString = process.env.TIDB_DATABASE_URL;
  if (!connectionString) {
    throw new Error("TIDB_DATABASE_URL environment variable is not defined");
  }

  const useSsl = connectionString.includes("tidbcloud.com") || 
                  connectionString.includes("ssl=") || 
                  connectionString.includes("sslmode=");

  globalPool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    ssl: useSsl ? { rejectUnauthorized: true } : undefined
  });

  return globalPool;
}

// Helper to ensure the snapshots table exists
async function ensureTableExists(connection: mysql.Connection | mysql.Pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS notepad_snapshots (
      id VARCHAR(255) PRIMARY KEY,
      content TEXT NOT NULL,
      images LONGTEXT,
      created_at VARCHAR(255),
      deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  await connection.execute(query);
}

// Helper to save snapshot to a local file backup
async function saveToLocalFileBackup(snapshot: { id: string; content: string; images: any; createdAt: string }) {
  try {
    const dataDir = path.join(process.cwd(), "src", "data");
    await fs.mkdir(dataDir, { recursive: true });
    
    const filePath = path.join(dataDir, "notepad_snapshots.json");
    
    let currentSnapshots: Record<string, any> = {};
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      currentSnapshots = JSON.parse(fileData);
    } catch (e) {
      // Ignore
    }

    currentSnapshots[snapshot.id] = {
      id: snapshot.id,
      content: snapshot.content,
      images: snapshot.images || {},
      createdAt: snapshot.createdAt,
      backupTime: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(currentSnapshots, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("[Local Backup] Failed to write local backup file:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  let tempConnection: any = null;
  
  try {
    const body = await req.json();
    const { id, content, images, createdAt, tidbUrl } = body;

    const customUrl = req.headers.get("x-tidb-url") || tidbUrl;

    if (!id || content === undefined) {
      return NextResponse.json(
        { error: "Invalid snapshot data: id and content are required" },
        { status: 400 }
      );
    }

    // Try to connect and write to TiDB
    try {
      const imagesJson = images ? JSON.stringify(images) : null;
      const query = `
        INSERT INTO notepad_snapshots (id, content, images, created_at)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          content = VALUES(content),
          images = VALUES(images),
          created_at = VALUES(created_at);
      `;

      if (customUrl) {
        // Use custom URL via a single dedicated connection to avoid pool pollution
        const useSsl = customUrl.includes("tidbcloud.com") || 
                        customUrl.includes("ssl=") || 
                        customUrl.includes("sslmode=");

        tempConnection = await mysql.createConnection({
          uri: customUrl,
          ssl: useSsl ? { rejectUnauthorized: true } : undefined,
          connectTimeout: 5000
        });

        await ensureTableExists(tempConnection);
        await tempConnection.execute(query, [id, content, imagesJson, createdAt || null]);
        await tempConnection.end();
        tempConnection = null;
      } else {
        // Use default global pool
        const pool = getGlobalPool();
        await ensureTableExists(pool);
        await pool.execute(query, [id, content, imagesJson, createdAt || null]);
      }

      console.log(`[TiDB Backup] Snapshot successfully saved to TiDB: ${id}`);
      return NextResponse.json({ 
        success: true, 
        savedToTiDB: true,
        message: `Snapshot successfully saved to TiDB database for note ID ${id}` 
      });

    } catch (dbErr: any) {
      console.warn(`[TiDB Backup] Database offline or error (${dbErr.message}). Resetting connection pool and falling back...`);
      
      // Reset pool on error to recover from stale network states
      if (!customUrl) {
        globalPool = null; 
      }
      
      if (tempConnection) {
        try { await tempConnection.end(); } catch {}
        tempConnection = null;
      }

      // Fallback: Save snapshot to a local file in the workspace
      const localSaveSuccess = await saveToLocalFileBackup({ id, content, images, createdAt });
      
      if (localSaveSuccess) {
        return NextResponse.json({
          success: true,
          savedToTiDB: false,
          message: `TiDB offline (${dbErr.message || "ECONNREFUSED"}). Snapshot archived to local project files.`
        });
      } else {
        return NextResponse.json(
          { 
            error: "Backup Failed", 
            details: "Both TiDB database and local file backup failed." 
          },
          { status: 500 }
        );
      }
    }

  } catch (error: any) {
    if (tempConnection) {
      try { await tempConnection.end(); } catch {}
    }
    console.error("[TiDB Backup] Internal API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
