import { getDb } from "./db";

export type AppEvent = {
  id: number;
  eventName: string;
  eventType: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  fullName: string | null;
  houseNumber: string | null;
  buildingStreetArea: string | null;
  landmark: string | null;
  villageTownCity: string | null;
  postOffice: string | null;
  tehsilTaluka: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  country: string;
  mapLink: string | null;
  partnerOrganizations: string | null;
  sponsorContactName: string | null;
  sponsorPhone: string | null;
  sponsorEmail: string | null;
  expectedParticipants: string | null;
  actualParticipants: string | null;
  beneficiaries: string | null;
  estimatedBudget: string | null;
  actualExpenses: string | null;
  sponsor: string | null;
  status: string | null;
  markerStatus: "active" | "removed";
  latitude: number;
  longitude: number;
  createdBy: string;
  createdAt: string;
};

type EventRow = {
  id: number;
  event_name: string;
  event_type: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  full_name: string | null;
  house_number: string | null;
  building_street_area: string | null;
  landmark: string | null;
  village_town_city: string | null;
  post_office: string | null;
  tehsil_taluka: string | null;
  district: string | null;
  state: string | null;
  pin_code: string | null;
  country: string;
  map_link: string | null;
  partner_organizations: string | null;
  sponsor_contact_name: string | null;
  sponsor_phone: string | null;
  sponsor_email: string | null;
  expected_participants: string | null;
  actual_participants: string | null;
  beneficiaries: string | null;
  estimated_budget: string | null;
  actual_expenses: string | null;
  sponsor: string | null;
  status: string | null;
  marker_status: "active" | "removed";
  latitude: number;
  longitude: number;
  created_by: string;
  created_at: string;
};

function mapEvent(row: EventRow): AppEvent {
  return {
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
    createdAt: row.created_at,
  };
}

export function createEvent(input: Omit<AppEvent, "id" | "createdAt">) {
  const db = getDb();

  return db
    .prepare(
      `
        INSERT INTO events (
          event_name, event_type, description, start_date, end_date,
          start_time, end_time, full_name, house_number, building_street_area,
          landmark, village_town_city, post_office, tehsil_taluka, district,
          state, pin_code, country, map_link, partner_organizations,
          sponsor_contact_name, sponsor_phone, sponsor_email,
          expected_participants, actual_participants, beneficiaries,
          estimated_budget, actual_expenses, sponsor, status, marker_status, latitude,
          longitude, created_by
        ) VALUES (
          @eventName, @eventType, @description, @startDate, @endDate,
          @startTime, @endTime, @fullName, @houseNumber, @buildingStreetArea,
          @landmark, @villageTownCity, @postOffice, @tehsilTaluka, @district,
          @state, @pinCode, @country, @mapLink, @partnerOrganizations,
          @sponsorContactName, @sponsorPhone, @sponsorEmail,
          @expectedParticipants, @actualParticipants, @beneficiaries,
          @estimatedBudget, @actualExpenses, @sponsor, @status, @markerStatus, @latitude,
          @longitude, @createdBy
        )
      `,
    )
    .run(input);
}

export function listEvents(): AppEvent[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT
          id, event_name, event_type, description, start_date, end_date,
          start_time, end_time, full_name, house_number, building_street_area,
          landmark, village_town_city, post_office, tehsil_taluka, district,
          state, pin_code, country, map_link, partner_organizations,
          sponsor_contact_name, sponsor_phone, sponsor_email,
          expected_participants, actual_participants, beneficiaries,
          estimated_budget, actual_expenses, sponsor, status, marker_status, latitude,
          longitude, created_by, created_at
        FROM events
        ORDER BY start_date DESC, id DESC
      `,
    )
    .all() as EventRow[];

  return rows.map(mapEvent);
}

export function updateEvent(input: Omit<AppEvent, "createdAt" | "createdBy">) {
  const db = getDb();

  return db
    .prepare(
      `
        UPDATE events
        SET event_name = @eventName,
            event_type = @eventType,
            description = @description,
            start_date = @startDate,
            end_date = @endDate,
            start_time = @startTime,
            end_time = @endTime,
            full_name = @fullName,
            house_number = @houseNumber,
            building_street_area = @buildingStreetArea,
            landmark = @landmark,
            village_town_city = @villageTownCity,
            post_office = @postOffice,
            tehsil_taluka = @tehsilTaluka,
            district = @district,
            state = @state,
            pin_code = @pinCode,
            country = @country,
            map_link = @mapLink,
            partner_organizations = @partnerOrganizations,
            sponsor_contact_name = @sponsorContactName,
            sponsor_phone = @sponsorPhone,
            sponsor_email = @sponsorEmail,
            expected_participants = @expectedParticipants,
            actual_participants = @actualParticipants,
            beneficiaries = @beneficiaries,
            estimated_budget = @estimatedBudget,
            actual_expenses = @actualExpenses,
            sponsor = @sponsor,
            status = @status,
            marker_status = @markerStatus,
            latitude = @latitude,
            longitude = @longitude,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `,
    )
    .run(input);
}

export function updateEventMarkerStatus(
  eventId: number,
  markerStatus: "active" | "removed",
) {
  const db = getDb();

  return db
    .prepare(
      `
        UPDATE events
        SET marker_status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .run(markerStatus, eventId);
}

export function deleteEvent(eventId: number) {
  const db = getDb();

  return db.prepare("DELETE FROM events WHERE id = ?").run(eventId);
}
