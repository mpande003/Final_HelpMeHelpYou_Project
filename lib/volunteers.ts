import { getVolunteerDb } from "./volunteer-db";
import type { VolunteerMutableFields } from "./volunteer-validation";

export type Volunteer = {
  id: number;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phoneNumber: string;
  emailAddress: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  fullAddress: string | null;
  idType: string | null;
  idNumber: string | null;
  highestEducationLevel: string | null;
  fieldOfStudy: string | null;
  collegeSchoolName: string | null;
  currentOccupation: string | null;
  areasOfInterest: string[];
  skills: string | null;
  languagesKnown: string | null;
  availableDays: string[];
  availableTime: string | null;
  hoursPerWeek: string | null;
  preferredMode: string | null;
  previousVolunteerExperience: "Yes" | "No";
  previousOrganizationName: string | null;
  previousWorkDescription: string | null;
  motivation: string | null;
  specialSkillsOrCertifications: string | null;
  medicalConditions: string | null;
  approvalStatus: "pending" | "approved";
  approvedBy: string | null;
  approvedAt: string | null;
  assignedEventId: number | null;
  assignedEventName: string | null;
  assignedRole: string | null;
  consentTerms: boolean;
  consentPhotos: boolean;
  consentPolicies: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type VolunteerRow = {
  id: number;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone_number: string;
  email_address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  full_address: string | null;
  id_type: string | null;
  id_number: string | null;
  highest_education_level: string | null;
  field_of_study: string | null;
  college_school_name: string | null;
  current_occupation: string | null;
  areas_of_interest: string | null;
  skills: string | null;
  languages_known: string | null;
  available_days: string | null;
  available_time: string | null;
  hours_per_week: string | null;
  preferred_mode: string | null;
  previous_volunteer_experience: "Yes" | "No";
  previous_organization_name: string | null;
  previous_work_description: string | null;
  motivation: string | null;
  special_skills_or_certifications: string | null;
  medical_conditions: string | null;
  approval_status: "pending" | "approved";
  approved_by: string | null;
  approved_at: string | null;
  assigned_event_id: number | null;
  assigned_event_name: string | null;
  assigned_role: string | null;
  consent_terms: number;
  consent_photos: number;
  consent_policies: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function splitList(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function mapVolunteer(row: VolunteerRow): Volunteer {
  return {
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    phoneNumber: row.phone_number,
    emailAddress: row.email_address,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    fullAddress: row.full_address,
    idType: row.id_type,
    idNumber: row.id_number,
    highestEducationLevel: row.highest_education_level,
    fieldOfStudy: row.field_of_study,
    collegeSchoolName: row.college_school_name,
    currentOccupation: row.current_occupation,
    areasOfInterest: splitList(row.areas_of_interest),
    skills: row.skills,
    languagesKnown: row.languages_known,
    availableDays: splitList(row.available_days),
    availableTime: row.available_time,
    hoursPerWeek: row.hours_per_week,
    preferredMode: row.preferred_mode,
    previousVolunteerExperience: row.previous_volunteer_experience,
    previousOrganizationName: row.previous_organization_name,
    previousWorkDescription: row.previous_work_description,
    motivation: row.motivation,
    specialSkillsOrCertifications: row.special_skills_or_certifications,
    medicalConditions: row.medical_conditions,
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    assignedEventId: row.assigned_event_id,
    assignedEventName: row.assigned_event_name,
    assignedRole: row.assigned_role,
    consentTerms: Boolean(row.consent_terms),
    consentPhotos: Boolean(row.consent_photos),
    consentPolicies: Boolean(row.consent_policies),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createVolunteer(
  input: VolunteerMutableFields & {
    createdBy: string;
  },
) {
  const db = getVolunteerDb();
  const sqliteInput = {
    ...input,
    consentTerms: input.consentTerms ? 1 : 0,
    consentPhotos: input.consentPhotos ? 1 : 0,
    consentPolicies: input.consentPolicies ? 1 : 0,
  };

  return db
    .prepare(
      `
        INSERT INTO volunteers (
          full_name, date_of_birth, gender, phone_number, email_address,
          emergency_contact_name, emergency_contact_phone, full_address,
          id_type, id_number,
          highest_education_level, field_of_study, college_school_name,
          current_occupation, areas_of_interest, skills, languages_known,
          available_days, available_time, hours_per_week, preferred_mode,
          previous_volunteer_experience, previous_organization_name,
          previous_work_description, motivation,
          special_skills_or_certifications, medical_conditions,
          approval_status, approved_by,
          approved_at, assigned_event_id, assigned_event_name, assigned_role,
          consent_terms, consent_photos, consent_policies, created_by
        ) VALUES (
          @fullName, @dateOfBirth, @gender, @phoneNumber, @emailAddress,
          @emergencyContactName, @emergencyContactPhone, @fullAddress,
          @idType, @idNumber,
          @highestEducationLevel, @fieldOfStudy, @collegeSchoolName,
          @currentOccupation, @areasOfInterest, @skills, @languagesKnown,
          @availableDays, @availableTime, @hoursPerWeek, @preferredMode,
          @previousVolunteerExperience, @previousOrganizationName,
          @previousWorkDescription, @motivation,
          @specialSkillsOrCertifications, @medicalConditions, 'pending', NULL,
          NULL, NULL, NULL, NULL, @consentTerms, @consentPhotos,
          @consentPolicies, @createdBy
        )
      `,
    )
    .run(sqliteInput);
}

export function updateVolunteer(
  input: VolunteerMutableFields & {
    id: number;
  },
) {
  const db = getVolunteerDb();
  const sqliteInput = {
    ...input,
    consentTerms: input.consentTerms ? 1 : 0,
    consentPhotos: input.consentPhotos ? 1 : 0,
    consentPolicies: input.consentPolicies ? 1 : 0,
  };

  return db
    .prepare(
      `
        UPDATE volunteers
        SET full_name = @fullName,
            date_of_birth = @dateOfBirth,
            gender = @gender,
            phone_number = @phoneNumber,
            email_address = @emailAddress,
            emergency_contact_name = @emergencyContactName,
            emergency_contact_phone = @emergencyContactPhone,
            full_address = @fullAddress,
            id_type = @idType,
            id_number = @idNumber,
            highest_education_level = @highestEducationLevel,
            field_of_study = @fieldOfStudy,
            college_school_name = @collegeSchoolName,
            current_occupation = @currentOccupation,
            areas_of_interest = @areasOfInterest,
            skills = @skills,
            languages_known = @languagesKnown,
            available_days = @availableDays,
            available_time = @availableTime,
            hours_per_week = @hoursPerWeek,
            preferred_mode = @preferredMode,
            previous_volunteer_experience = @previousVolunteerExperience,
            previous_organization_name = @previousOrganizationName,
            previous_work_description = @previousWorkDescription,
            motivation = @motivation,
            special_skills_or_certifications = @specialSkillsOrCertifications,
            medical_conditions = @medicalConditions,
            consent_terms = @consentTerms,
            consent_photos = @consentPhotos,
            consent_policies = @consentPolicies,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `,
    )
    .run(sqliteInput);
}

export function listVolunteers(): Volunteer[] {
  const db = getVolunteerDb();
  const rows = db
    .prepare(
      `
        SELECT
          id, full_name, date_of_birth, gender, phone_number, email_address,
          emergency_contact_name, emergency_contact_phone, full_address,
          id_type, id_number,
          highest_education_level, field_of_study, college_school_name,
          current_occupation, areas_of_interest, skills, languages_known,
          available_days, available_time, hours_per_week, preferred_mode,
          previous_volunteer_experience, previous_organization_name,
          previous_work_description, motivation,
          special_skills_or_certifications, medical_conditions,
          approval_status, approved_by,
          approved_at, assigned_event_id, assigned_event_name, assigned_role,
          consent_terms, consent_photos, consent_policies, created_by,
          created_at, updated_at
        FROM volunteers
        ORDER BY created_at DESC, id DESC
      `,
    )
    .all() as VolunteerRow[];

  return rows.map(mapVolunteer);
}

export function approveVolunteer(volunteerId: number, approvedBy: string) {
  const db = getVolunteerDb();

  return db
    .prepare(
      `
        UPDATE volunteers
        SET approval_status = 'approved',
            approved_by = ?,
            approved_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .run(approvedBy, volunteerId);
}

export function assignVolunteerRole(input: {
  volunteerId: number;
  eventId: number;
  eventName: string;
  assignedRole: string;
}) {
  const db = getVolunteerDb();

  return db
    .prepare(
      `
        UPDATE volunteers
        SET assigned_event_id = @eventId,
            assigned_event_name = @eventName,
            assigned_role = @assignedRole,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @volunteerId
      `,
    )
    .run(input);
}

export function deleteVolunteer(volunteerId: number) {
  const db = getVolunteerDb();

  return db.prepare("DELETE FROM volunteers WHERE id = ?").run(volunteerId);
}
