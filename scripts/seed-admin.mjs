import fs from "node:fs";
import path from "node:path";

import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const databasePath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "cep.sqlite");
const username = process.env.SEED_ADMIN_USERNAME || "admin";
const password = process.env.SEED_ADMIN_PASSWORD || "admin123@";
const role = process.env.SEED_ADMIN_ROLE || "admin";

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const passwordHash = bcrypt.hashSync(password, 10);
const existingUser = db
  .prepare("SELECT id FROM users WHERE username = ?")
  .get(username);

if (existingUser) {
  db.prepare(
    `
      UPDATE users
      SET password_hash = ?,
          role = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `,
  ).run(passwordHash, role, username);
  console.log(`Updated user "${username}" in ${databasePath}`);
} else {
  db.prepare(
    `
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, ?)
    `,
  ).run(username, passwordHash, role);
  console.log(`Created user "${username}" in ${databasePath}`);
}

db.close();
