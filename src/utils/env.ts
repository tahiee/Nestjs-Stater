import { config } from "dotenv";
import { log } from "./logger";
import { z } from "zod";
config();

const schemaObject = z.object({
  UPSTASH_VECTOR_REST_TOKEN: z.string(),
  BREAVO_NEWSLETTER_LIST_ID: z.string(),
  UPSTASH_VECTOR_REST_URL: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  MYSQL_CONNECTION_URL: z.string().optional(),
  CLOUDINARY_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  BACKEND_DOMAIN: z.string(),
  CLIENT_DOMAIN: z.string(),
  COOKIE_SECRET: z.string(),
  STRIPE_SECRET: z.string(),
  BREVO_API_KEY: z.string(),
  JWT_SECRET: z.string(),
  SOUNDIIZ_API_KEY: z.string().optional(), // Soundiiz API key (optional for now)
  DEEZER_APP_ID: z.string().optional(), // Deezer App ID (optional for now)
  DEEZER_SECRET_KEY: z.string().optional(), // Deezer Secret Key (optional for now)
  database: z.string(),
});

const envSchema = schemaObject.safeParse(process.env);

if (!envSchema.success) {
  const message = `Invalid environment variables: ${JSON.stringify(
    envSchema.error.format(),
    null,
    4
  )}`;

  log.error(message);
  throw new Error(message);
}

export const env = envSchema.data;
