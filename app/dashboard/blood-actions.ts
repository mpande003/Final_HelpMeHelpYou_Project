"use server";

import { revalidatePath } from "next/cache";

import { requireActiveAdminSession } from "@/lib/auth";
import {
  createBloodDonor,
  createBloodRequest,
  deleteBloodDonor,
  deleteBloodRequest,
  fulfillBloodRequest,
  listBloodDonors,
  listBloodRequests,
  updateBloodDonor,
  updateBloodRequest,
  verifyBloodRequest,
} from "@/lib/blood";
import { listEvents } from "@/lib/events";
import { createAuditLog } from "@/lib/users";

export type BloodActionState = {
  error: string;
  success: string;
};

const initialState: BloodActionState = {
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

export async function createBloodDonorAction(
  _prevState: BloodActionState,
  formData: FormData,
): Promise<BloodActionState> {
  const session = await requireAdmin();
  const donorName = normalizeString(formData.get("donorName"));
  const donorPhone = normalizeString(formData.get("donorPhone"));
  const bloodGroup = normalizeString(formData.get("bloodGroup"));
  const bloodBankName = normalizeString(formData.get("bloodBankName"));
  const eventIdValue = normalizeString(formData.get("eventId"));
  const eventId = eventIdValue ? Number(eventIdValue) : null;
  const event = eventId
    ? (await listEvents()).find((item) => item.id === eventId)
    : null;

  if (!donorName || !donorPhone || !bloodGroup || !bloodBankName) {
    return {
      ...initialState,
      error: "Donor name, phone, blood group, and blood bank are required.",
    };
  }

  await createBloodDonor({
    eventId,
    eventName: event?.eventName ?? null,
    donorName,
    donorPhone,
    bloodGroup,
    age: normalizeString(formData.get("age")) || null,
    gender: normalizeString(formData.get("gender")) || null,
    address: normalizeString(formData.get("address")) || null,
    donorIdNumber: normalizeString(formData.get("donorIdNumber")) || null,
    bloodBankName,
    bloodBankContact: normalizeString(formData.get("bloodBankContact")) || null,
    donationDate: normalizeString(formData.get("donationDate")) || null,
    unitsDonated: normalizeString(formData.get("unitsDonated")) || null,
    relativeSupportEligible: formData.get("relativeSupportEligible") === "on",
    notes: normalizeString(formData.get("notes")) || null,
    createdBy: session.user.name ?? "unknown",
  });

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "register_blood_donor",
    targetUsername: donorName,
    details: `${bloodGroup} -> ${bloodBankName}`,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Registered donor "${donorName}" with ${bloodBankName}.`,
  };
}

export async function createBloodRequestAction(
  _prevState: BloodActionState,
  formData: FormData,
): Promise<BloodActionState> {
  const session = await requireAdmin();
  const requesterName = normalizeString(formData.get("requesterName"));
  const requesterPhone = normalizeString(formData.get("requesterPhone"));
  const patientName = normalizeString(formData.get("patientName"));
  const relationToDonor = normalizeString(formData.get("relationToDonor"));
  const bloodGroupNeeded = normalizeString(formData.get("bloodGroupNeeded"));
  const donorIdValue = normalizeString(formData.get("donorId"));
  const donorId = donorIdValue ? Number(donorIdValue) : null;
  const donor = donorId
    ? (await listBloodDonors()).find((item) => item.id === donorId)
    : null;

  if (
    !requesterName ||
    !requesterPhone ||
    !patientName ||
    !relationToDonor ||
    !bloodGroupNeeded
  ) {
    return {
      ...initialState,
      error: "Requester, patient, relation, and blood group are required.",
    };
  }

  await createBloodRequest({
    donorId,
    donorName: donor?.donorName ?? null,
    requesterName,
    requesterPhone,
    patientName,
    relationToDonor,
    hospitalName: normalizeString(formData.get("hospitalName")) || null,
    bloodGroupNeeded,
    unitsRequired: normalizeString(formData.get("unitsRequired")) || null,
    urgency: normalizeString(formData.get("urgency")) || null,
    notes: normalizeString(formData.get("notes")) || null,
    createdBy: session.user.name ?? "unknown",
  });

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "raise_blood_request",
    targetUsername: patientName,
    details: donor?.donorName
      ? `Linked donor: ${donor.donorName}`
      : "No donor linked",
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Raised emergency blood request for "${patientName}".`,
  };
}

export async function updateBloodDonorAction(
  _prevState: BloodActionState,
  formData: FormData,
): Promise<BloodActionState> {
  const session = await requireAdmin();
  const donorId = Number(normalizeString(formData.get("donorId")));
  const donorName = normalizeString(formData.get("donorName"));
  const donorPhone = normalizeString(formData.get("donorPhone"));
  const bloodGroup = normalizeString(formData.get("bloodGroup"));
  const bloodBankName = normalizeString(formData.get("bloodBankName"));
  const eventIdValue = normalizeString(formData.get("eventId"));
  const eventId = eventIdValue ? Number(eventIdValue) : null;
  const event = eventId
    ? (await listEvents()).find((item) => item.id === eventId)
    : null;
  const existing = (await listBloodDonors()).find((item) => item.id === donorId);

  if (Number.isNaN(donorId) || !existing) {
    return { ...initialState, error: "Blood donor not found." };
  }

  if (!donorName || !donorPhone || !bloodGroup || !bloodBankName) {
    return {
      ...initialState,
      error: "Donor name, phone, blood group, and blood bank are required.",
    };
  }

  await updateBloodDonor({
    id: donorId,
    eventId,
    eventName: event?.eventName ?? existing.eventName ?? null,
    donorName,
    donorPhone,
    bloodGroup,
    age: normalizeString(formData.get("age")) || null,
    gender: normalizeString(formData.get("gender")) || null,
    address: normalizeString(formData.get("address")) || null,
    donorIdNumber: normalizeString(formData.get("donorIdNumber")) || null,
    bloodBankName,
    bloodBankContact: normalizeString(formData.get("bloodBankContact")) || null,
    donationDate:
      normalizeString(formData.get("donationDate")) || existing.donationDate,
    unitsDonated: normalizeString(formData.get("unitsDonated")) || null,
    relativeSupportEligible: formData.get("relativeSupportEligible") === "on",
    notes: normalizeString(formData.get("notes")) || null,
  });

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "update_blood_donor",
    targetUsername: donorName,
    details: `${bloodGroup} -> ${bloodBankName}`,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Updated donor "${donorName}".`,
  };
}

export async function deleteBloodDonorAction(formData: FormData) {
  const session = await requireAdmin();
  const donorId = Number(normalizeString(formData.get("donorId")));
  const donor = (await listBloodDonors()).find((item) => item.id === donorId);

  if (Number.isNaN(donorId) || !donor) {
    throw new Error("Blood donor not found.");
  }

  await deleteBloodDonor(donorId);
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "delete_blood_donor",
    targetUsername: donor.donorName,
    details: donor.bloodGroup,
  });
  revalidatePath("/dashboard");
}

export async function updateBloodRequestAction(
  _prevState: BloodActionState,
  formData: FormData,
): Promise<BloodActionState> {
  const session = await requireAdmin();
  const requestId = Number(normalizeString(formData.get("requestId")));
  const existing = (await listBloodRequests()).find((item) => item.id === requestId);
  const requesterName = normalizeString(formData.get("requesterName"));
  const requesterPhone = normalizeString(formData.get("requesterPhone"));
  const patientName = normalizeString(formData.get("patientName"));
  const relationToDonor = normalizeString(formData.get("relationToDonor"));
  const bloodGroupNeeded = normalizeString(formData.get("bloodGroupNeeded"));
  const donorIdValue = normalizeString(formData.get("donorId"));
  const donorId = donorIdValue ? Number(donorIdValue) : null;
  const donor = donorId
    ? (await listBloodDonors()).find((item) => item.id === donorId)
    : null;

  if (Number.isNaN(requestId) || !existing) {
    return { ...initialState, error: "Blood request not found." };
  }

  if (
    !requesterName ||
    !requesterPhone ||
    !patientName ||
    !relationToDonor ||
    !bloodGroupNeeded
  ) {
    return {
      ...initialState,
      error: "Requester, patient, relation, and blood group are required.",
    };
  }

  await updateBloodRequest({
    id: requestId,
    donorId,
    donorName: donor?.donorName ?? null,
    requesterName,
    requesterPhone,
    patientName,
    relationToDonor,
    hospitalName: normalizeString(formData.get("hospitalName")) || null,
    bloodGroupNeeded,
    unitsRequired: normalizeString(formData.get("unitsRequired")) || null,
    urgency: normalizeString(formData.get("urgency")) || null,
    verificationStatus:
      (normalizeString(formData.get("verificationStatus")) as
        | "pending"
        | "verified") || existing.verificationStatus,
    fulfillmentStatus:
      (normalizeString(formData.get("fulfillmentStatus")) as
        | "pending"
        | "fulfilled") || existing.fulfillmentStatus,
    notes: normalizeString(formData.get("notes")) || null,
  });

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "update_blood_request",
    targetUsername: patientName,
    details: relationToDonor,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Updated blood request for "${patientName}".`,
  };
}

export async function deleteBloodRequestAction(formData: FormData) {
  const session = await requireAdmin();
  const requestId = Number(normalizeString(formData.get("requestId")));
  const request = (await listBloodRequests()).find((item) => item.id === requestId);

  if (Number.isNaN(requestId) || !request) {
    throw new Error("Blood request not found.");
  }

  await deleteBloodRequest(requestId);
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "delete_blood_request",
    targetUsername: request.patientName,
    details: request.bloodGroupNeeded,
  });
  revalidatePath("/dashboard");
}

export async function verifyBloodRequestAction(formData: FormData) {
  const session = await requireAdmin();
  const requestId = Number(normalizeString(formData.get("requestId")));
  const request = (await listBloodRequests()).find((item) => item.id === requestId);

  if (Number.isNaN(requestId) || !request) {
    throw new Error("Blood request not found.");
  }

  await verifyBloodRequest(requestId, session.user.name ?? "unknown");
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "verify_blood_request",
    targetUsername: request.patientName,
    details: request.relationToDonor,
  });
  revalidatePath("/dashboard");
}

export async function fulfillBloodRequestAction(formData: FormData) {
  const session = await requireAdmin();
  const requestId = Number(normalizeString(formData.get("requestId")));
  const request = (await listBloodRequests()).find((item) => item.id === requestId);

  if (Number.isNaN(requestId) || !request) {
    throw new Error("Blood request not found.");
  }

  await fulfillBloodRequest(requestId, session.user.name ?? "unknown");
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "fulfill_blood_request",
    targetUsername: request.patientName,
    details: request.bloodGroupNeeded,
  });
  revalidatePath("/dashboard");
}
