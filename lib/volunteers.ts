import supabase from "./db";

function splitList(value: string | null) {
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function joinList(arr: string[] | undefined) {
  return arr?.join(",") || null;
}

export async function createVolunteer(input: any) {
  const { data, error } = await supabase.from("volunteers").insert([
    {
      full_name: input.fullName,
      date_of_birth: input.dateOfBirth,
      gender: input.gender,
      phone_number: input.phoneNumber,
      email_address: input.emailAddress,
      emergency_contact_name: input.emergencyContactName,
      emergency_contact_phone: input.emergencyContactPhone,
      full_address: input.fullAddress,
      id_type: input.idType,
      id_number: input.idNumber,
      highest_education_level: input.highestEducationLevel,
      field_of_study: input.fieldOfStudy,
      college_school_name: input.collegeSchoolName,
      current_occupation: input.currentOccupation,
      areas_of_interest: input.areasOfInterest,
      skills: input.skills,
      languages_known: input.languagesKnown,
      available_days: input.availableDays,
      available_time: input.availableTime,
      hours_per_week: input.hoursPerWeek,
      preferred_mode: input.preferredMode,
      previous_volunteer_experience: input.previousVolunteerExperience,
      previous_organization_name: input.previousOrganizationName,
      previous_work_description: input.previousWorkDescription,
      motivation: input.motivation,
      special_skills_or_certifications: input.specialSkillsOrCertifications,
      medical_conditions: input.medicalConditions,
      consent_terms: input.consentTerms ? 1 : 0,
      consent_photos: input.consentPhotos ? 1 : 0,
      consent_policies: input.consentPolicies ? 1 : 0,
      created_by: input.createdBy || "system",
      approval_status: input.approvalStatus || "pending",
    },
  ]);

  if (error) throw error;
  return data;
}

export async function listVolunteers() {
  const { data, error } = await supabase
    .from("volunteers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row: any) => ({
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
    consentTerms: Boolean(row.consent_terms),
    consentPhotos: Boolean(row.consent_photos),
    consentPolicies: Boolean(row.consent_policies),
    createdBy: row.created_by,
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    assignedRole: row.assigned_role,
    assignedEventId: row.assigned_event_id,
    assignedEventName: row.assigned_event_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function approveVolunteer(id: number, approvedBy: string) {
  const { error } = await supabase
    .from("volunteers")
    .update({
      approval_status: "approved",
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function assignVolunteerRole(input: any) {
  const { error } = await supabase
    .from("volunteers")
    .update({
      assigned_role: input.assignedRole,
      assigned_event_id: input.eventId,
      assigned_event_name: input.eventName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.volunteerId);

  if (error) throw error;
}

export async function updateVolunteer(input: any) {
  const { id, ...updates } = input;
  const { error } = await supabase
    .from("volunteers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteVolunteer(id: number) {
  const { error } = await supabase
    .from("volunteers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
export type Volunteer = any;
