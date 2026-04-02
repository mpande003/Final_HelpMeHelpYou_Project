"use client";

import { useActionState } from "react";

import { createUserAction, resetUserPasswordAction } from "./actions";
import UserManagementRowActions from "./UserManagementRowActions";
import {
  internalCardTitleClassName,
  internalFormInputClassName,
  internalLabelClassName,
  internalMetricCardClassName,
  internalMutedTextClassName,
  internalPanelEyebrowClassName,
  internalPrimaryButtonClassName,
  internalSectionClassName,
  internalSecondaryButtonClassName,
  internalTableHeaderClassName,
  internalTableRowClassName,
  internalHeroSectionClassName,
} from "../components/internalTheme";

type UserSummary = {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuditLogEntry = {
  id: number;
  actorUsername: string;
  action: string;
  targetUsername: string;
  details: string | null;
  createdAt: string;
};

type UserManagementPanelProps = {
  users: UserSummary[];
  currentUsername: string;
  auditLogs: AuditLogEntry[];
};

const userManagementInitialState = {
  error: "",
  success: "",
};

function StatusMessage({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  if (error) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error}
      </p>
    );
  }

  if (success) {
    return (
      <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        {success}
      </p>
    );
  }

  return null;
}

function formatActionLabel(action: string) {
  return action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function UserManagementPanel({
  users,
  currentUsername,
  auditLogs,
}: UserManagementPanelProps) {
  const [createState, createAction, createPending] = useActionState(
    createUserAction,
    userManagementInitialState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetUserPasswordAction,
    userManagementInitialState,
  );

  const activeUsers = users.filter((user) => user.status === "active").length;

  return (
    <div className="space-y-6">
      <section className={internalHeroSectionClassName}>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa725e]">
          Access control
        </p>
        <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#241815]">
              User Management
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6d554a]">
              Create admin users, reset credentials, manage account status, and
              review a clear audit trail from one operational workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total admins", value: users.length },
              { label: "Active accounts", value: activeUsers },
              { label: "Audit events", value: auditLogs.length },
            ].map((item) => (
              <div
                key={item.label}
                className={internalMetricCardClassName}
              >
                <p className={internalMutedTextClassName}>{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-[#4b302a]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={internalSectionClassName}>
          <p className={internalPanelEyebrowClassName}>
            Create admin
          </p>
          <h3 className={internalCardTitleClassName}>
            Add a new account
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#7a5a4d]">
            New users can sign in immediately after creation and will appear in
            the access table below.
          </p>

          <form action={createAction} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="create-username"
                className={internalLabelClassName}
              >
                Username <span className="required-indicator">*</span>
              </label>
              <input
                id="create-username"
                name="username"
                type="text"
                className={internalFormInputClassName}
                placeholder="new-admin"
                required
              />
            </div>

            <div>
              <label
                htmlFor="create-password"
                className={internalLabelClassName}
              >
                Password <span className="required-indicator">*</span>
              </label>
              <input
                id="create-password"
                name="password"
                type="password"
                className={internalFormInputClassName}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label
                htmlFor="create-role"
                className={internalLabelClassName}
              >
                Role
              </label>
              <select
                id="create-role"
                name="role"
                className={internalFormInputClassName}
                defaultValue="admin"
              >
                <option value="admin">Admin</option>
              </select>
            </div>

            <StatusMessage
              error={createState.error}
              success={createState.success}
            />

            <button
              type="submit"
              disabled={createPending}
              className={internalPrimaryButtonClassName}
            >
              {createPending ? "Creating..." : "Create User"}
            </button>
          </form>
        </section>

        <section className={internalSectionClassName}>
          <p className={internalPanelEyebrowClassName}>
            Credential recovery
          </p>
          <h3 className={internalCardTitleClassName}>
            Reset a password
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#7a5a4d]">
            Replace credentials for any account. Your own account requires the
            current password as confirmation.
          </p>

          <form action={resetAction} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="reset-username"
                className={internalLabelClassName}
              >
                Username <span className="required-indicator">*</span>
              </label>
              <select
                id="reset-username"
                name="username"
                className={internalFormInputClassName}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select a user
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reset-password"
                className={internalLabelClassName}
              >
                New Password <span className="required-indicator">*</span>
              </label>
              <input
                id="reset-password"
                name="password"
                type="password"
                className={internalFormInputClassName}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label
                htmlFor="reset-current-password"
                className={internalLabelClassName}
              >
                Current Password
              </label>
              <input
                id="reset-current-password"
                name="currentPassword"
                type="password"
                className={internalFormInputClassName}
                placeholder={`Only required for ${currentUsername}`}
              />
            </div>

            <StatusMessage
              error={resetState.error}
              success={resetState.success}
            />

            <button
              type="submit"
              disabled={resetPending}
              className={internalSecondaryButtonClassName}
            >
              {resetPending ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </section>
      </div>

      <section className={internalSectionClassName}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={internalPanelEyebrowClassName}>
              Access table
            </p>
            <h3 className={internalCardTitleClassName}>
              Existing Users
            </h3>
          </div>
          <p className={internalMutedTextClassName}>
            Status changes and deletions are available inline for fast admin
            control.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className={internalTableHeaderClassName}>
                <th className="px-3 py-3 font-semibold">Username</th>
                <th className="px-3 py-3 font-semibold">Role</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Created</th>
                <th className="px-3 py-3 font-semibold">Updated</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={internalTableRowClassName}>
                  <td className="px-3 py-4 font-semibold text-[#4b302a]">
                    {user.username}
                    {user.username === currentUsername && (
                      <span className="ml-2 rounded-full bg-[#fff7cf] px-2.5 py-1 text-xs font-medium text-[#fa5c5c]">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-[#7a5a4d]">{user.role}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === "active"
                          ? "bg-[#fff7cf] text-[#fa5c5c]"
                          : "bg-[#fff1e6] text-[#fd8a6b]"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[#7a5a4d]">
                    {user.createdAt ?? "-"}
                  </td>
                  <td className="px-3 py-4 text-[#7a5a4d]">
                    {user.updatedAt ?? "-"}
                  </td>
                  <td className="px-3 py-4">
                    <UserManagementRowActions
                      username={user.username}
                      status={user.status}
                      isCurrentUser={user.username === currentUsername}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={internalSectionClassName}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={internalPanelEyebrowClassName}>
              Compliance trail
            </p>
            <h3 className={internalCardTitleClassName}>
              Audit Log
            </h3>
          </div>
          <p className={internalMutedTextClassName}>
            All key account actions are captured for visibility and review.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className={internalTableHeaderClassName}>
                <th className="px-3 py-3 font-semibold">Time</th>
                <th className="px-3 py-3 font-semibold">Actor</th>
                <th className="px-3 py-3 font-semibold">Action</th>
                <th className="px-3 py-3 font-semibold">Target</th>
                <th className="px-3 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td className={`px-3 py-4 ${internalMutedTextClassName}`} colSpan={5}>
                    No audit events yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className={internalTableRowClassName}>
                    <td className="px-3 py-4 text-[#7a5a4d]">{log.createdAt}</td>
                    <td className="px-3 py-4 font-medium text-[#4b302a]">
                      {log.actorUsername}
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">
                      {formatActionLabel(log.action)}
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">
                      {log.targetUsername}
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">
                      {log.details ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
