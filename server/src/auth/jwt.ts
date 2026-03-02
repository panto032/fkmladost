import { config } from "../config.js";
import { createHmac } from "crypto";

export interface JwtPayload {
  sub: number; // user id
  username: string;
  role: "admin" | "editor";
  type: "access" | "refresh";
}

function base64url(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payload: object, secret: string, expiresIn: number): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresIn })
  );
  const sig = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verify(token: string, secret: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  if (sig !== expected) throw new Error("Invalid signature");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired");
  return payload as JwtPayload;
}

export function signAccessToken(payload: Omit<JwtPayload, "type" | "iat" | "exp">): string {
  return sign({ ...payload, type: "access" }, config.jwtSecret, 15 * 60); // 15 minutes
}

export function signRefreshToken(payload: Omit<JwtPayload, "type" | "iat" | "exp">): string {
  return sign({ ...payload, type: "refresh" }, config.jwtRefreshSecret, 7 * 24 * 60 * 60); // 7 days
}

export function verifyAccessToken(token: string): JwtPayload {
  return verify(token, config.jwtSecret);
}

export function verifyRefreshToken(token: string): JwtPayload {
  return verify(token, config.jwtRefreshSecret);
}
