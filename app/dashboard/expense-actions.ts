"use server";

import { revalidatePath } from "next/cache";

import { requireActiveAdminSession } from "@/lib/auth";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from "@/lib/expenses";
import { listEvents } from "@/lib/events";
import { createAuditLog } from "@/lib/users";

export type ExpenseActionState = {
  error: string;
  success: string;
};

const initialState: ExpenseActionState = {
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

export async function createExpenseAction(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const session = await requireAdmin();
  const expenseTitle = normalizeString(formData.get("expenseTitle"));
  const category = normalizeString(formData.get("category"));
  const amount = normalizeString(formData.get("amount"));
  const expenseDate = normalizeString(formData.get("expenseDate"));
  const eventIdValue = normalizeString(formData.get("eventId"));
  const eventId = eventIdValue ? Number(eventIdValue) : null;
  const event = eventId ? listEvents().find((item) => item.id === eventId) : null;

  if (!expenseTitle || !category || !amount || !expenseDate) {
    return {
      ...initialState,
      error: "Title, category, amount, and expense date are required.",
    };
  }

  createExpense({
    eventId,
    eventName: event?.eventName ?? null,
    expenseTitle,
    category,
    amount,
    expenseDate,
    paymentMode: normalizeString(formData.get("paymentMode")) || null,
    status: normalizeString(formData.get("status")) || "recorded",
    vendorName: normalizeString(formData.get("vendorName")) || null,
    referenceNumber: normalizeString(formData.get("referenceNumber")) || null,
    description: normalizeString(formData.get("description")) || null,
    createdBy: session.user.name ?? "unknown",
  });

  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "create_expense",
    targetUsername: expenseTitle,
    details: amount,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Recorded expense "${expenseTitle}".`,
  };
}

export async function updateExpenseAction(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const session = await requireAdmin();
  const expenseId = Number(normalizeString(formData.get("expenseId")));
  const expenseTitle = normalizeString(formData.get("expenseTitle"));
  const category = normalizeString(formData.get("category"));
  const amount = normalizeString(formData.get("amount"));
  const expenseDate = normalizeString(formData.get("expenseDate"));
  const eventIdValue = normalizeString(formData.get("eventId"));
  const eventId = eventIdValue ? Number(eventIdValue) : null;
  const event = eventId ? listEvents().find((item) => item.id === eventId) : null;
  const existing = listExpenses().find((item) => item.id === expenseId);

  if (Number.isNaN(expenseId) || !existing) {
    return { ...initialState, error: "Expense entry not found." };
  }

  if (!expenseTitle || !category || !amount || !expenseDate) {
    return {
      ...initialState,
      error: "Title, category, amount, and expense date are required.",
    };
  }

  updateExpense({
    id: expenseId,
    eventId,
    eventName: event?.eventName ?? existing.eventName ?? null,
    expenseTitle,
    category,
    amount,
    expenseDate,
    paymentMode: normalizeString(formData.get("paymentMode")) || null,
    status: normalizeString(formData.get("status")) || "recorded",
    vendorName: normalizeString(formData.get("vendorName")) || null,
    referenceNumber: normalizeString(formData.get("referenceNumber")) || null,
    description: normalizeString(formData.get("description")) || null,
  });

  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "update_expense",
    targetUsername: expenseTitle,
    details: amount,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `Updated expense "${expenseTitle}".`,
  };
}

export async function deleteExpenseAction(formData: FormData) {
  const session = await requireAdmin();
  const expenseId = Number(normalizeString(formData.get("expenseId")));
  const expense = listExpenses().find((item) => item.id === expenseId);

  if (Number.isNaN(expenseId) || !expense) {
    throw new Error("Expense entry not found.");
  }

  deleteExpense(expenseId);
  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "delete_expense",
    targetUsername: expense.expenseTitle,
    details: expense.amount,
  });
  revalidatePath("/dashboard");
}
