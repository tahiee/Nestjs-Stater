import { getDatabase } from "@/configs/connection.config";
import { users, verification } from "@/schemas/schema";
import { isCuid } from "@paralleldrive/cuid2";
import { verifyJwt } from "@/utils/common";
import type { Response } from "express";
import { eq } from "drizzle-orm";
import { log } from "./logger";

export const verifyCode = async <ReturnType = typeof users.$inferSelect>(
  code: string
) => {
  const isCodeValid = isCuid(code);

  if (!isCodeValid) throw new Error("invalid code");
  const db = await getDatabase();

  const verificationTable = await db.query.verification.findFirst({
    where: (t, { eq }) => eq(t.id, code),
  });

  if (!verificationTable) throw new Error("code expired");

  await db.delete(verification).where(eq(verification.id, code));
  return verifyJwt<ReturnType>(verificationTable.token);
};

export const resErrorHandler = (
  definition: keyof typeof HttpStatusCodeList,
  error: Error,
  res: Response,
  verbose = true
) => {
  verbose && log.error(error.message);
  return res
    .status(getHttpStatusCode(definition))
    .json({ message: error.message });
};

export const DEFAULT_MESSAGES = {
  insufficient_permission:
    "You do not have permission to perform this action. If you believe this is a mistake, please contact your administrator.",
  deactivated_account:
    "Your account has been permanently deactivated. As a result, you no longer have access to import playlists or create events. If you believe this is a mistake or need further assistance, please contact the administrator.",
  subscription_request: "Please subscribe to one of our plans.",
  subscription_exceeded:
    "You have reached your subscribtion limit, please upgrade your plan.",
  feedback_submission_isolation:
    "Dear admin, to maintain the integrity and credibility of your platform, it is important to avoid submitting testimonials on behalf of actual users. Engaging in such practices can undermine trust and lead to a significant loss of credibility, ultimately impacting user retention.",
  original_user_restriction:
    "The operation is restricted to use by the original user.",
};

export const getHttpStatusCode = (
  definition: keyof typeof HttpStatusCodeList
) => HttpStatusCodeList[definition];

export const HttpStatusCodeList = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  SWITCH_PROXY: 306,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  I_AM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
};
