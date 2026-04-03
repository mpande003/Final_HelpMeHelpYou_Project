"use server";

import { revalidatePath } from "next/cache";

import { requireActiveAdminSession } from "@/lib/auth";
import {
  createBeneficiary,
  deleteBeneficiary,
  listBeneficiaries,
  updateBeneficiary,
} from "@/lib/beneficiaries";
import { listEvents } from "@/lib/events";
import { createAuditLog } from "@/lib/users";

export type BeneficiaryActionState = {
  error: string;
  success: string;
};

const initialState: BeneficiaryActionState = {
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

export async function createBeneficiaryAction(
  _prevState: BeneficiaryActionState,
  formData: FormData,
): Promise<BeneficiaryActionState> {
  const session = await requireAdmin();
  const fullName = normalizeString(formData.get("fullName"));
  const supportType = normalizeString(formData.get("supportType"));
  const eventIdValue = normalizeString(formData.get("eventId"));
  const eventId = eventIdValue ? Number(eventIdValue) : null;
  const event = eventId
    ? (await listEvents()).find((item) => item.id === eventId)
    : null;

  if (!fullName || !supportType) {
    return {
      ...initialState,
      error: "Beneficiary name and support type are required.",
    };
  }

  await createBeneficiary({
    eventId,
    eventName: event?.eventName ?? null,
    fullName,
    phoneNumber: normalizeString(formData.get("phoneNumber")) || null,
    age: normalizeString(formData.get("age")) || null,
    gender: normalizeString(formData.get("gender")) || null,
    supportType,
    location: normalizeString(formData.get("location")) || null,
    notes: normalizeString(formData.get("notes")) || null,
    createdBy: session.user.name ?? "unknown",
  });

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "create_beneficiary",
    targetUsername: fullName,
    details: event?.eventName ?? supportType,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Added beneficiary "${fullName}".`,
  };
}

export async function updateBeneficiaryAction(
  _prevState: BeneficiaryActionState,
  formData: FormData,
): Promise<BeneficiaryActionState> {
  const session = await requireAdmin();
  const beneficiaryId = Number(normalizeString(formData.get("beneficiaryId")));
  const existing = (await listBeneficiaries()).find((item) => item.id === beneficiaryId);
  const fullName = normalizeString(formData.get("fullName"));
  const supportType = normalizeString(formData.get("supportType"));
  const eventIdValue = normalizeString(formData.get("eventId"));
  const eventId = eventIdValue ? Number(eventIdValue) : null;
  const event = eventId
    ? (await listEvents()).find((item) => item.id === eventId)
    : null;

  if (Number.isNaN(beneficiaryId) || !existing) {
    return { ...initialState, error: "Beneficiary entry not found." };
  }

  if (!fullName || !supportType) {
    return {
      ...initialState,
      error: "Beneficiary name and support type are required.",
    };
  }

  await updateBeneficiary({
    id: beneficiaryId,
    eventId,
    eventName: event?.eventName ?? existing.eventName ?? null,
    fullName,
    phoneNumber: normalizeString(formData.get("phoneNumber")) || null,
    age: normalizeString(formData.get("age")) || null,
    gender: normalizeString(formData.get("gender")) || null,
    supportType,
    location: normalizeString(formData.get("location")) || null,
    notes: normalizeString(formData.get("notes")) || null,
  });

  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "update_beneficiary",
    targetUsername: fullName,
    details: event?.eventName ?? supportType,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Updated beneficiary "${fullName}".`,
  };
}

export async function deleteBeneficiaryAction(formData: FormData) {
  const session = await requireAdmin();
  const beneficiaryId = Number(normalizeString(formData.get("beneficiaryId")));
  const beneficiary = (await listBeneficiaries()).find((item) => item.id === beneficiaryId);

  if (Number.isNaN(beneficiaryId) || !beneficiary) {
    throw new Error("Beneficiary entry not found.");
  }

  await deleteBeneficiary(beneficiaryId);
  await createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "delete_beneficiary",
    targetUsername: beneficiary.fullName,
    details: beneficiary.eventName ?? beneficiary.supportType,
  });
  revalidatePath("/dashboard");
}
