import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const runMigrations = async () => {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL ?? "",
    authToken: process.env.TURSO_AUTH_TOKEN ?? "",
  });

  const db = drizzle(client);

  console.log("[Migration] Running database migrations...");

  await migrate(db, {
    migrationsFolder: "./drizzle/migrations",
  });

  console.log("[Migration] Database migrations completed.");

  client.close();
};

runMigrations().catch((err) => {
  console.error("[Migration] Failed:", err);
  process.exit(1);
});
