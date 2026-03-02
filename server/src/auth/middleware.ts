import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken, type JwtPayload } from "./jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    request.user = verifyAccessToken(token);
  } catch {
    reply.code(401).send({ error: "Invalid or expired token" });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticate(request, reply);
  if (reply.sent) return;
  if (request.user?.role !== "admin") {
    reply.code(403).send({ error: "Admin access required" });
  }
}
