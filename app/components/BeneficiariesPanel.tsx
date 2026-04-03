"use client";

import { useActionState, useState } from "react";

import {
  createBeneficiaryAction,
  deleteBeneficiaryAction,
  type BeneficiaryActionState,
  updateBeneficiaryAction,
} from "../dashboard/beneficiary-actions";
import type { Beneficiary } from "@/lib/beneficiaries";
import type { AppEvent } from "@/lib/events";
import {
  internalCardTitleClassName,
  internalCardClassName,
  internalFormInputSoftClassName,
  internalHeroSectionClassName,
  internalMetricCardClassName,
  internalMutedTextClassName,
  internalPanelEyebrowClassName,
  internalPrimaryButtonClassName,
  internalSecondaryButtonClassName,
  internalDangerButtonClassName,
  internalTableHeaderClassName,
  internalTableRowClassName,
} from "./internalTheme";

const inputClassName = internalFormInputSoftClassName;

const cardClassName = internalCardClassName;

function StateMessage({ state }: { state: BeneficiaryActionState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        state.error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {state.error || state.success}
    </div>
  );
}

export default function BeneficiariesPanel({
  events,
  beneficiaries,
}: {
  events: AppEvent[];
  beneficiaries: Beneficiary[];
}) {
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<number | null>(
    null,
  );
  const [editingBeneficiary, setEditingBeneficiary] = useState(false);
  const [createState, createAction, createPending] = useActionState<
    BeneficiaryActionState,
    FormData
  >(createBeneficiaryAction, { error: "", success: "" });
  const [updateState, updateAction, updatePending] = useActionState<
    BeneficiaryActionState,
    FormData
  >(updateBeneficiaryAction, { error: "", success: "" });

  const selectedBeneficiary =
    beneficiaries.find((item) => item.id === selectedBeneficiaryId) ?? null;

  const toggleView = (beneficiaryId: number) => {
    setEditingBeneficiary(false);
    setSelectedBeneficiaryId((current) =>
      current === beneficiaryId ? null : beneficiaryId,
    );
  };

  return (
    <div className="space-y-4">
      <section className={internalHeroSectionClassName}>
        <p className={internalPanelEyebrowClassName}>
          Beneficiary operations
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#4b302a]">
          Beneficiaries
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7a5a4d]">
          Register people supported by NGO programs and link them to events for
          clearer tracking, reporting, and follow-up.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { label: "Entries", value: String(beneficiaries.length) },
            {
              label: "Linked to events",
              value: String(
                beneficiaries.filter((item) => item.eventId !== null).length,
              ),
            },
            {
              label: "Support types",
              value: String(new Set(beneficiaries.map((item) => item.supportType)).size),
            },
          ].map((item) => (
            <div
              key={item.label}
              className={internalMetricCardClassName}
            >
              <p className={internalMutedTextClassName}>{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[#4b302a]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClassName}>
        <div className="mb-4">
          <p className={internalPanelEyebrowClassName}>
            Add beneficiary
          </p>
          <h3 className={internalCardTitleClassName}>
            Basic beneficiary information
          </h3>
        </div>

        <form action={createAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Full Name
              </span>
              <input name="fullName" className={inputClassName} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Phone Number
              </span>
              <input name="phoneNumber" className={inputClassName} />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Age
              </span>
              <input name="age" className={inputClassName} />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Gender
              </span>
              <select name="gender" className={inputClassName} defaultValue="">
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Support Type
              </span>
              <select name="supportType" className={inputClassName} defaultValue="" required>
                <option value="">Select support type</option>
                <option value="Medical Support">Medical Support</option>
                <option value="Food Support">Food Support</option>
                <option value="Education Support">Education Support</option>
                <option value="Financial Support">Financial Support</option>
                <option value="Blood Support">Blood Support</option>
                <option value="Clothing Support">Clothing Support</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Linked Event
              </span>
              <select name="eventId" className={inputClassName} defaultValue="">
                <option value="">No linked event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2 xl:col-span-3">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Location
              </span>
              <input
                name="location"
                className={inputClassName}
                placeholder="Village, city, area, or service location"
              />
            </label>
            <label className="block md:col-span-2 xl:col-span-3">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Notes
              </span>
              <textarea name="notes" className={`${inputClassName} min-h-24`} />
            </label>
          </div>

          <StateMessage state={createState} />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createPending}
              className={internalPrimaryButtonClassName}
            >
              {createPending ? "Saving..." : "Save beneficiary"}
            </button>
          </div>
        </form>
      </section>

      <section className={cardClassName}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={internalPanelEyebrowClassName}>
              Beneficiary register
            </p>
            <h3 className={internalCardTitleClassName}>
              All beneficiary entries
            </h3>
          </div>
          <p className={internalMutedTextClassName}>
            Total records: {beneficiaries.length}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className={internalTableHeaderClassName}>
                <th className="px-3 py-3 font-semibold">Beneficiary</th>
                <th className="px-3 py-3 font-semibold">Support</th>
                <th className="px-3 py-3 font-semibold">Linked Event</th>
                <th className="px-3 py-3 font-semibold">Location</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.length === 0 ? (
                <tr>
                  <td className={`px-3 py-4 ${internalMutedTextClassName}`} colSpan={5}>
                    No beneficiary entries recorded yet.
                  </td>
                </tr>
              ) : (
                beneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className={internalTableRowClassName}>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-[#4b302a]">
                        {beneficiary.fullName}
                      </p>
                      <p className="mt-1 text-xs text-[#7a5a4d]">
                        {beneficiary.phoneNumber || "No phone"}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">
                      {beneficiary.supportType}
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">
                      {beneficiary.eventName || "General support"}
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">
                      {beneficiary.location || "Not set"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleView(beneficiary.id)}
                          className={`${internalSecondaryButtonClassName} px-3 py-1.5 text-xs`}
                        >
                          {selectedBeneficiaryId === beneficiary.id ? "Hide" : "View"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBeneficiaryId(beneficiary.id);
                            setEditingBeneficiary((current) =>
                              selectedBeneficiaryId === beneficiary.id ? !current : true,
                            );
                          }}
                          className={`${internalPrimaryButtonClassName} px-3 py-1.5 text-xs`}
                        >
                          Update
                        </button>
                        <form
                          action={deleteBeneficiaryAction}
                          onSubmit={(event) => {
                            if (
                              !window.confirm(
                                `Delete beneficiary "${beneficiary.fullName}"?`,
                              )
                            ) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input
                            type="hidden"
                            name="beneficiaryId"
                            value={beneficiary.id}
                          />
                          <button
                            type="submit"
                            className={`${internalDangerButtonClassName} px-3 py-1.5 text-xs`}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedBeneficiary && (
        <section className={cardClassName}>
          <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
              <p className={internalPanelEyebrowClassName}>
                Beneficiary details
              </p>
              <h3 className={internalCardTitleClassName}>
                {selectedBeneficiary.fullName}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setEditingBeneficiary((current) => !current)}
              className={internalSecondaryButtonClassName}
            >
              {editingBeneficiary ? "Close update" : "Update beneficiary"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Phone", selectedBeneficiary.phoneNumber || "Not provided"],
              ["Age", selectedBeneficiary.age || "Not provided"],
              ["Gender", selectedBeneficiary.gender || "Not provided"],
              ["Support Type", selectedBeneficiary.supportType],
              ["Linked Event", selectedBeneficiary.eventName || "General support"],
              ["Location", selectedBeneficiary.location || "Not provided"],
              ["Notes", selectedBeneficiary.notes || "No notes"],
            ].map(([label, value]) => (
              <div
                key={label}
                className={internalMetricCardClassName}
              >
                <p className={internalPanelEyebrowClassName}>
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#7a5a4d]">{value}</p>
              </div>
            ))}
          </div>

          {editingBeneficiary && (
            <form action={updateAction} className="mt-6 space-y-4">
              <input
                type="hidden"
                name="beneficiaryId"
                value={selectedBeneficiary.id}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Full Name
                  </span>
                  <input
                    name="fullName"
                    className={inputClassName}
                    defaultValue={selectedBeneficiary.fullName}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Phone Number
                  </span>
                  <input
                    name="phoneNumber"
                    className={inputClassName}
                    defaultValue={selectedBeneficiary.phoneNumber ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Age
                  </span>
                  <input
                    name="age"
                    className={inputClassName}
                    defaultValue={selectedBeneficiary.age ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Gender
                  </span>
                  <select
                    name="gender"
                    className={inputClassName}
                    defaultValue={selectedBeneficiary.gender ?? ""}
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Support Type
                  </span>
                  <select
                    name="supportType"
                    className={inputClassName}
                    defaultValue={selectedBeneficiary.supportType}
                    required
                  >
                    <option value="Medical Support">Medical Support</option>
                    <option value="Food Support">Food Support</option>
                    <option value="Education Support">Education Support</option>
                    <option value="Financial Support">Financial Support</option>
                    <option value="Blood Support">Blood Support</option>
                    <option value="Clothing Support">Clothing Support</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Linked Event
                  </span>
                  <select
                    name="eventId"
                    className={inputClassName}
                    defaultValue={selectedBeneficiary.eventId?.toString() ?? ""}
                  >
                    <option value="">No linked event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block md:col-span-2 xl:col-span-3">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Location
                  </span>
                  <input
                    name="location"
                    className={inputClassName}
                    defaultValue={selectedBeneficiary.location ?? ""}
                  />
                </label>
                <label className="block md:col-span-2 xl:col-span-3">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Notes
                  </span>
                  <textarea
                    name="notes"
                    className={`${inputClassName} min-h-24`}
                    defaultValue={selectedBeneficiary.notes ?? ""}
                  />
                </label>
              </div>

              <StateMessage state={updateState} />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatePending}
                  className={internalPrimaryButtonClassName}
                >
                  {updatePending ? "Updating..." : "Update beneficiary"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
