import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN ?? '',
});

async function main() {
  const result = await client.execute("SELECT id, position, is_active, length(ad_code) as ad_code_len, substr(ad_code, 1, 120) as ad_code_preview FROM ad_positions ORDER BY id");
  console.log("=== CURRENT ad_positions ===");
  for (const row of result.rows) {
    console.log(`id=${row.id} | position=${row.position} | active=${row.is_active} | len=${row.ad_code_len}`);
    console.log(`  preview: ${row.ad_code_preview}`);
    console.log("");
  }
  client.close();
}

main().catch(console.error);
