const dotenv = require("dotenv");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { z } = require("zod");

// Prefer .env, but allow local development to run with .env.example
// when the developer hasn't created a .env yet.
const envPath = path.resolve(process.cwd(), ".env");
const envExamplePath = path.resolve(process.cwd(), ".env.example");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (process.env.NODE_ENV !== "production" && fs.existsSync(envExamplePath)) {
  dotenv.config({ path: envExamplePath });
} else {
  dotenv.config();
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    PORT: z.coerce.number().int().positive().default(5000),

    // In production this is required; in development we default it below so the server can boot.
    MONGODB_URI: z.string().min(1).optional(),

    JWT_ACCESS_SECRET: z.string().min(1).optional(),
    JWT_REFRESH_SECRET: z.string().min(1).optional(),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(20).default(12),

    // LLM provider (Groq). Optional in development so you can start the backend
    // without configuring the API key.
    GROQ_API_KEY: z.string().min(1).optional(),
    GROQ_MODEL: z.string().optional(),

    // Backward compatibility (deprecated): previously used Gemini env vars.
    GEMINI_API_KEY: z.string().min(1).optional(),
    GEMINI_MODEL: z.string().optional(),

    CLIENT_ORIGIN: z.string().optional(),

    FILE_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024), // 10MB
    FILE_ALLOWED_MIMETYPES: z.string().optional().default(
      ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].join(",")
    ),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV !== "production") return;

    const requiredInProd = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "GROQ_API_KEY"];
    for (const key of requiredInProd) {
      if (!val[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required in production`,
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

const randomSecret = () => crypto.randomBytes(32).toString("hex");

const env = {
  ...parsed.data,
  MONGODB_URI: parsed.data.MONGODB_URI || "mongodb://127.0.0.1:27017/resumeanalyser",
  JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET || randomSecret(),
  JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET || randomSecret(),
  // Keep empty/undefined to mean "disabled".
  GROQ_API_KEY: parsed.data.GROQ_API_KEY || parsed.data.GEMINI_API_KEY || undefined,
  GROQ_MODEL: parsed.data.GROQ_MODEL || parsed.data.GEMINI_MODEL || "llama-3.1-8b-instant",
  // Deprecated compatibility values.
  GEMINI_API_KEY: parsed.data.GEMINI_API_KEY || undefined,
  GEMINI_MODEL: parsed.data.GEMINI_MODEL || undefined,
};

env.FILE_ALLOWED_MIMETYPES = env.FILE_ALLOWED_MIMETYPES
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

module.exports = env;

