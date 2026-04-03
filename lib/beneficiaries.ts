import supabase from "./db";

export async function listBeneficiaries() {
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  return data.map((row: any) => ({
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
  }));
}

export async function createBeneficiary(input: any) {
  const { data, error } = await supabase.from("beneficiaries").insert([{
    event_id: input.eventId,
    event_name: input.eventName,
    full_name: input.fullName,
    phone_number: input.phoneNumber,
    age: input.age,
    gender: input.gender,
    support_type: input.supportType,
    location: input.location,
    notes: input.notes,
    created_by: input.createdBy,
  }]);

  if (error) throw error;
  return data;
}

export async function deleteBeneficiary(id: number) {
  const { error } = await supabase.from("beneficiaries").delete().eq("id", id);
  if (error) throw error;
}

export async function updateBeneficiary(input: any) {
  const { id, ...updates } = input;
  const { error } = await supabase
    .from("beneficiaries")
    .update({
      event_id: updates.eventId,
      event_name: updates.eventName,
      full_name: updates.fullName,
      phone_number: updates.phoneNumber,
      age: updates.age,
      gender: updates.gender,
      support_type: updates.supportType,
      location: updates.location,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
export type Beneficiary = any;
