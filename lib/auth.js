import crypto from "crypto";

export const SESSION_COOKIE_NAME = "cm_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env.local and fill it in."
    );
  }
  return secret;
}

function sign(expiresAt) {
  return crypto.createHmac("sha256", getSecret()).update(String(expiresAt)).digest("hex");
}

export function createSessionCookieValue() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSessionValue(value) {
  if (!value || typeof value !== "string") return false;
  const [expiresAtStr, signature] = value.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || !signature) return false;
  if (Date.now() > expiresAt) return false;

  const expected = sign(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Copy .env.example to .env.local and fill it in."
    );
  }
  if (typeof password !== "string" || password.length === 0) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
