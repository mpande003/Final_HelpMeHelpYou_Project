import { getDb } from "./db";

export type Beneficiary = {
  id: number;
  eventId: number | null;
  eventName: string | null;
  fullName: string;
  phoneNumber: string | null;
  age: string | null;
  gender: string | null;
  supportType: string;
  location: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type BeneficiaryRow = {
  id: number;
  event_id: number | null;
  event_name: string | null;
  full_name: string;
  phone_number: string | null;
  age: string | null;
  gender: string | null;
  support_type: string;
  location: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function ensureBeneficiariesTable() {
  const db = getDb();

  db.exec(`
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

  return db;
}

function mapBeneficiary(row: BeneficiaryRow): Beneficiary {
  return {
    id: row.id,
    eventId: row.event_id,
    eventName: row.event_name,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    age: row.age,
    gender: row.gender,
    supportType: row.support_type,
    location: row.location,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listBeneficiaries(): Beneficiary[] {
  const db = ensureBeneficiariesTable();
  const rows = db
    .prepare(
      `
        SELECT
          id, event_id, event_name, full_name, phone_number, age, gender,
          support_type, location, notes, created_by, created_at, updated_at
        FROM beneficiaries
        ORDER BY created_at DESC, id DESC
      `,
    )
    .all() as BeneficiaryRow[];

  return rows.map(mapBeneficiary);
}

export function createBeneficiary(
  input: Omit<Beneficiary, "id" | "createdAt" | "updatedAt">,
) {
  const db = ensureBeneficiariesTable();

  return db
    .prepare(
      `
        INSERT INTO beneficiaries (
          event_id, event_name, full_name, phone_number, age, gender,
          support_type, location, notes, created_by
        ) VALUES (
          @eventId, @eventName, @fullName, @phoneNumber, @age, @gender,
          @supportType, @location, @notes, @createdBy
        )
      `,
    )
    .run(input);
}

export function updateBeneficiary(
  input: Omit<Beneficiary, "createdAt" | "updatedAt" | "createdBy">,
) {
  const db = ensureBeneficiariesTable();

  return db
    .prepare(
      `
        UPDATE beneficiaries
        SET event_id = @eventId,
            event_name = @eventName,
            full_name = @fullName,
            phone_number = @phoneNumber,
            age = @age,
            gender = @gender,
            support_type = @supportType,
            location = @location,
            notes = @notes,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `,
    )
    .run(input);
}

export function deleteBeneficiary(beneficiaryId: number) {
  const db = ensureBeneficiariesTable();
  return db.prepare("DELETE FROM beneficiaries WHERE id = ?").run(beneficiaryId);
}
