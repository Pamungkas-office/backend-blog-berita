import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { seed } from "drizzle-seed";
import { users } from "./schema.js";
import "dotenv/config"; // Untuk membaca file .env
import bcrypt from "bcryptjs";

// 1. Inisialisasi client Turso DB
const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

// 2. Lakukan seeding (contoh menggunakan tabel 'users' dari skema Anda)
async function main() {
  console.log("🌱 Memulai seeding ke Turso DB...");

  // Gunakan callback parameter 'funcs' untuk mengakses generator bawaan
  await seed(db, { users }).refine((funcs) => ({
    users: {
      count: 1,
      columns: {
        id: funcs.default({ defaultValue: 1 }),
        name: funcs.default({ defaultValue: "Aji Pamungkas" }),
        email: funcs.default({ defaultValue: "ajipamungkasoffice7308@gmail.com"}),
        password: funcs.default({
          defaultValue: bcrypt.hashSync("password"),
        }),
        role: funcs.default({ defaultValue: "admin" }),
        created_at: funcs.default({ defaultValue: new Date().toISOString() }),
      },
    },
  }));

  console.log("✅ Seeding Turso DB selesai!");
  client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Gagal melakukan seeding:", err);
  process.exit(1);
});
