import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export const ROUNDS_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type RoundsSessionToken = { token: string; tokenHash: string; expiresAt: Date };

export async function hashRoundsPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyRoundsPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, digest] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !digest) return false;
  const derived = await scrypt(password, salt, KEY_LENGTH) as Buffer;
  const expected = Buffer.from(digest, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function newRoundsSession(now = new Date()): RoundsSessionToken {
  const token = randomBytes(48).toString("base64url");
  return { token, tokenHash: hashRoundsSessionToken(token), expiresAt: new Date(now.getTime() + ROUNDS_SESSION_TTL_MS) };
}

export function hashRoundsSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
