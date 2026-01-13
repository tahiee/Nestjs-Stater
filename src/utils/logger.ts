import pino, { TransportTargetOptions } from "pino";
import express from "express";

const isProduction = express().get("env") === "production";
const axiomTransport: TransportTargetOptions = {
  target: "@axiomhq/pino",
  options: {
    token: "xaat-f5df7e2e-49bf-477c-92c8-97fe3db9f4aa",
    dataset: "beatfeedback",
  },
};

const simpleTransport: TransportTargetOptions = {
  target: "pino-pretty",
  options: {
    colorize: true,
  },
};

export const log = pino({
  base: { pid: false },
  level: "info",
  transport: {
    targets: isProduction
      ? [simpleTransport, axiomTransport]
      : [simpleTransport],
  },
});
