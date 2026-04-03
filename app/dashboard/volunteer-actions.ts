"use server";

import { revalidatePath } from "next/cache";

import { requireActiveAdminSession } from "@/lib/auth";
import { listEvents } from "@/lib/events";
import { parseVolunteerFormData } from "@/lib/volunteer-validation";
import {
  persistVolunteerRegistration,
} from "@/lib/volunteer-form";
import { createAuditLog } from "@/lib/users";
import {
  approveVolunteer,
  assignVolunteerRole,
  deleteVolunteer,
  listVolunteers,
  updateVolunteer,
} from "@/lib/volunteers";

export type VolunteerFormState = {
  error: string;
  success: string;
};

const initialState: VolunteerFormState = {
  error: "",
  success: "",
};

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdmin() {
  const { session } = await requireActiveAdminSession();
  return session;
}

export async function createVolunteerAction(
  _prevState: VolunteerFormState,
  formData: FormData,
): Promise<VolunteerFormState> {
  const session = await requireAdmin();
  const result = await persistVolunteerRegistration({
    formData,
    createdBy: session.user.name ?? "unknown",
  });

  if (result.error) {
    return result;
  }

  const fullName = normalizeString(formData.get("fullName"));
  const phoneNumber = normalizeString(formData.get("phoneNumber"));

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "create_volunteer",
    targetUsername: fullName,
    details: phoneNumber,
  });

  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: result.success,
  };
}

export async function updateVolunteerAction(
  _prevState: VolunteerFormState,
  formData: FormData,
): Promise<VolunteerFormState> {
  const session = await requireAdmin();
  const volunteerId = Number(normalizeString(formData.get("volunteerId")));

  if (Number.isNaN(volunteerId)) {
    return { ...initialState, error: "Select a valid volunteer to update." };
  }

  const volunteer = (await listVolunteers()).find((item) => item.id === volunteerId);
  if (!volunteer) {
    return { ...initialState, error: "Volunteer not found." };
  }

  const parsed = parseVolunteerFormData(formData);
  if (parsed.error || !parsed.input) {
    return { ...initialState, error: parsed.error };
  }

  await updateVolunteer({
    id: volunteerId,
    ...parsed.input,
  });

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "update_volunteer",
    targetUsername: parsed.input.fullName,
    details: volunteer.phoneNumber,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Updated "${parsed.input.fullName}".`,
  };
}

export async function approveVolunteerAction(formData: FormData) {
  const session = await requireAdmin();
  const volunteerId = Number(normalizeString(formData.get("volunteerId")));

  if (Number.isNaN(volunteerId)) {
    throw new Error("Invalid volunteer.");
  }

  const volunteer = (await listVolunteers()).find((item) => item.id === volunteerId);
  if (!volunteer) {
    throw new Error("Volunteer not found.");
  }

  await approveVolunteer(volunteerId, session.user.name ?? "unknown");
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "approve_volunteer",
    targetUsername: volunteer.fullName,
  });
  revalidatePath("/dashboard");
}

export async function deleteVolunteerAction(formData: FormData) {
  const session = await requireAdmin();
  const volunteerId = Number(normalizeString(formData.get("volunteerId")));

  if (Number.isNaN(volunteerId)) {
    throw new Error("Invalid volunteer.");
  }

  const volunteer = (await listVolunteers()).find((item) => item.id === volunteerId);
  if (!volunteer) {
    throw new Error("Volunteer not found.");
  }

  await deleteVolunteer(volunteerId);
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "delete_volunteer",
    targetUsername: volunteer.fullName,
  });
  revalidatePath("/dashboard");
}

export async function assignVolunteerRoleAction(formData: FormData) {
  const session = await requireAdmin();
  const volunteerId = Number(normalizeString(formData.get("volunteerId")));
  const eventId = Number(normalizeString(formData.get("eventId")));
  const assignedRole = normalizeString(formData.get("assignedRole"));

  if (Number.isNaN(volunteerId) || Number.isNaN(eventId) || !assignedRole) {
    throw new Error("Volunteer, event, and role are required.");
  }

  const volunteer = (await listVolunteers()).find((item) => item.id === volunteerId);
  if (!volunteer) {
    throw new Error("Volunteer not found.");
  }

  const event = (await listEvents()).find((item) => item.id === eventId);
  if (!event) {
    throw new Error("Event not found.");
  }

  await assignVolunteerRole({
    volunteerId,
    eventId,
    eventName: event.eventName,
    assignedRole,
  });
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "assign_volunteer_role",
    targetUsername: volunteer.fullName,
    details: `${event.eventName}: ${assignedRole}`,
  });
  revalidatePath("/dashboard");
}
