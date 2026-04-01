import { getDb } from "./db";

export type BloodDonor = {
  id: number;
  eventId: number | null;
  eventName: string | null;
  donorName: string;
  donorPhone: string;
  bloodGroup: string;
  age: string | null;
  gender: string | null;
  address: string | null;
  donorIdNumber: string | null;
  bloodBankName: string;
  bloodBankContact: string | null;
  donationDate: string | null;
  unitsDonated: string | null;
  relativeSupportEligible: boolean;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type BloodRequest = {
  id: number;
  donorId: number | null;
  donorName: string | null;
  requesterName: string;
  requesterPhone: string;
  patientName: string;
  relationToDonor: string;
  hospitalName: string | null;
  bloodGroupNeeded: string;
  unitsRequired: string | null;
  urgency: string | null;
  verificationStatus: "pending" | "verified";
  fulfillmentStatus: "pending" | "fulfilled";
  notes: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  fulfilledBy: string | null;
  fulfilledAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type BloodDonorRow = {
  id: number;
  event_id: number | null;
  event_name: string | null;
  donor_name: string;
  donor_phone: string;
  blood_group: string;
  age: string | null;
  gender: string | null;
  address: string | null;
  donor_id_number: string | null;
  blood_bank_name: string;
  blood_bank_contact: string | null;
  donation_date: string | null;
  units_donated: string | null;
  relative_support_eligible: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type BloodRequestRow = {
  id: number;
  donor_id: number | null;
  donor_name: string | null;
  requester_name: string;
  requester_phone: string;
  patient_name: string;
  relation_to_donor: string;
  hospital_name: string | null;
  blood_group_needed: string;
  units_required: string | null;
  urgency: string | null;
  verification_status: "pending" | "verified";
  fulfillment_status: "pending" | "fulfilled";
  notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  fulfilled_by: string | null;
  fulfilled_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function ensureBloodTables() {
  const db = getDb();

  db.exec(`
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
  `);

  return db;
}

function mapBloodDonor(row: BloodDonorRow): BloodDonor {
  return {
    id: row.id,
    eventId: row.event_id,
    eventName: row.event_name,
    donorName: row.donor_name,
    donorPhone: row.donor_phone,
    bloodGroup: row.blood_group,
    age: row.age,
    gender: row.gender,
    address: row.address,
    donorIdNumber: row.donor_id_number,
    bloodBankName: row.blood_bank_name,
    bloodBankContact: row.blood_bank_contact,
    donationDate: row.donation_date,
    unitsDonated: row.units_donated,
    relativeSupportEligible: Boolean(row.relative_support_eligible),
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBloodRequest(row: BloodRequestRow): BloodRequest {
  return {
    id: row.id,
    donorId: row.donor_id,
    donorName: row.donor_name,
    requesterName: row.requester_name,
    requesterPhone: row.requester_phone,
    patientName: row.patient_name,
    relationToDonor: row.relation_to_donor,
    hospitalName: row.hospital_name,
    bloodGroupNeeded: row.blood_group_needed,
    unitsRequired: row.units_required,
    urgency: row.urgency,
    verificationStatus: row.verification_status,
    fulfillmentStatus: row.fulfillment_status,
    notes: row.notes,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    fulfilledBy: row.fulfilled_by,
    fulfilledAt: row.fulfilled_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createBloodDonor(
  input: Omit<BloodDonor, "id" | "createdAt" | "updatedAt">,
) {
  const db = ensureBloodTables();

  return db
    .prepare(
      `
        INSERT INTO blood_donors (
          event_id, event_name, donor_name, donor_phone, blood_group, age,
          gender, address, donor_id_number, blood_bank_name, blood_bank_contact,
          donation_date, units_donated, relative_support_eligible, notes, created_by
        ) VALUES (
          @eventId, @eventName, @donorName, @donorPhone, @bloodGroup, @age,
          @gender, @address, @donorIdNumber, @bloodBankName, @bloodBankContact,
          @donationDate, @unitsDonated, @relativeSupportEligible, @notes, @createdBy
        )
      `,
    )
    .run({
      ...input,
      relativeSupportEligible: input.relativeSupportEligible ? 1 : 0,
    });
}

export function listBloodDonors(): BloodDonor[] {
  const db = ensureBloodTables();
  const rows = db
    .prepare(
      `
        SELECT
          id, event_id, event_name, donor_name, donor_phone, blood_group, age,
          gender, address, donor_id_number, blood_bank_name, blood_bank_contact,
          donation_date, units_donated, relative_support_eligible, notes,
          created_by, created_at, updated_at
        FROM blood_donors
        ORDER BY created_at DESC, id DESC
      `,
    )
    .all() as BloodDonorRow[];

  return rows.map(mapBloodDonor);
}

export function updateBloodDonor(
  input: Omit<BloodDonor, "createdAt" | "updatedAt" | "createdBy">,
) {
  const db = ensureBloodTables();

  return db
    .prepare(
      `
        UPDATE blood_donors
        SET event_id = @eventId,
            event_name = @eventName,
            donor_name = @donorName,
            donor_phone = @donorPhone,
            blood_group = @bloodGroup,
            age = @age,
            gender = @gender,
            address = @address,
            donor_id_number = @donorIdNumber,
            blood_bank_name = @bloodBankName,
            blood_bank_contact = @bloodBankContact,
            donation_date = @donationDate,
            units_donated = @unitsDonated,
            relative_support_eligible = @relativeSupportEligible,
            notes = @notes,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `,
    )
    .run({
      ...input,
      relativeSupportEligible: input.relativeSupportEligible ? 1 : 0,
    });
}

export function deleteBloodDonor(donorId: number) {
  const db = ensureBloodTables();

  return db.prepare("DELETE FROM blood_donors WHERE id = ?").run(donorId);
}

export function createBloodRequest(
  input: Omit<
    BloodRequest,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "verificationStatus"
    | "fulfillmentStatus"
    | "verifiedBy"
    | "verifiedAt"
    | "fulfilledBy"
    | "fulfilledAt"
  >,
) {
  const db = ensureBloodTables();

  return db
    .prepare(
      `
        INSERT INTO blood_requests (
          donor_id, donor_name, requester_name, requester_phone, patient_name,
          relation_to_donor, hospital_name, blood_group_needed, units_required,
          urgency, verification_status, fulfillment_status, notes, created_by
        ) VALUES (
          @donorId, @donorName, @requesterName, @requesterPhone, @patientName,
          @relationToDonor, @hospitalName, @bloodGroupNeeded, @unitsRequired,
          @urgency, 'pending', 'pending', @notes, @createdBy
        )
      `,
    )
    .run(input);
}

export function listBloodRequests(): BloodRequest[] {
  const db = ensureBloodTables();
  const rows = db
    .prepare(
      `
        SELECT
          id, donor_id, donor_name, requester_name, requester_phone, patient_name,
          relation_to_donor, hospital_name, blood_group_needed, units_required,
          urgency, verification_status, fulfillment_status, notes, verified_by,
          verified_at, fulfilled_by, fulfilled_at, created_by, created_at, updated_at
        FROM blood_requests
        ORDER BY created_at DESC, id DESC
      `,
    )
    .all() as BloodRequestRow[];

  return rows.map(mapBloodRequest);
}

export function updateBloodRequest(
  input: Omit<
    BloodRequest,
    "createdAt" | "updatedAt" | "createdBy" | "verifiedBy" | "verifiedAt" | "fulfilledBy" | "fulfilledAt"
  >,
) {
  const db = ensureBloodTables();

  return db
    .prepare(
      `
        UPDATE blood_requests
        SET donor_id = @donorId,
            donor_name = @donorName,
            requester_name = @requesterName,
            requester_phone = @requesterPhone,
            patient_name = @patientName,
            relation_to_donor = @relationToDonor,
            hospital_name = @hospitalName,
            blood_group_needed = @bloodGroupNeeded,
            units_required = @unitsRequired,
            urgency = @urgency,
            verification_status = @verificationStatus,
            fulfillment_status = @fulfillmentStatus,
            notes = @notes,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `,
    )
    .run(input);
}

export function deleteBloodRequest(requestId: number) {
  const db = ensureBloodTables();

  return db.prepare("DELETE FROM blood_requests WHERE id = ?").run(requestId);
}

export function verifyBloodRequest(requestId: number, verifiedBy: string) {
  const db = ensureBloodTables();

  return db
    .prepare(
      `
        UPDATE blood_requests
        SET verification_status = 'verified',
            verified_by = ?,
            verified_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .run(verifiedBy, requestId);
}

export function fulfillBloodRequest(requestId: number, fulfilledBy: string) {
  const db = ensureBloodTables();

  return db
    .prepare(
      `
        UPDATE blood_requests
        SET fulfillment_status = 'fulfilled',
            fulfilled_by = ?,
            fulfilled_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .run(fulfilledBy, requestId);
}
