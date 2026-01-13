import { dbConfig } from "./connection.config";
import session from "express-session";

// Use MemoryStore if database is not available, otherwise use MySQLStore
let store: session.Store;

if (dbConfig) {
  // Database available - use MySQLStore
  const MySQLStore = require("express-mysql-session")(session);
  store = new MySQLStore({
    checkExpirationInterval: 10 * 60 * 1000,
    createDatabaseTable: false,
    clearExpired: true,
    ...dbConfig,
  });

  // Add error handling for session store to prevent crashes
  store.on("error", (error: Error) => {
    // Log session store errors but don't crash the app
    console.error("Session store error:", error);
    // Session errors shouldn't block request processing
  });
} else {
  // No database - use MemoryStore (in-memory, lost on restart)
  const MemoryStore = require("memorystore")(session);
  store = new MemoryStore({
    checkPeriod: 86400000, // Prune expired entries every 24h
  });
  console.warn(
    "⚠️  Running without database - using MemoryStore for sessions (sessions will be lost on restart)"
  );
}

export { store };
