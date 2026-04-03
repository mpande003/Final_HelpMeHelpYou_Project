import supabase from "./db";

export type AppEvent = any;

// ✅ CREATE
export async function createEvent(input: any) {
  const { data, error } = await supabase.from("events").insert([
    {
      event_name: input.eventName,
      event_type: input.eventType,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      start_time: input.startTime,
      end_time: input.endTime,
      full_name: input.fullName,
      house_number: input.houseNumber,
      building_street_area: input.buildingStreetArea,
      landmark: input.landmark,
      village_town_city: input.villageTownCity,
      post_office: input.postOffice,
      tehsil_taluka: input.tehsilTaluka,
      district: input.district,
      state: input.state,
      pin_code: input.pinCode,
      country: input.country,
      map_link: input.mapLink,
      partner_organizations: input.partnerOrganizations,
      sponsor_contact_name: input.sponsorContactName,
      sponsor_phone: input.sponsorPhone,
      sponsor_email: input.sponsorEmail,
      expected_participants: input.expectedParticipants,
      actual_participants: input.actualParticipants,
      beneficiaries: input.beneficiaries,
      estimated_budget: input.estimatedBudget,
      actual_expenses: input.actualExpenses,
      sponsor: input.sponsor,
      status: input.status,
      marker_status: input.markerStatus,
      latitude: input.latitude,
      longitude: input.longitude,
      created_by: input.createdBy,
    },
  ]);

  if (error) throw error;
  return data;
}

// ✅ LIST
export async function listEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ UPDATE
export async function updateEvent(input: any) {
  const { data, error } = await supabase
    .from("events")
    .update({
      event_name: input.eventName,
      event_type: input.eventType,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      start_time: input.startTime,
      end_time: input.endTime,
      full_name: input.fullName,
      house_number: input.houseNumber,
      building_street_area: input.buildingStreetArea,
      landmark: input.landmark,
      village_town_city: input.villageTownCity,
      post_office: input.postOffice,
      tehsil_taluka: input.tehsilTaluka,
      district: input.district,
      state: input.state,
      pin_code: input.pinCode,
      country: input.country,
      map_link: input.mapLink,
      partner_organizations: input.partnerOrganizations,
      sponsor_contact_name: input.sponsorContactName,
      sponsor_phone: input.sponsorPhone,
      sponsor_email: input.sponsorEmail,
      expected_participants: input.expectedParticipants,
      actual_participants: input.actualParticipants,
      beneficiaries: input.beneficiaries,
      estimated_budget: input.estimatedBudget,
      actual_expenses: input.actualExpenses,
      sponsor: input.sponsor,
      status: input.status,
      marker_status: input.markerStatus,
      latitude: input.latitude,
      longitude: input.longitude,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) throw error;
  return data;
}

// ✅ DELETE
export async function deleteEvent(id: number) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ✅ UPDATE MARKER
export async function updateEventMarkerStatus(
  id: number,
  status: "active" | "removed",
) {
  const { error } = await supabase
    .from("events")
    .update({
      marker_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}