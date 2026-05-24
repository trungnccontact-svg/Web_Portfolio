import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req: NextRequest) {
  try {
    let tidbUrl = "";
    try {
      const body = await req.json();
      tidbUrl = body.tidbUrl;
    } catch (e) {
      // Body might be empty
    }

    // Fallback to environment variable if no custom URL provided
    const targetUrl = tidbUrl || process.env.TIDB_DATABASE_URL;

    if (!targetUrl) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing database connection URL. Configure it in the settings panel." 
      });
    }

    const useSsl = targetUrl.includes("tidbcloud.com") || 
                    targetUrl.includes("ssl=") || 
                    targetUrl.includes("sslmode=");

    let connection;
    try {
      connection = await mysql.createConnection({
        uri: targetUrl,
        ssl: useSsl ? { rejectUnauthorized: true } : undefined,
        connectTimeout: 5000 // 5 seconds timeout
      });

      await connection.query("SELECT 1");
      await connection.end();

      return NextResponse.json({
        success: true,
        message: "Successfully connected to TiDB database!",
        isDefaultUrl: !tidbUrl
      });
    } catch (err: any) {
      console.warn("[Test Connection] Connection attempt failed:", err.message);
      if (connection) {
        try { await connection.end(); } catch {}
      }
      return NextResponse.json({
        success: false,
        error: err.message || "Connection timed out or was refused."
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
