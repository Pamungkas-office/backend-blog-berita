import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN ?? '',
});

const headerIns = `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6349557520431970"
     data-ad-slot="9898536311"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`;

const sidebarIns = `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6349557520431970"
     data-ad-slot="8256105987"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`;

const inArticleIns = `<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-6349557520431970"
     data-ad-slot="9377615964"></ins>`;

const footerIns = `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6349557520431970"
     data-ad-slot="5013875296"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`;

async function main() {
  console.log("=== BEFORE ===");
  const before = await client.execute("SELECT id, position, is_active, length(ad_code) as len FROM ad_positions ORDER BY id");
  for (const r of before.rows) {
    console.log(`  id=${r.id} position=${r.position} active=${r.is_active} len=${r.len}`);
  }

  // Update existing header (id=1)
  await client.execute({
    sql: "UPDATE ad_positions SET ad_code = ? WHERE id = 1",
    args: [headerIns],
  });
  console.log("\n✓ Updated header (id=1)");

  // Delete existing rows for positions we'll re-insert (clean slate)
  await client.execute("DELETE FROM ad_positions WHERE position IN ('sidebar', 'in_article', 'footer', 'auto_ads')");

  // Insert new rows
  const inserts = [
    { position: "sidebar", ad_code: sidebarIns, is_active: true },
    { position: "in_article", ad_code: inArticleIns, is_active: true },
    { position: "footer", ad_code: footerIns, is_active: true },
  ];

  for (const ins of inserts) {
    await client.execute({
      sql: "INSERT INTO ad_positions (position, ad_code, is_active) VALUES (?, ?, ?)",
      args: [ins.position, ins.ad_code, ins.is_active],
    });
    console.log(`✓ Inserted ${ins.position}`);
  }

  console.log("\n=== AFTER ===");
  const after = await client.execute("SELECT id, position, is_active, length(ad_code) as len, substr(ad_code, 1, 60) as preview FROM ad_positions ORDER BY id");
  for (const r of after.rows) {
    console.log(`  id=${r.id} position=${r.position} active=${r.is_active} len=${r.len}`);
    console.log(`    preview: ${r.preview}`);
  }

  client.close();
  console.log("\n✅ Database updated successfully");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
