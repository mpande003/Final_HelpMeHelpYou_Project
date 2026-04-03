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
      areas_of_interest: joinList(input.areasOfInterest),
      skills: input.skills,
      languages_known: input.languagesKnown,
      available_days: joinList(input.availableDays),
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
      created_by: input.createdBy,
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
    ...row,
    areasOfInterest: splitList(row.areas_of_interest),
    availableDays: splitList(row.available_days),
    consentTerms: Boolean(row.consent_terms),
    consentPhotos: Boolean(row.consent_photos),
    consentPolicies: Boolean(row.consent_policies),
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
