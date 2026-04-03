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
  
  // Transform snake_case columns back to camelCase expected by the UI
  return data.map((row: any) => ({
    id: row.id,
    eventName: row.event_name,
    eventType: row.event_type,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    endTime: row.end_time,
    fullName: row.full_name,
    houseNumber: row.house_number,
    buildingStreetArea: row.building_street_area,
    landmark: row.landmark,
    villageTownCity: row.village_town_city,
    postOffice: row.post_office,
    tehsilTaluka: row.tehsil_taluka,
    district: row.district,
    state: row.state,
    pinCode: row.pin_code,
    country: row.country,
    mapLink: row.map_link,
    partnerOrganizations: row.partner_organizations,
    sponsorContactName: row.sponsor_contact_name,
    sponsorPhone: row.sponsor_phone,
    sponsorEmail: row.sponsor_email,
    expectedParticipants: row.expected_participants,
    actualParticipants: row.actual_participants,
    beneficiaries: row.beneficiaries,
    estimatedBudget: row.estimated_budget,
    actualExpenses: row.actual_expenses,
    sponsor: row.sponsor,
    status: row.status,
    markerStatus: row.marker_status,
    latitude: row.latitude,
    longitude: row.longitude,
    createdBy: row.created_by,
  }));
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