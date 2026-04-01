"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { requireActiveAdminSession } from "@/lib/auth";
import {
  createAuditLog,
  createUser,
  deleteUser,
  getUserByUsername,
  resetUserPassword,
  updateUserStatus,
} from "@/lib/users";

export type UserManagementState = {
  error: string;
  success: string;
};

const initialState: UserManagementState = {
  error: "",
  success: "",
};

async function requireAdmin() {
  const { session } = await requireActiveAdminSession();
  return session;
}

function normalizeUsername(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function createUserAction(
  _prevState: UserManagementState,
  formData: FormData,
): Promise<UserManagementState> {
  const session = await requireAdmin();

  const username = normalizeUsername(formData.get("username")).toLowerCase();
  const password = normalizePassword(formData.get("password"));
  const role = normalizeUsername(formData.get("role")) || "admin";

  if (!username || !password) {
    return { ...initialState, error: "Username and password are required." };
  }

  if (password.length < 8) {
    return {
      ...initialState,
      error: "Password must be at least 8 characters long.",
    };
  }

  if (getUserByUsername(username)) {
    return { ...initialState, error: "That username already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  createUser({ username, passwordHash, role });
  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "create_user",
    targetUsername: username,
    details: `role=${role}`,
  });
  revalidatePath("/dashboard");

  return { ...initialState, success: `Created user "${username}".` };
}

export async function resetUserPasswordAction(
  _prevState: UserManagementState,
  formData: FormData,
): Promise<UserManagementState> {
  const session = await requireAdmin();

  const username = normalizeUsername(formData.get("username")).toLowerCase();
  const password = normalizePassword(formData.get("password"));
  const currentPassword = normalizePassword(formData.get("currentPassword"));

  if (!username || !password) {
    return { ...initialState, error: "Username and new password are required." };
  }

  if (password.length < 8) {
    return {
      ...initialState,
      error: "New password must be at least 8 characters long.",
    };
  }

  const user = getUserByUsername(username);
  if (!user) {
    return { ...initialState, error: "User not found." };
  }

  if (session.user.name === username) {
    if (!currentPassword) {
      return {
        ...initialState,
        error: "Current password is required when resetting your own account.",
      };
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!currentPasswordMatches) {
      return {
        ...initialState,
        error: "Current password is incorrect.",
      };
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  resetUserPassword({ username, passwordHash });
  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "reset_password",
    targetUsername: username,
    details:
      session.user.name === username
        ? "self-service password reset"
        : "admin password reset",
  });
  revalidatePath("/dashboard");

  return { ...initialState, success: `Reset password for "${username}".` };
}

export async function toggleUserStatusAction(
  _prevState: UserManagementState,
  formData: FormData,
): Promise<UserManagementState> {
  const session = await requireAdmin();

  const username = normalizeUsername(formData.get("username")).toLowerCase();
  const status = normalizeUsername(formData.get("status"));

  if (!username || !["active", "inactive"].includes(status)) {
    return { ...initialState, error: "Invalid user status request." };
  }

  if (session.user.name === username) {
    return {
      ...initialState,
      error: "You cannot deactivate your own account while signed in.",
    };
  }

  if (!getUserByUsername(username)) {
    return { ...initialState, error: "User not found." };
  }

  updateUserStatus({
    username,
    status: status as "active" | "inactive",
  });
  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: status === "inactive" ? "deactivate_user" : "reactivate_user",
    targetUsername: username,
  });
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: `${status === "inactive" ? "Deactivated" : "Reactivated"} "${username}".`,
  };
}

export async function deleteUserAction(
  _prevState: UserManagementState,
  formData: FormData,
): Promise<UserManagementState> {
  const session = await requireAdmin();

  const username = normalizeUsername(formData.get("username")).toLowerCase();

  if (!username) {
    return { ...initialState, error: "Username is required." };
  }

  if (session.user.name === username) {
    return {
      ...initialState,
      error: "You cannot delete your own account while signed in.",
    };
  }

  if (!getUserByUsername(username)) {
    return { ...initialState, error: "User not found." };
  }

  deleteUser(username);
  createAuditLog({
    actorUsername: session.user.name ?? "unknown",
    action: "delete_user",
    targetUsername: username,
  });
  revalidatePath("/dashboard");

  return { ...initialState, success: `Deleted "${username}".` };
}
