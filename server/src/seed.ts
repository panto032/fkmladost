/**
 * Seed script: creates initial admin and editor users.
 * Run once after first deployment: pnpm db:seed
 */
import { db } from "./db.js";
import bcrypt from "bcryptjs";

const users = [
  {
    username: "admin",
    password: "admin123",  // CHANGE THIS after first login!
    name: "Administrator",
    email: "admin@fkmladost.rs",
    role: "admin" as const,
  },
  {
    username: "editor",
    password: "editor123", // CHANGE THIS after first login!
    name: "Editor",
    email: "editor@fkmladost.rs",
    role: "editor" as const,
  },
];

for (const u of users) {
  const existing = await db.user.findUnique({ where: { username: u.username } });
  if (existing) {
    console.log(`User '${u.username}' already exists, skipping.`);
    continue;
  }
  const passwordHash = await bcrypt.hash(u.password, 12);
  await db.user.create({
    data: {
      username: u.username,
      passwordHash,
      name: u.name,
      email: u.email,
      role: u.role,
    },
  });
  console.log(`Created user: ${u.username} (${u.role})`);
}

console.log("Seed complete.");
process.exit(0);
