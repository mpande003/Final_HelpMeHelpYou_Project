import supabase from "./db";

// ✅ CREATE DONOR
export async function createBloodDonor(input: any) {
  const { data, error } = await supabase.from("blood_donors").insert([
    {
      ...input,
      relative_support_eligible: input.relativeSupportEligible ? 1 : 0,
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
  return data;
}

export async function updateBloodDonor(input: any) {
  const { id, ...updates } = input;
  const { error } = await supabase
    .from("blood_donors")
    .update({
      ...updates,
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
    .insert([input]);

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
  return data;
}

export async function updateBloodRequest(input: any) {
  const { id, ...updates } = input;
  const { error } = await supabase
    .from("blood_requests")
    .update({
      ...updates,
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
