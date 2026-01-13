import { MySql2Database, drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql, { type PoolOptions } from "mysql2";
import * as schema from "@/schemas/schema";
import { env } from "@/utils/env";
import { config } from "dotenv";
config();

export const database = async (logger = false) => {
  if (!connection) {
    return null;
  }
  const db = drizzle(connection, {
    mode: "default",
    schema,
    logger,
  });

  return db;
};

/**
 * Get database instance - throws error if database is not available
 * Use this instead of database() when you need guaranteed non-null db
 * This avoids having to use db! everywhere
 */
export const getDatabase = async (logger = false) => {
  const db = await database(logger);
  if (!db) {
    throw new Error(
      "Database is not available. Please set MYSQL_CONNECTION_URL environment variable."
    );
  }
  return db;
};

// Parse MySQL connection URL into individual components
// mysql2 doesn't support 'uri' property, so we need to parse it
const parseMySQLUrl = (url: string): PoolOptions => {
  // Handle empty or missing URL
  if (!url || url.trim() === "") {
    throw new Error("MySQL connection URL is empty");
  }
  // Check if URL contains template variables (CI/CD placeholders)
  if (url.includes("${{") || url.includes("${")) {
    // Try to use individual environment variables as fallback
    // Detect local development (not on Railway)
    const isLocalDev =
      process.env.NODE_ENV !== "production" && !process.env.RAILWAY_ENVIRONMENT;
    let host = process.env.MYSQL_HOST || process.env.host;

    // Override Railway internal hostnames for local development
    if (
      isLocalDev &&
      host &&
      (host.includes("railway.internal") || host.includes("railway.app"))
    ) {
      host = process.env.MYSQL_LOCAL_HOST || "localhost";
    }

    // If no host found, use localhost for local dev
    if (!host && isLocalDev) {
      host = "localhost";
    }

    const user = process.env.MYSQL_USER || process.env.user;
    let password = process.env.MYSQL_PASSWORD || process.env.password;
    const database = process.env.MYSQL_DATABASE || process.env.database;
    const port = process.env.MYSQL_PORT || process.env.dbport || "3306";

    // For local XAMPP, always use empty password (XAMPP default has no password)
    // Override Railway password for local development
    if (isLocalDev) {
      password =
        process.env.MYSQL_LOCAL_PASSWORD !== undefined
          ? process.env.MYSQL_LOCAL_PASSWORD
          : ""; // Default to empty for XAMPP
    }

    if (host && user && database) {
      return {
        host: host.replace(/^"|"$/g, ""),
        port: parseInt(port.toString().replace(/^"|"$/g, ""), 10),
        user: user.replace(/^"|"$/g, ""),
        password: password ? password.replace(/^"|"$/g, "") : "",
        database: database.replace(/^"|"$/g, ""),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      };
    }

    throw new Error(
      `MySQL connection URL contains unresolved template variables: ${url}\n` +
        `Please set MYSQL_CONNECTION_URL or individual MySQL variables.`
    );
  }

  try {
    const parsedUrl = new URL(url);

    // Validate that it's a mysql:// or mysql2:// URL
    if (!["mysql:", "mysql2:"].includes(parsedUrl.protocol)) {
      throw new Error(
        `Invalid protocol. Expected mysql:// or mysql2://, got ${parsedUrl.protocol}`
      );
    }

    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
      user: parsedUrl.username,
      password: parsedUrl.password,
      database: parsedUrl.pathname.replace(/^\//, ""), // Remove leading slash
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
  } catch (error) {
    // If URL parsing fails, try individual variables as fallback
    // Detect local development (not on Railway)
    const isLocalDev =
      process.env.NODE_ENV !== "production" && !process.env.RAILWAY_ENVIRONMENT;
    let host = process.env.MYSQL_HOST || process.env.host;

    // Override Railway internal hostnames for local development
    if (
      isLocalDev &&
      host &&
      (host.includes("railway.internal") || host.includes("railway.app"))
    ) {
      host = process.env.MYSQL_LOCAL_HOST || "localhost";
    }

    // If no host found, use localhost for local dev
    if (!host && isLocalDev) {
      host = "localhost";
    }

    const user = process.env.MYSQL_USER || process.env.user;
    let password = process.env.MYSQL_PASSWORD || process.env.password;
    const database = process.env.MYSQL_DATABASE || process.env.database;
    const port = process.env.MYSQL_PORT || process.env.dbport || "3306";

    // For local XAMPP, always use empty password (XAMPP default has no password)
    // Override Railway password for local development
    if (isLocalDev) {
      password =
        process.env.MYSQL_LOCAL_PASSWORD !== undefined
          ? process.env.MYSQL_LOCAL_PASSWORD
          : ""; // Default to empty for XAMPP
    }

    if (host && user && database) {
      return {
        host: host.replace(/^"|"$/g, ""),
        port: parseInt(port.toString().replace(/^"|"$/g, ""), 10),
        user: user.replace(/^"|"$/g, ""),
        password: password ? password.replace(/^"|"$/g, "") : "",
        database: database.replace(/^"|"$/g, ""),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      };
    }

    throw new Error(
      `Invalid MySQL connection URL format: "${url}". ` +
        `Expected format: mysql://user:password@host:port/database`
    );
  }
};

// Make database connection optional - allow running without DB
export const dbConfig: PoolOptions | undefined = env.MYSQL_CONNECTION_URL
  ? parseMySQLUrl(env.MYSQL_CONNECTION_URL)
  : undefined;

export const connection = dbConfig ? mysql.createPool(dbConfig) : undefined;

export const migrateSchema = async (
  db: MySql2Database<Record<string, unknown>>
) => await migrate(db, { migrationsFolder: "drizzle" });
