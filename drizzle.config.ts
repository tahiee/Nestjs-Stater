import { defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env";

export default defineConfig({
  dbCredentials: { url: env.MYSQL_CONNECTION_URL },
  schema: "./src/schemas/*",
  dialect: "mysql",
  out: "drizzle",
});
