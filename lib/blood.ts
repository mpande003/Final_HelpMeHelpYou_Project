import supabase from "./db";

// ✅ CREATE DONOR
export async function createBloodDonor(input: any) {
  const { data, error } = await supabase.from("blood_donors").insert([
    {
      event_id: input.eventId,
      event_name: input.eventName,
      donor_name: input.donorName,
      donor_phone: input.donorPhone,
      blood_group: input.bloodGroup,
      age: input.age,
      gender: input.gender,
      address: input.address,
      donor_id_number: input.donorIdNumber,
      blood_bank_name: input.bloodBankName,
      blood_bank_contact: input.bloodBankContact,
      donation_date: input.donationDate,
      units_donated: input.unitsDonated,
      relative_support_eligible: input.relativeSupportEligible ? 1 : 0,
      notes: input.notes,
      created_by: input.createdBy,
    },
  ]);

  if (error) throw error;
  return data;
}

// ✅ LIST DONORS
export async function listBloodDonors() {
  const { data, error } = await supabase
    .from("blood_donors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((row: any) => ({
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
  }));
}

export async function updateBloodDonor(input: any) {
  const { id, ...updates } = input;
  const { error } = await supabase
    .from("blood_donors")
    .update({
      event_id: updates.eventId,
      event_name: updates.eventName,
      donor_name: updates.donorName,
      donor_phone: updates.donorPhone,
      blood_group: updates.bloodGroup,
      age: updates.age,
      gender: updates.gender,
      address: updates.address,
      donor_id_number: updates.donorIdNumber,
      blood_bank_name: updates.bloodBankName,
      blood_bank_contact: updates.bloodBankContact,
      donation_date: updates.donationDate,
      units_donated: updates.unitsDonated,
      relative_support_eligible: updates.relativeSupportEligible ? 1 : 0,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

// ✅ DELETE DONOR
export async function deleteBloodDonor(id: number) {
  const { error } = await supabase
    .from("blood_donors")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ---------------------------
// BLOOD REQUESTS
// ---------------------------

// ✅ CREATE REQUEST
export async function createBloodRequest(input: any) {
  const { data, error } = await supabase
    .from("blood_requests")
    .insert([{
      donor_id: input.donorId,
      donor_name: input.donorName,
      requester_name: input.requesterName,
      requester_phone: input.requesterPhone,
      patient_name: input.patientName,
      relation_to_donor: input.relationToDonor,
      hospital_name: input.hospitalName,
      blood_group_needed: input.bloodGroupNeeded,
      units_required: input.unitsRequired,
      urgency: input.urgency,
      notes: input.notes,
      created_by: input.createdBy,
    }]);

  if (error) throw error;
  return data;
}

// ✅ LIST REQUESTS
export async function listBloodRequests() {
  const { data, error } = await supabase
    .from("blood_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((row: any) => ({
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
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    fulfillmentStatus: row.fulfillment_status,
    fulfilledBy: row.fulfilled_by,
    fulfilledAt: row.fulfilled_at,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateBloodRequest(input: any) {
  const { id, ...updates } = input;
  const { error } = await supabase
    .from("blood_requests")
    .update({
      donor_id: updates.donorId,
      donor_name: updates.donorName,
      requester_name: updates.requesterName,
      requester_phone: updates.requesterPhone,
      patient_name: updates.patientName,
      relation_to_donor: updates.relationToDonor,
      hospital_name: updates.hospitalName,
      blood_group_needed: updates.bloodGroupNeeded,
      units_required: updates.unitsRequired,
      urgency: updates.urgency,
      verification_status: updates.verificationStatus,
      fulfillment_status: updates.fulfillmentStatus,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

// ✅ DELETE REQUEST
export async function deleteBloodRequest(id: number) {
  const { error } = await supabase
    .from("blood_requests")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ✅ VERIFY REQUEST
export async function verifyBloodRequest(id: number, verifiedBy: string) {
  const { error } = await supabase
    .from("blood_requests")
    .update({
      verification_status: "verified",
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

// ✅ FULFILL REQUEST
export async function fulfillBloodRequest(id: number, fulfilledBy: string) {
  const { error } = await supabase
    .from("blood_requests")
    .update({
      fulfillment_status: "fulfilled",
      fulfilled_by: fulfilledBy,
      fulfilled_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
export type BloodDonor = any;
export type BloodRequest = any;
