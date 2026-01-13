import { database, migrateSchema } from "@/configs/connection.config";
import { log } from "./logger";

/**
 * @param boolean
 * Make sure to pass true before pushing it to production.
 */

export const prepareMigration = async (enableMigration = false) => {
  if (!enableMigration) return null;
  try {
    const db = await database();
    if (!db) {
      log.warn("Database not available - skipping migration");
      return null;
    }
    await migrateSchema(db);
    log.info("migration successful.");
  } catch (e) {
    const error = e as Error;
    log.error(`migration failure: ${error.message}`);
  }
};
