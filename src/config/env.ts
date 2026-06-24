export function validateEnv() {
  const requiredVars = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
    "FRONTEND_URL",
  ] as const;

  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Environment variables missing: ${missing.join(", ")}. ` +
        "Set them in .env or in your hosting dashboard."
    );
  }

  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== "development" && nodeEnv !== "production") {
    console.warn(
      `[WARN] NODE_ENV is "${nodeEnv}", expected "development" or "production". Defaulting to "development".`
    );
    process.env.NODE_ENV = "development";
  }
}

export function getCorsOrigins(): string[] {
  const isDev = process.env.NODE_ENV !== "production";
  const origins = isDev
    ? ["http://localhost:5173", "http://localhost:3000"]
    : [process.env.FRONTEND_URL!];

  return origins;
}
