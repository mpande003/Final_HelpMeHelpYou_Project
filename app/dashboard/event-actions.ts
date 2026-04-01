"use server";
import { revalidatePath } from "next/cache";

import { requireActiveAdminSession } from "@/lib/auth";
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
  updateEventMarkerStatus,
} from "@/lib/events";
import { createAuditLog } from "@/lib/users";

export type EventFormState = {
  error: string;
  success: string;
};

const initialState: EventFormState = {
  error: "",
  success: "",
};

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildEventPayload(formData: FormData, createdBy: string) {
  const eventType = normalizeString(formData.get("eventType"));
  const customEventType = normalizeString(formData.get("customEventType"));
  const latitude = Number(normalizeString(formData.get("latitude")));
  const longitude = Number(normalizeString(formData.get("longitude")));

  return {
    eventName: normalizeString(formData.get("eventName")),
    eventType: eventType === "Other" ? customEventType || "Other" : eventType,
    description: normalizeString(formData.get("description")) || null,
    startDate: normalizeString(formData.get("startDate")),
    endDate: normalizeString(formData.get("endDate")),
    startTime: normalizeString(formData.get("startTime")) || null,
    endTime: normalizeString(formData.get("endTime")) || null,
    fullName: normalizeString(formData.get("fullName")) || null,
    houseNumber: normalizeString(formData.get("houseNumber")) || null,
    buildingStreetArea:
      normalizeString(formData.get("buildingStreetArea")) || null,
    landmark: normalizeString(formData.get("landmark")) || null,
    villageTownCity: normalizeString(formData.get("villageTownCity")) || null,
    postOffice: normalizeString(formData.get("postOffice")) || null,
    tehsilTaluka: normalizeString(formData.get("tehsilTaluka")) || null,
    district: normalizeString(formData.get("district")) || null,
    state: normalizeString(formData.get("state")) || null,
    pinCode: normalizeString(formData.get("pinCode")) || null,
    country: normalizeString(formData.get("country")) || "India",
    mapLink: normalizeString(formData.get("mapLink")) || null,
    partnerOrganizations:
      normalizeString(formData.get("partnerOrganizations")) || null,
    sponsorContactName:
      normalizeString(formData.get("sponsorContactName")) || null,
    sponsorPhone: normalizeString(formData.get("sponsorPhone")) || null,
    sponsorEmail: normalizeString(formData.get("sponsorEmail")) || null,
    expectedParticipants:
      normalizeString(formData.get("expectedParticipants")) || null,
    actualParticipants:
      normalizeString(formData.get("actualParticipants")) || null,
    beneficiaries: normalizeString(formData.get("beneficiaries")) || null,
    estimatedBudget:
      normalizeString(formData.get("estimatedBudget")) || null,
    actualExpenses: normalizeString(formData.get("actualExpenses")) || null,
    sponsor: normalizeString(formData.get("sponsor")) || null,
    status: normalizeString(formData.get("status")) || null,
    markerStatus:
      (normalizeString(formData.get("markerStatus")) as "active" | "removed") ||
      "active",
    latitude,
    longitude,
    createdBy,
  };
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { session } = await requireActiveAdminSession();

  const eventName = normalizeString(formData.get("eventName"));
  const startDate = normalizeString(formData.get("startDate"));
  const endDate = normalizeString(formData.get("endDate"));
  const latitudeValue = normalizeString(formData.get("latitude"));
  const longitudeValue = normalizeString(formData.get("longitude"));
  const payload = buildEventPayload(formData, session.user.name ?? "unknown");
  const eventType = normalizeString(formData.get("eventType"));
  const customEventType = normalizeString(formData.get("customEventType"));

  if (!eventName || !eventType || !startDate || !endDate) {
    return {
      ...initialState,
      error: "Event name, type, start date, and end date are required.",
    };
  }

  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return {
      ...initialState,
      error: "Valid latitude and longitude are required for the impact map.",
    };
  }

  createEvent(payload);

  const resolvedEventType =
    eventType === "Other" ? customEventType || "Other" : eventType;

  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "create_event",
    targetUsername: eventName,
    details: `${resolvedEventType} @ ${latitude},${longitude}`,
  });

  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Saved "${eventName}" and added it to the impact map.`,
  };
}

export async function updateEventAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { session } = await requireActiveAdminSession();

  const eventId = Number(normalizeString(formData.get("eventId")));
  const startDate = normalizeString(formData.get("startDate"));
  const endDate = normalizeString(formData.get("endDate"));
  const payload = buildEventPayload(formData, session.user.name ?? "unknown");

  if (Number.isNaN(eventId)) {
    return { ...initialState, error: "Select a valid event to update." };
  }

  if (!payload.eventName || !payload.eventType || !startDate || !endDate) {
    return {
      ...initialState,
      error: "Event name, type, start date, and end date are required.",
    };
  }

  if (Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude)) {
    return {
      ...initialState,
      error: "Valid latitude and longitude are required for the impact map.",
    };
  }

  const existingEvent = listEvents().find((event) => event.id === eventId);
  if (!existingEvent) {
    return { ...initialState, error: "Selected event not found." };
  }

  updateEvent({
    id: eventId,
    ...payload,
  });

  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "update_event",
    targetUsername: payload.eventName,
    details: `${payload.eventType} @ ${payload.latitude},${payload.longitude}`,
  });

  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Updated "${payload.eventName}".`,
  };
}

export async function removeEventMarkerAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { session } = await requireActiveAdminSession();

  const eventId = Number(normalizeString(formData.get("eventId")));

  if (Number.isNaN(eventId)) {
    return {
      ...initialState,
      error: "Invalid event marker selected.",
    };
  }

  const event = listEvents().find((item) => item.id === eventId);
  if (!event) {
    return {
      ...initialState,
      error: "Event marker not found.",
    };
  }

  updateEventMarkerStatus(eventId, "removed");
  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "remove_event_marker",
    targetUsername: event.eventName,
    details: `${event.latitude},${event.longitude}`,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Removed marker for "${event.eventName}".`,
  };
}

export async function readdEventMarkerAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { session } = await requireActiveAdminSession();

  const eventId = Number(normalizeString(formData.get("eventId")));

  if (Number.isNaN(eventId)) {
    return {
      ...initialState,
      error: "Invalid event marker selected.",
    };
  }

  const event = listEvents().find((item) => item.id === eventId);
  if (!event) {
    return {
      ...initialState,
      error: "Event marker not found.",
    };
  }

  updateEventMarkerStatus(eventId, "active");
  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "readd_event_marker",
    targetUsername: event.eventName,
    details: `${event.latitude},${event.longitude}`,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Re-added marker for "${event.eventName}".`,
  };
}

export async function deleteEventAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { session } = await requireActiveAdminSession();

  const eventId = Number(normalizeString(formData.get("eventId")));

  if (Number.isNaN(eventId)) {
    return { ...initialState, error: "Select a valid event to delete." };
  }

  const event = listEvents().find((item) => item.id === eventId);
  if (!event) {
    return { ...initialState, error: "Selected event not found." };
  }

  deleteEvent(eventId);

  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "delete_event",
    targetUsername: event.eventName,
    details: `${event.eventType} @ ${event.latitude},${event.longitude}`,
  });

  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Deleted "${event.eventName}".`,
  };
}
