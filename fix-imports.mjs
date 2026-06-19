// fix-imports.mjs
// Jalankan: node fix-imports.mjs           -> dry run (cuma preview, tidak ubah file)
// Jalankan: node fix-imports.mjs --write   -> benar-benar menulis perubahan ke file

import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";

const SRC_DIR = "src";
const WRITE = process.argv.includes("--write");

// regex untuk menangkap: import ... from "RELATIVE_PATH"  atau  import ... from 'RELATIVE_PATH'
// hanya path yang diawali ./ atau ../
const importRegex = /from\s+(['"])(\.\.?\/[^'"]*)\1/g;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (extname(entry) === ".ts") {
      files.push(full);
    }
  }
  return files;
}

function fixPath(p) {
  if (p.endsWith(".ts")) {
    return p.slice(0, -3) + ".js";
  }
  if (p.endsWith(".js")) {
    return p; // sudah benar, jangan diubah
  }
  // tidak ada ekstensi sama sekali -> tambahkan .js
  return p + ".js";
}

const files = walk(SRC_DIR);
let totalChanges = 0;
const changesPerFile = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  let changedInFile = 0;

  const newContent = content.replace(importRegex, (match, quote, path) => {
    const fixed = fixPath(path);
    if (fixed !== path) {
      changedInFile++;
      return `from ${quote}${fixed}${quote}`;
    }
    return match;
  });

  if (changedInFile > 0) {
    changesPerFile.push({ file, count: changedInFile });
    totalChanges += changedInFile;
    if (WRITE) {
      writeFileSync(file, newContent, "utf8");
    }
  }
}

console.log(`Mode: ${WRITE ? "WRITE (file diubah)" : "DRY RUN (preview saja)"}`);
console.log(`Total file terdampak: ${changesPerFile.length}`);
console.log(`Total baris import diperbaiki: ${totalChanges}`);
console.log("");
for (const { file, count } of changesPerFile) {
  console.log(`  ${file}  (${count} import diperbaiki)`);
}

if (!WRITE) {
  console.log("\nIni masih DRY RUN, belum ada file yang diubah.");
  console.log("Kalau hasil di atas sudah sesuai ekspektasi, jalankan ulang dengan:");
  console.log("  node fix-imports.mjs --write");
}
