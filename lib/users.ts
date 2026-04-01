import { getDb } from "./db";

export type AppUser = {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuditLogEntry = {
  id: number;
  actorUsername: string;
  action: string;
  targetUsername: string;
  details: string | null;
  createdAt: string;
};

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  status: string;
};

export function getUserByUsername(username: string): AppUser | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT id, username, password_hash, role, status FROM users WHERE username = ?",
    )
    .get(username) as UserRow | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
  };
}

type UserListRow = {
  id: number;
  username: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export function listUsers() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, username, role, created_at, updated_at
        , status
        FROM users
        ORDER BY username ASC
      `,
    )
    .all() as UserListRow[];

  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function createUser(input: {
  username: string;
  passwordHash: string;
  role: string;
}) {
  const db = getDb();

  return db
    .prepare(
      `
        INSERT INTO users (username, password_hash, role, status)
        VALUES (?, ?, ?, 'active')
      `,
    )
    .run(input.username, input.passwordHash, input.role);
}

export function resetUserPassword(input: {
  username: string;
  passwordHash: string;
}) {
  const db = getDb();

  return db
    .prepare(
      `
        UPDATE users
        SET password_hash = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE username = ?
      `,
    )
    .run(input.passwordHash, input.username);
}

export function updateUserStatus(input: {
  username: string;
  status: "active" | "inactive";
}) {
  const db = getDb();

  return db
    .prepare(
      `
        UPDATE users
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE username = ?
      `,
    )
    .run(input.status, input.username);
}

export function deleteUser(username: string) {
  const db = getDb();

  return db.prepare("DELETE FROM users WHERE username = ?").run(username);
}

type AuditLogRow = {
  id: number;
  actor_username: string;
  action: string;
  target_username: string;
  details: string | null;
  created_at: string;
};

export function createAuditLog(input: {
  actorUsername: string;
  action: string;
  targetUsername: string;
  details?: string;
}) {
  const db = getDb();

  return db
    .prepare(
      `
        INSERT INTO audit_logs (actor_username, action, target_username, details)
        VALUES (?, ?, ?, ?)
      `,
    )
    .run(
      input.actorUsername,
      input.action,
      input.targetUsername,
      input.details ?? null,
    );
}

export function listAuditLogs(limit = 25): AuditLogEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, actor_username, action, target_username, details, created_at
        FROM audit_logs
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `,
    )
    .all(limit) as AuditLogRow[];

  return rows.map((row) => ({
    id: row.id,
    actorUsername: row.actor_username,
    action: row.action,
    targetUsername: row.target_username,
    details: row.details,
    createdAt: row.created_at,
  }));
}
