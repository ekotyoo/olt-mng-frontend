import { z } from "zod";

const envSchema = z.object({
    // Telnet Configuration
    OLT_HOST: z.string().min(1, "OLT_HOST is required"),
    OLT_PORT: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).optional().default("23"),
    OLT_USER: z.string().min(1, "OLT_USER is required"),
    OLT_PASS: z.string().min(1, "OLT_PASS is required"),

    // Auth Configuration
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters long"),

    // Node Environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables");
}

export const env = _env.data;
