import { SessionOptions } from "express-session";
import { store } from "./store.config";

export const sessionOptions: SessionOptions = {
  name: "connect.sid", // Explicit cookie name (default for express-session)
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, // Prevent XSS attacks
    // sameSite and secure will be set in production via prepareProductionStance
  },
  secret: process.env.COOKIE_SECRET!,
  saveUninitialized: false,
  resave: false,
  store: store,
};
