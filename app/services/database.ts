import * as SQLite from "expo-sqlite";

// Define the attendance record interface with only essential fields
export interface AttendanceRecord {
  id?: number;
  studentId: string;
  fullName: string;
  status: string; // "eligible" or "not_eligible"
  academicYear: string;
  timestamp: string; // ISO timestamp
  verificationMethod: "exam_card" | "manual";
}

// Open database connection with useNewConnection option
const DATABASE_NAME = "exam_attendance.db";

// Single database instance to avoid multiple connections
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function openDatabase() {
  // Return existing instance if available
  if (dbInstance) {
    return dbInstance;
  }

  // Create new connection with useNewConnection option
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME, {
    useNewConnection: true,
  });

  return dbInstance;
}

// Initialize database with tables - simplified schema
export async function initializeDatabase() {
  const db = await openDatabase();

  // Drop existing table and create fresh with new schema
  await db.execAsync(`
    DROP TABLE IF EXISTS attendance_records;
  `);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      fullName TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('eligible', 'not_eligible')),
      academicYear TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      verificationMethod TEXT NOT NULL CHECK(verificationMethod IN ('exam_card', 'manual')),
      UNIQUE(studentId, timestamp)
    );
    
    CREATE INDEX IF NOT EXISTS idx_student_id ON attendance_records(studentId);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON attendance_records(timestamp);
    CREATE INDEX IF NOT EXISTS idx_status ON attendance_records(status);
  `);

  console.log("Database initialized successfully...");
  return db;
}

// Store a verified student record - simplified
export async function storeAttendanceRecord(
  studentData: any,
  verificationMethod: "exam_card" | "manual" = "exam_card",
): Promise<number> {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    const record: Omit<AttendanceRecord, "id"> = {
      studentId: studentData.studentId,
      fullName: studentData.fullName,
      status: studentData.isEligible ? "eligible" : "not_eligible",
      academicYear: studentData.academicYear,
      timestamp: new Date().toISOString(),
      verificationMethod,
    };

    // console.log("Storing simplified attendance record:", {
    //   studentId: record.studentId,
    //   status: record.status,
    //   timestamp: record.timestamp,
    // });

    const result = await db.runAsync(
      `INSERT INTO attendance_records 
       (studentId, fullName, status, academicYear, timestamp, verificationMethod)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        record.studentId,
        record.fullName,
        record.status,
        record.academicYear,
        record.timestamp,
        record.verificationMethod,
      ],
    );

    // console.log("Attendance stored successfully:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error storing attendance record:", error);
    throw error;
  }
}

// Get all attendance records with connection check
export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    return await db.getAllAsync<AttendanceRecord>(
      `SELECT * FROM attendance_records 
       ORDER BY timestamp DESC`,
    );
  } catch (error) {
    console.error("Error getting all attendance records:", error);
    throw error;
  }
}

// Get attendance records for a specific date
export async function getAttendanceByDate(
  date: string,
): Promise<AttendanceRecord[]> {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    return await db.getAllAsync<AttendanceRecord>(
      `SELECT * FROM attendance_records 
       WHERE DATE(timestamp) = ?
       ORDER BY timestamp DESC`,
      [date],
    );
  } catch (error) {
    console.error("Error getting attendance by date:", error);
    throw error;
  }
}

// Get attendance records for date range (for PDF export)
export async function getAttendanceByDateRange(
  startDate: string,
  endDate: string,
): Promise<AttendanceRecord[]> {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    return await db.getAllAsync<AttendanceRecord>(
      `SELECT * FROM attendance_records 
       WHERE DATE(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [startDate, endDate],
    );
  } catch (error) {
    console.error("Error getting attendance by date range:", error);
    throw error;
  }
}

// Get statistics for reporting
export async function getAttendanceStatistics() {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    const [totalResult, eligibleResult, todayResult] = await Promise.all([
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM attendance_records",
      ),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM attendance_records WHERE status = 'eligible'",
      ),
      db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM attendance_records 
         WHERE DATE(timestamp) = DATE('now')`,
      ),
    ]);

    return {
      totalStudents: totalResult?.count || 0,
      eligibleStudents: eligibleResult?.count || 0,
      todaysCount: todayResult?.count || 0,
      ineligibleStudents:
        (totalResult?.count || 0) - (eligibleResult?.count || 0),
    };
  } catch (error) {
    console.error("Error getting attendance statistics:", error);
    throw error;
  }
}

// Get detailed statistics for a specific date or date range
export async function getDetailedStatistics(date?: string) {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    let dateFilter = "";
    let params: string[] = [];

    if (date) {
      dateFilter = "WHERE DATE(timestamp) = ?";
      params = [date];
    }

    const [byStatus, byMethod, hourlyData] = await Promise.all([
      // Count by status
      db.getAllAsync<{ status: string; count: number }>(
        `SELECT status, COUNT(*) as count 
         FROM attendance_records 
         ${dateFilter}
         GROUP BY status`,
        params,
      ),
      // Count by verification method
      db.getAllAsync<{ verificationMethod: string; count: number }>(
        `SELECT verificationMethod, COUNT(*) as count 
         FROM attendance_records 
         ${dateFilter}
         GROUP BY verificationMethod`,
        params,
      ),
      // Hourly distribution
      db.getAllAsync<{ hour: number; count: number }>(
        `SELECT CAST(strftime('%H', timestamp) AS INTEGER) as hour, 
                COUNT(*) as count 
         FROM attendance_records 
         ${dateFilter}
         GROUP BY hour
         ORDER BY hour`,
        params,
      ),
    ]);

    return {
      byStatus,
      byMethod,
      hourlyData,
    };
  } catch (error) {
    console.error("Error getting detailed statistics:", error);
    throw error;
  }
}

// Clear all records (use with caution)
export async function clearAllRecords(): Promise<void> {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    await db.runAsync("DELETE FROM attendance_records");
    // console.log("All records cleared");
  } catch (error) {
    console.error("Error clearing records:", error);
    throw error;
  }
}

// Export data for PDF generation
export async function exportAttendanceData(
  startDate?: string,
  endDate?: string,
): Promise<AttendanceRecord[]> {
  try {
    if (startDate && endDate) {
      return await getAttendanceByDateRange(startDate, endDate);
    }

    return await getAllAttendanceRecords();
  } catch (error) {
    console.error("Error exporting attendance data:", error);
    throw error;
  }
}

// Search attendance records
export async function searchAttendance(
  query: string,
): Promise<AttendanceRecord[]> {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    return await db.getAllAsync<AttendanceRecord>(
      `SELECT * FROM attendance_records 
       WHERE studentId LIKE ? OR fullName LIKE ?
       ORDER BY timestamp DESC
       LIMIT 100`,
      [`%${query}%`, `%${query}%`],
    );
  } catch (error) {
    console.error("Error searching attendance:", error);
    throw error;
  }
}

// Get unique dates with attendance records
export async function getAttendanceDates(): Promise<string[]> {
  try {
    const db = await openDatabase();

    if (!db) {
      throw new Error("Database connection not available");
    }

    const results = await db.getAllAsync<{ date: string }>(
      `SELECT DISTINCT DATE(timestamp) as date 
       FROM attendance_records 
       ORDER BY date DESC`,
    );

    return results.map((r) => r.date);
  } catch (error) {
    console.error("Error getting attendance dates:", error);
    throw error;
  }
}

// Close database connection (optional cleanup)
export async function closeDatabase() {
  if (dbInstance) {
    // Note: expo-sqlite doesn't have a close method
    // The connection will be closed automatically when the app closes
    dbInstance = null;
  }
}

// Utility function to check if database is ready
export async function isDatabaseReady(): Promise<boolean> {
  try {
    const db = await openDatabase();
    // Try a simple query to verify database is working
    await db.getFirstAsync("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database not ready:", error);
    return false;
  }
}
