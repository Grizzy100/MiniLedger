import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(3000),

  // Runtime connection (pooled Neon URL).
  DATABASE_URL: z.string().min(10),

  // Prisma CLI migrations (direct Neon URL).
  DIRECT_URL: z.string().min(10),

  // Used by integration tests in Phase B5.
  TEST_DATABASE_URL: z.string().optional(),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  OTP_SECRET: z
    .string()
    .min(32, "OTP_SECRET must be at least 32 characters"),
  OTP_TTL_SECONDS: z.coerce.number().default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  OTP_RESEND_SECONDS: z.coerce.number().default(30),

  APP_TIMEZONE: z.string().default("Asia/Kolkata"),
  CORS_ORIGIN: z.string().default("*"),

  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_RECEIPT_BYTES: z.coerce.number().default(5_242_880),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Server cannot start — fix these environment variables:\n"
  );

  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join(".")} — ${issue.message}`);
  }

  process.exit(1);
}

export const env = result.data;