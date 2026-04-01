"use client";

import { useActionState } from "react";

import { createUserAction, resetUserPasswordAction } from "./actions";
import UserManagementRowActions from "./UserManagementRowActions";

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
      <section className="rounded-[2rem] border border-[#ead7cb] bg-[linear-gradient(135deg,#fffaf7_0%,#fff4ef_58%,#f7e7de_100%)] p-7 shadow-[0_18px_50px_rgba(94,52,33,0.08)]">
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
                className="rounded-2xl border border-[#ead8cb] bg-white/82 px-4 py-4 text-sm"
              >
                <p className="text-[#88695d]">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-[#251916]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
            Create admin
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
            Add a new account
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#71594e]">
            New users can sign in immediately after creation and will appear in
            the access table below.
          </p>

          <form action={createAction} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="create-username"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]"
              >
                Username
              </label>
              <input
                id="create-username"
                name="username"
                type="text"
                className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
                placeholder="new-admin"
                required
              />
            </div>

            <div>
              <label
                htmlFor="create-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]"
              >
                Password
              </label>
              <input
                id="create-password"
                name="password"
                type="password"
                className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label
                htmlFor="create-role"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]"
              >
                Role
              </label>
              <select
                id="create-role"
                name="role"
                className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
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
              className="rounded-full bg-[#7a1418] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023] disabled:opacity-60"
            >
              {createPending ? "Creating..." : "Create User"}
            </button>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
            Credential recovery
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
            Reset a password
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#71594e]">
            Replace credentials for any account. Your own account requires the
            current password as confirmation.
          </p>

          <form action={resetAction} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="reset-username"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]"
              >
                Username
              </label>
              <select
                id="reset-username"
                name="username"
                className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
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
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]"
              >
                New Password
              </label>
              <input
                id="reset-password"
                name="password"
                type="password"
                className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label
                htmlFor="reset-current-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]"
              >
                Current Password
              </label>
              <input
                id="reset-current-password"
                name="currentPassword"
                type="password"
                className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
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
              className="rounded-full bg-[#365fc9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#274fb8] disabled:opacity-60"
            >
              {resetPending ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
              Access table
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
              Existing Users
            </h3>
          </div>
          <p className="text-sm text-[#71594e]">
            Status changes and deletions are available inline for fast admin
            control.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#efe2d8] text-[#8d6f62]">
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
                <tr key={user.id} className="border-b border-[#f5ece5]">
                  <td className="px-3 py-4 font-semibold text-[#241815]">
                    {user.username}
                    {user.username === currentUsername && (
                      <span className="ml-2 rounded-full bg-[#fef2e9] px-2.5 py-1 text-xs font-medium text-[#9b5a2a]">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-[#6f564b]">{user.role}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === "active"
                          ? "bg-[#edf8ef] text-[#2d7a43]"
                          : "bg-[#fff3e9] text-[#9b5c1c]"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[#6f564b]">
                    {user.createdAt ?? "-"}
                  </td>
                  <td className="px-3 py-4 text-[#6f564b]">
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

      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
              Compliance trail
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
              Audit Log
            </h3>
          </div>
          <p className="text-sm text-[#71594e]">
            All key account actions are captured for visibility and review.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#efe2d8] text-[#8d6f62]">
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
                  <td className="px-3 py-4 text-[#7b6358]" colSpan={5}>
                    No audit events yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#f5ece5]">
                    <td className="px-3 py-4 text-[#6f564b]">{log.createdAt}</td>
                    <td className="px-3 py-4 font-medium text-[#241815]">
                      {log.actorUsername}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {formatActionLabel(log.action)}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {log.targetUsername}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
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
