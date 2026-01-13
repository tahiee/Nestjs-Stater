import { SessionOptions } from "express-session";
import { Express } from "express";

interface Options {
  sessionOptions: SessionOptions;
  isProduction: boolean;
  app: Express;
}

export const prepareProductionStance = ({
  app,
  isProduction,
  sessionOptions,
}: Options) => {
  if (isProduction) {
    app.set("trust proxy", 1);
    // sessionOptions.cookie!.sameSite = "strict";
    // sessionOptions.cookie!.domain = "*.beatfeedback.com";
    // For cross-origin requests (Vercel frontend to Railway backend),
    // we need sameSite: "none" and secure: true
    if (sessionOptions.cookie) {
      sessionOptions.cookie.sameSite = "none";
      sessionOptions.cookie.secure = true;
      // Don't set domain - let the browser handle it for cross-origin cookies
      // Setting domain can prevent cookies from being sent in cross-origin requests
      delete sessionOptions.cookie.domain;
    }
  }
};
