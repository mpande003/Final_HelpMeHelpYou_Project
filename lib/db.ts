import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "cep.sqlite");

type DatabaseInstance = Database.Database;

declare global {
  var __cepDb__: DatabaseInstance | undefined;
}

function initializeDatabase(db: DatabaseInstance) {
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

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_username TEXT NOT NULL,
      action TEXT NOT NULL,
      target_username TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_logo TEXT,
      event_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      full_name TEXT,
      house_number TEXT,
      building_street_area TEXT,
      landmark TEXT,
      village_town_city TEXT,
      post_office TEXT,
      tehsil_taluka TEXT,
      district TEXT,
      state TEXT,
      pin_code TEXT,
      country TEXT NOT NULL DEFAULT 'India',
      map_link TEXT,
      partner_organizations TEXT,
      sponsor_contact_name TEXT,
      sponsor_phone TEXT,
      sponsor_email TEXT,
      expected_participants TEXT,
      actual_participants TEXT,
      beneficiaries TEXT,
      estimated_budget TEXT,
      actual_expenses TEXT,
      sponsor TEXT,
      status TEXT,
      marker_status TEXT NOT NULL DEFAULT 'active',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blood_donors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      event_name TEXT,
      donor_name TEXT NOT NULL,
      donor_phone TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      age TEXT,
      gender TEXT,
      address TEXT,
      donor_id_number TEXT,
      blood_bank_name TEXT NOT NULL,
      blood_bank_contact TEXT,
      donation_date TEXT,
      units_donated TEXT,
      relative_support_eligible INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blood_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER,
      donor_name TEXT,
      requester_name TEXT NOT NULL,
      requester_phone TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      relation_to_donor TEXT NOT NULL,
      hospital_name TEXT,
      blood_group_needed TEXT NOT NULL,
      units_required TEXT,
      urgency TEXT,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      fulfillment_status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      verified_by TEXT,
      verified_at TEXT,
      fulfilled_by TEXT,
      fulfilled_at TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      event_name TEXT,
      expense_title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      expense_date TEXT NOT NULL,
      payment_mode TEXT,
      status TEXT NOT NULL DEFAULT 'recorded',
      vendor_name TEXT,
      reference_number TEXT,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS beneficiaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      event_name TEXT,
      full_name TEXT NOT NULL,
      phone_number TEXT,
      age TEXT,
      gender TEXT,
      support_type TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

  `);

  const columns = db
    .prepare("PRAGMA table_info(users)")
    .all() as Array<{ name: string }>;
  const hasStatusColumn = columns.some((column) => column.name === "status");

  if (!hasStatusColumn) {
    db.exec(
      "ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';",
    );
  }

  const eventColumns = db
    .prepare("PRAGMA table_info(events)")
    .all() as Array<{ name: string }>;
  const hasMarkerStatusColumn = eventColumns.some(
    (column) => column.name === "marker_status",
  );

  if (!hasMarkerStatusColumn) {
    db.exec(
      "ALTER TABLE events ADD COLUMN marker_status TEXT NOT NULL DEFAULT 'active';",
    );
  }
}

export function getDb() {
  if (global.__cepDb__) {
    return global.__cepDb__;
  }

  const databasePath = process.env.DATABASE_PATH ?? DEFAULT_DB_PATH;
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  initializeDatabase(db);

  global.__cepDb__ = db;
  return db;
}
