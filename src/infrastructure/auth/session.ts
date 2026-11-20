import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "./constants";

const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Falta configurar ADMIN_SESSION_SECRET.");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminPassword(candidate: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return safeEquals(candidate, password);
}

export async function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `admin.${expiresAt}`;
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

export async function hasAdminSession() {
  try {
    const value = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    if (!value) return false;
    const [role, expiresAtString, signature] = value.split(".");
    if (role !== "admin" || !expiresAtString || !signature) return false;
    const payload = `${role}.${expiresAtString}`;
    return Number(expiresAtString) > Math.floor(Date.now() / 1000) && safeEquals(signature, sign(payload));
  } catch {
    return false;
  }
}
