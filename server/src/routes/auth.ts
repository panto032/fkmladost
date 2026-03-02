import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../auth/jwt.js";
import { authenticate } from "../auth/middleware.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const { username, password } = request.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      return reply.code(400).send({ error: "Username and password required" });
    }

    const user = await db.user.findUnique({ where: { username } });
    if (!user) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role },
    };
  });

  app.post("/refresh", async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    if (!refreshToken) {
      return reply.code(400).send({ error: "Refresh token required" });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await db.user.findUnique({ where: { id: payload.sub } });
      if (!user) return reply.code(401).send({ error: "User not found" });

      const newPayload = { sub: user.id, username: user.username, role: user.role };
      return {
        accessToken: signAccessToken(newPayload),
        refreshToken: signRefreshToken(newPayload),
      };
    } catch {
      return reply.code(401).send({ error: "Invalid refresh token" });
    }
  });

  app.get("/me", { preHandler: authenticate }, async (request) => {
    const user = await db.user.findUnique({
      where: { id: request.user!.sub },
      select: { id: true, username: true, name: true, email: true, role: true },
    });
    return user;
  });

  app.put("/me/password", { preHandler: authenticate }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body as {
      currentPassword: string;
      newPassword: string;
    };

    const user = await db.user.findUnique({ where: { id: request.user!.sub } });
    if (!user) return reply.code(404).send({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return reply.code(401).send({ error: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });
    return { success: true };
  });
}
