import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { swaggerSpec } from "../config/swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = join(__dirname, "../../swagger.json");

writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf-8");

console.log(`[Swagger] OpenAPI spec written to ${outputPath}`);
