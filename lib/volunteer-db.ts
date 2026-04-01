import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import Database from "better-sqlite3";

import { getDb } from "./db";

const DEFAULT_VOLUNTEER_DB_PATH = path.join(
  process.cwd(),
  "data",
  "volunteers.sqlite",
);

type DatabaseInstance = Database.Database;

declare global {
  var __cepVolunteerDb__: DatabaseInstance | undefined;
}

function initializeVolunteerDatabase(db: DatabaseInstance) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      phone_number TEXT NOT NULL,
      email_address TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      house_flat_number TEXT,
      street_area_locality TEXT,
      landmark TEXT,
      village_town_city TEXT,
      district TEXT,
      state TEXT,
      pin_code TEXT,
      country TEXT NOT NULL DEFAULT 'India',
      id_type TEXT,
      id_number TEXT,
      id_proof_file TEXT,
      highest_education_level TEXT,
      field_of_study TEXT,
      college_school_name TEXT,
      current_occupation TEXT,
      areas_of_interest TEXT,
      skills TEXT,
      languages_known TEXT,
      available_days TEXT,
      available_time TEXT,
      hours_per_week TEXT,
      preferred_mode TEXT,
      previous_volunteer_experience TEXT,
      previous_organization_name TEXT,
      previous_work_description TEXT,
      motivation TEXT,
      special_skills_or_certifications TEXT,
      medical_conditions TEXT,
      profile_photo_file TEXT,
      resume_file TEXT,
      approval_status TEXT NOT NULL DEFAULT 'pending',
      approved_by TEXT,
      approved_at TEXT,
      assigned_event_id INTEGER,
      assigned_event_name TEXT,
      assigned_role TEXT,
      consent_terms INTEGER NOT NULL DEFAULT 0,
      consent_photos INTEGER NOT NULL DEFAULT 0,
      consent_policies INTEGER NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS volunteer_submission_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const columns = db
    .prepare("PRAGMA table_info(volunteers)")
    .all() as Array<{ name: string }>;
  const existingColumns = new Set(columns.map((column) => column.name));

  if (!existingColumns.has("approval_status")) {
    db.exec(
      "ALTER TABLE volunteers ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending';",
    );
  }

  if (!existingColumns.has("approved_by")) {
    db.exec("ALTER TABLE volunteers ADD COLUMN approved_by TEXT;");
  }

  if (!existingColumns.has("approved_at")) {
    db.exec("ALTER TABLE volunteers ADD COLUMN approved_at TEXT;");
  }

  if (!existingColumns.has("assigned_event_id")) {
    db.exec("ALTER TABLE volunteers ADD COLUMN assigned_event_id INTEGER;");
  }

  if (!existingColumns.has("assigned_event_name")) {
    db.exec("ALTER TABLE volunteers ADD COLUMN assigned_event_name TEXT;");
  }

  if (!existingColumns.has("assigned_role")) {
    db.exec("ALTER TABLE volunteers ADD COLUMN assigned_role TEXT;");
  }

  if (!existingColumns.has("updated_at")) {
    db.exec(
      "ALTER TABLE volunteers ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;",
    );
  }
}

export function buildVolunteerSubmissionKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function logVolunteerSubmissionAttempt(requesterKey: string) {
  const db = getVolunteerDb();
  db.prepare(
    "DELETE FROM volunteer_submission_attempts WHERE created_at < datetime('now', '-2 days')",
  ).run();
  db.prepare(
    `
      INSERT INTO volunteer_submission_attempts (requester_key)
      VALUES (?)
    `,
  ).run(requesterKey);
}

export function countRecentVolunteerSubmissionAttempts(
  requesterKey: string,
  windowMinutes: number,
) {
  const db = getVolunteerDb();
  const row = db
    .prepare(
      `
        SELECT COUNT(*) as count
        FROM volunteer_submission_attempts
        WHERE requester_key = ?
          AND created_at >= datetime('now', ?)
      `,
    )
    .get(requesterKey, `-${windowMinutes} minutes`) as { count: number };

  return row.count;
}

export function hasRecentVolunteerDuplicate(input: {
  phoneNumber: string;
  emailAddress?: string | null;
  createdBy: string;
  windowHours: number;
}) {
  const db = getVolunteerDb();
  const phoneRow = db
    .prepare(
      `
        SELECT id
        FROM volunteers
        WHERE phone_number = ?
          AND created_by = ?
          AND created_at >= datetime('now', ?)
        LIMIT 1
      `,
    )
    .get(
      input.phoneNumber,
      input.createdBy,
      `-${input.windowHours} hours`,
    ) as { id: number } | undefined;

  if (phoneRow) {
    return true;
  }

  if (!input.emailAddress) {
    return false;
  }

  const emailRow = db
    .prepare(
      `
        SELECT id
        FROM volunteers
        WHERE email_address = ?
          AND created_by = ?
          AND created_at >= datetime('now', ?)
        LIMIT 1
      `,
    )
    .get(
      input.emailAddress,
      input.createdBy,
      `-${input.windowHours} hours`,
    ) as { id: number } | undefined;

  return Boolean(emailRow);
}

function migrateExistingVolunteerData(db: DatabaseInstance) {
  const volunteerCount = db
    .prepare("SELECT COUNT(*) as count FROM volunteers")
    .get() as { count: number };

  if (volunteerCount.count > 0) {
    return;
  }

  const mainDb = getDb();
  const tables = mainDb
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'volunteers'",
    )
    .all() as Array<{ name: string }>;

  if (tables.length === 0) {
    return;
  }

  const mainColumns = mainDb
    .prepare("PRAGMA table_info(volunteers)")
    .all() as Array<{ name: string }>;
  const existingMainColumns = new Set(mainColumns.map((column) => column.name));

  const selectOrDefault = (columnName: string, fallbackSql: string) =>
    existingMainColumns.has(columnName)
      ? columnName
      : `${fallbackSql} AS ${columnName}`;

  const existingRows = mainDb
    .prepare(
      `
        SELECT
          full_name, date_of_birth, gender, phone_number, email_address,
          emergency_contact_name, emergency_contact_phone, house_flat_number,
          street_area_locality, landmark, village_town_city, district, state,
          pin_code, country, id_type, id_number, id_proof_file,
          highest_education_level, field_of_study, college_school_name,
          current_occupation, areas_of_interest, skills, languages_known,
          available_days, available_time, hours_per_week, preferred_mode,
          previous_volunteer_experience, previous_organization_name,
          previous_work_description, motivation,
          special_skills_or_certifications, medical_conditions,
          profile_photo_file, resume_file,
          ${selectOrDefault("approval_status", "'pending'")},
          ${selectOrDefault("approved_by", "NULL")},
          ${selectOrDefault("approved_at", "NULL")},
          ${selectOrDefault("assigned_event_id", "NULL")},
          ${selectOrDefault("assigned_event_name", "NULL")},
          ${selectOrDefault("assigned_role", "NULL")},
          consent_terms, consent_photos, consent_policies, created_by,
          created_at, ${selectOrDefault("updated_at", "created_at")}
        FROM volunteers
        ORDER BY id ASC
      `,
    )
    .all() as Array<Record<string, unknown>>;

  if (existingRows.length === 0) {
    return;
  }

  const insertVolunteer = db.prepare(`
    INSERT INTO volunteers (
      full_name, date_of_birth, gender, phone_number, email_address,
      emergency_contact_name, emergency_contact_phone, house_flat_number,
      street_area_locality, landmark, village_town_city, district, state,
      pin_code, country, id_type, id_number, id_proof_file,
      highest_education_level, field_of_study, college_school_name,
      current_occupation, areas_of_interest, skills, languages_known,
      available_days, available_time, hours_per_week, preferred_mode,
      previous_volunteer_experience, previous_organization_name,
      previous_work_description, motivation,
      special_skills_or_certifications, medical_conditions,
      profile_photo_file, resume_file, approval_status, approved_by,
      approved_at, assigned_event_id, assigned_event_name, assigned_role,
      consent_terms, consent_photos, consent_policies, created_by,
      created_at, updated_at
    ) VALUES (
      @full_name, @date_of_birth, @gender, @phone_number, @email_address,
      @emergency_contact_name, @emergency_contact_phone, @house_flat_number,
      @street_area_locality, @landmark, @village_town_city, @district, @state,
      @pin_code, @country, @id_type, @id_number, @id_proof_file,
      @highest_education_level, @field_of_study, @college_school_name,
      @current_occupation, @areas_of_interest, @skills, @languages_known,
      @available_days, @available_time, @hours_per_week, @preferred_mode,
      @previous_volunteer_experience, @previous_organization_name,
      @previous_work_description, @motivation,
      @special_skills_or_certifications, @medical_conditions,
      @profile_photo_file, @resume_file, @approval_status, @approved_by,
      @approved_at, @assigned_event_id, @assigned_event_name, @assigned_role,
      @consent_terms, @consent_photos, @consent_policies, @created_by,
      @created_at, @updated_at
    )
  `);

  const transaction = db.transaction((rows: Array<Record<string, unknown>>) => {
    for (const row of rows) {
      insertVolunteer.run(row);
    }
  });

  transaction(existingRows);
}

export function getVolunteerDb() {
  if (global.__cepVolunteerDb__) {
    return global.__cepVolunteerDb__;
  }

  const databasePath =
    process.env.VOLUNTEER_DATABASE_PATH ?? DEFAULT_VOLUNTEER_DB_PATH;
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  initializeVolunteerDatabase(db);
  migrateExistingVolunteerData(db);

  global.__cepVolunteerDb__ = db;
  return db;
}
