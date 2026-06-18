import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  const sqlPath = path.join(process.cwd(), "init.sql");
  let sql = fs.readFileSync(sqlPath, "utf8");

  // cleanup karakter aneh
  sql = sql
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D]/g, "")
    .replace(/\r/g, "");

  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    console.log("\nExecuting:");
    console.log(stmt);

    await client.execute(stmt);
  }

  console.log("Schema imported successfully");
}

main().catch(console.error);