
import pg from "pg";
import { loadConfig } from "./config";

const { Pool } = pg;
const config = loadConfig();

const databaseUnavailable = () => {
  throw new Error("Database is not configured. Database-backed features are temporarily unavailable.");
};

export const db = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
      max: config.databasePoolMax,
      idleTimeoutMillis: config.databaseIdleTimeoutMs,
      connectionTimeoutMillis: config.databaseConnectionTimeoutMs,
    })
  : {
      query: databaseUnavailable,
      end: async () => {},
      on: () => {},
    } as unknown as InstanceType<typeof Pool>;

db.on("error", (error) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      type: "database_pool_error",
      error: String(error),
    })
  );
});

export async function closeDatabase(): Promise<void> {
  await db.end();
}
