import { defineConfig } from "drizzle-kit";
import { configDotenv } from "dotenv";

export default defineConfig ({
  dialect: "turso",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL ?? '', 
    authToken: process.env.TURSO_AUTH_TOKEN ?? ''
  },
  verbose: true, 
  strict: true 
});
