"use client";

import { useActionState } from "react";

import { deleteUserAction, toggleUserStatusAction } from "./actions";

type UserManagementRowActionsProps = {
  username: string;
  status: string;
  isCurrentUser: boolean;
};

const userManagementInitialState = {
  error: "",
  success: "",
};

export default function UserManagementRowActions({
  username,
  status,
  isCurrentUser,
}: UserManagementRowActionsProps) {
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleUserStatusAction,
    userManagementInitialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteUserAction,
    userManagementInitialState,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={toggleAction}>
        <input type="hidden" name="username" value={username} />
        <input
          type="hidden"
          name="status"
          value={status === "active" ? "inactive" : "active"}
        />
        <button
          type="submit"
          disabled={togglePending || isCurrentUser}
          className="rounded-full border border-[#decfc4] bg-white px-3 py-1.5 text-xs font-medium text-[#34231d] transition hover:bg-[#faf4ef] disabled:opacity-50"
        >
          {togglePending
            ? "Saving..."
            : status === "active"
              ? "Deactivate"
              : "Reactivate"}
        </button>
      </form>

      <form action={deleteAction}>
        <input type="hidden" name="username" value={username} />
        <button
          type="submit"
          disabled={deletePending || isCurrentUser}
          className="rounded-full border border-[#f0d3cf] bg-[#fff6f5] px-3 py-1.5 text-xs font-medium text-[#a52b2f] transition hover:bg-[#ffeceb] disabled:opacity-50"
        >
          {deletePending ? "Deleting..." : "Delete"}
        </button>
      </form>

      {(toggleState.error || toggleState.success) && (
        <p className="text-xs text-[#7a6257]">
          {toggleState.error || toggleState.success}
        </p>
      )}

      {(deleteState.error || deleteState.success) && (
        <p className="text-xs text-[#7a6257]">
          {deleteState.error || deleteState.success}
        </p>
      )}
    </div>
  );
}
