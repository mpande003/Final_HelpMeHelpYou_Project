"use client";

import { useActionState, useMemo, useState } from "react";

import {
  createBloodDonorAction,
  createBloodRequestAction,
  deleteBloodDonorAction,
  deleteBloodRequestAction,
  fulfillBloodRequestAction,
  type BloodActionState,
  updateBloodDonorAction,
  updateBloodRequestAction,
  verifyBloodRequestAction,
} from "../dashboard/blood-actions";
import type { BloodDonor, BloodRequest } from "@/lib/blood";
import type { AppEvent } from "@/lib/events";
import {
  internalHeroSectionClassName,
  internalLabelClassName,
  internalMetricCardClassName,
  internalMutedTextClassName,
  internalPanelEyebrowClassName,
  internalFormInputClassName,
  internalSectionClassName,
  internalSectionDescriptionClassName,
  internalSectionTitleClassName,
  internalDangerButtonClassName,
} from "./internalTheme";

type BloodDonationPanelProps = {
  events: AppEvent[];
  donors: BloodDonor[];
  requests: BloodRequest[];
};

const inputClassName = internalFormInputClassName;

const sectionClassName = internalSectionClassName;

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h3 className={internalSectionTitleClassName}>{title}</h3>
      <p className={internalSectionDescriptionClassName}>{description}</p>
    </div>
  );
}

function StateMessage({ state }: { state: BloodActionState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
        state.error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {state.error || state.success}
    </div>
  );
}

export default function BloodDonationPanel({
  events,
  donors,
  requests,
}: BloodDonationPanelProps) {
  const bloodDonationEvents = events.filter((event) =>
    event.eventType.toLowerCase().includes("blood donation"),
  );
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState<number | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [editingDonor, setEditingDonor] = useState(false);
  const [editingRequest, setEditingRequest] = useState(false);
  const [donorState, donorAction, donorPending] = useActionState<
    BloodActionState,
    FormData
  >(createBloodDonorAction, {
    error: "",
    success: "",
  });
  const [requestState, requestAction, requestPending] = useActionState<
    BloodActionState,
    FormData
  >(createBloodRequestAction, {
    error: "",
    success: "",
  });
  const selectedDonationEvent = useMemo(
    () =>
      bloodDonationEvents.find(
        (event) => event.id.toString() === selectedEventId,
      ) ?? null,
    [bloodDonationEvents, selectedEventId],
  );
  const selectedDonor =
    donors.find((donor) => donor.id === selectedDonorId) ?? null;
  const selectedRequest =
    requests.find((request) => request.id === selectedRequestId) ?? null;
  const [updateDonorState, updateDonorAction, updateDonorPending] =
    useActionState<BloodActionState, FormData>(updateBloodDonorAction, {
      error: "",
      success: "",
    });
  const [updateRequestState, updateRequestAction, updateRequestPending] =
    useActionState<BloodActionState, FormData>(updateBloodRequestAction, {
      error: "",
      success: "",
    });

  const toggleDonorView = (donorId: number) => {
    setEditingDonor(false);
    setSelectedDonorId((current) => (current === donorId ? null : donorId));
  };

  const toggleRequestView = (requestId: number) => {
    setEditingRequest(false);
    setSelectedRequestId((current) => (current === requestId ? null : requestId));
  };

  return (
    <div className="space-y-6">
      <section className={internalHeroSectionClassName}>
        <p className={internalPanelEyebrowClassName}>
          Blood donation workflow
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#4b302a]">
          Camp donors, blood bank collaboration, and relative support
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-[#7a5a4d]">
          Register donors against blood donation camps, allocate them to partner
          blood banks, then manage emergency blood requests for donor relatives
          through verification and fulfillment.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Blood donation events",
              value: String(bloodDonationEvents.length),
              note: "Campaign events marked as blood donation",
            },
            {
              label: "Registered donors",
              value: String(donors.length),
              note: "Donors allocated to a blood bank",
            },
            {
              label: "Requests pending verification",
              value: String(
                requests.filter((request) => request.verificationStatus === "pending")
                  .length,
              ),
              note: "Relative claims awaiting review",
            },
            {
              label: "Fulfilled requests",
              value: String(
                requests.filter((request) => request.fulfillmentStatus === "fulfilled")
                  .length,
              ),
              note: "Emergency support completed",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={internalMetricCardClassName}
            >
              <p className={internalMutedTextClassName}>{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[#4b302a]">
                {item.value}
              </p>
              <p className="mt-2 text-xs text-[#7a5a4d]">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={sectionClassName}>
          <SectionHeader
            title="Blood Donor Registration and Blood Bank Allocation"
            description="Use this after a blood donation event to register the donor and the partner blood bank."
          />
          <form action={donorAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={internalLabelClassName}>
                  Blood Donation Event
                </span>
                <select
                  name="eventId"
                  className={inputClassName}
                  value={selectedEventId}
                  onChange={(event) => setSelectedEventId(event.target.value)}
                >
                  <option value="">Select blood donation event</option>
                  {bloodDonationEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Donor Name
                </span>
                <input name="donorName" className={inputClassName} required />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Donor Phone
                </span>
                <input name="donorPhone" className={inputClassName} required />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Blood Group
                </span>
                <select name="bloodGroup" className={inputClassName} required defaultValue="">
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Blood Bank Name
                </span>
                <input name="bloodBankName" className={inputClassName} required />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Blood Bank Contact
                </span>
                <input name="bloodBankContact" className={inputClassName} />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Age
                </span>
                <input name="age" className={inputClassName} />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Gender
                </span>
                <input name="gender" className={inputClassName} />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Donation Date
                </span>
                <input
                  type="date"
                  name="donationDate"
                  className={inputClassName}
                  value={selectedDonationEvent?.startDate ?? ""}
                  readOnly
                  required
                />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Units Donated
                </span>
                <input name="unitsDonated" className={inputClassName} />
              </label>
              <label className="block md:col-span-2">
                <span className={internalLabelClassName}>
                  Address
                </span>
                <input name="address" className={inputClassName} />
              </label>
              <label className="block">
                <span className={internalLabelClassName}>
                  Donor ID / Card Number
                </span>
                <input name="donorIdNumber" className={inputClassName} />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#eadbd0] bg-[#fbf6f2] px-4 py-4 text-sm text-[#5b463d]">
                <input
                  type="checkbox"
                  name="relativeSupportEligible"
                  defaultChecked
                  className="h-4 w-4"
                />
                <span>Eligible for donor-relative blood support if needed</span>
              </label>
              <label className="block md:col-span-2">
                <span className={internalLabelClassName}>
                  Notes
                </span>
                <textarea name="notes" className={`${inputClassName} min-h-24`} />
              </label>
            </div>

            <StateMessage state={donorState} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={donorPending}
                className="rounded-full bg-[#7a1418] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023] disabled:opacity-60"
              >
                {donorPending ? "Saving donor..." : "Register donor"}
              </button>
            </div>
          </form>
        </section>

        <section className={sectionClassName}>
          <SectionHeader
            title="Emergency Blood Request Raised"
            description="Raise a request when a donor's relative needs blood, then verify and fulfill it."
          />
          <form action={requestAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Linked Donor
                </span>
                <select name="donorId" className={inputClassName} defaultValue="">
                  <option value="">Select donor</option>
                  {donors.map((donor) => (
                    <option key={donor.id} value={donor.id}>
                      {donor.donorName} · {donor.bloodGroup}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Requester Name
                </span>
                <input name="requesterName" className={inputClassName} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Requester Phone
                </span>
                <input name="requesterPhone" className={inputClassName} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Patient Name
                </span>
                <input name="patientName" className={inputClassName} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Relation to Donor
                </span>
                <input name="relationToDonor" className={inputClassName} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Hospital Name
                </span>
                <input name="hospitalName" className={inputClassName} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Blood Group Needed
                </span>
                <select
                  name="bloodGroupNeeded"
                  className={inputClassName}
                  required
                  defaultValue=""
                >
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Units Required
                </span>
                <input name="unitsRequired" className={inputClassName} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Urgency
                </span>
                <select name="urgency" className={inputClassName} defaultValue="">
                  <option value="">Select urgency</option>
                  {["Immediate", "Same Day", "Planned"].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                  Notes
                </span>
                <textarea name="notes" className={`${inputClassName} min-h-24`} />
              </label>
            </div>

            <StateMessage state={requestState} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={requestPending}
                className="rounded-full bg-[#7a1418] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023] disabled:opacity-60"
              >
                {requestPending ? "Raising request..." : "Raise request"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className={sectionClassName}>
        <SectionHeader
          title="Blood Donor Registry"
          description="Donors recorded against camps and allocated to partner blood banks."
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#efe1d6] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.18em] text-[#8f6b5c]">
                <th className="px-4 py-3 font-semibold">Donor</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Blood Bank</th>
                <th className="px-4 py-3 font-semibold">Donation</th>
                <th className="px-4 py-3 font-semibold">Relative Support</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1e7de] text-[#4f3a31]">
              {donors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#7b6358]">
                    No blood donors registered yet.
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#241815]">{donor.donorName}</p>
                      <p className="mt-1 text-xs text-[#7b6358]">
                        {donor.donorPhone} · {donor.bloodGroup}
                      </p>
                    </td>
                    <td className="px-4 py-4">{donor.eventName || "Direct donor entry"}</td>
                    <td className="px-4 py-4">
                      <p>{donor.bloodBankName}</p>
                      <p className="mt-1 text-xs text-[#7b6358]">
                        {donor.bloodBankContact || "No contact"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{donor.donationDate || "Date not set"}</p>
                      <p className="mt-1 text-xs text-[#7b6358]">
                        {donor.unitsDonated || "Units not set"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {donor.relativeSupportEligible ? "Eligible" : "Not eligible"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleDonorView(donor.id)}
                          className="rounded-full border border-[#fec288] bg-white px-3 py-1.5 text-xs font-semibold text-[#7a5a4d] hover:bg-[#fff7cf]"
                        >
                          {selectedDonorId === donor.id ? "Hide" : "View"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDonorId(donor.id);
                            setEditingDonor((current) =>
                              selectedDonorId === donor.id ? !current : true,
                            );
                          }}
                          className="rounded-full bg-[#fff0b8] px-3 py-1.5 text-xs font-semibold text-[#fa5c5c]"
                        >
                          Update
                        </button>
                        <form
                          action={deleteBloodDonorAction}
                          onSubmit={(event) => {
                            if (
                              !window.confirm(`Delete donor ${donor.donorName}?`)
                            ) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="donorId" value={donor.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-[#fff0f0] px-3 py-1.5 text-xs font-semibold text-[#a12628]"
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

      {selectedDonor && (
        <section className={sectionClassName}>
          <SectionHeader
            title="Blood Donor Entry"
            description="View the full donor allocation record and update it when required."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Donor", selectedDonor.donorName],
              ["Phone", selectedDonor.donorPhone],
              ["Blood Group", selectedDonor.bloodGroup],
              ["Event", selectedDonor.eventName || "Direct donor entry"],
              ["Blood Bank", selectedDonor.bloodBankName],
              ["Blood Bank Contact", selectedDonor.bloodBankContact || "Not provided"],
              ["Donation Date", selectedDonor.donationDate || "Not set"],
              ["Units Donated", selectedDonor.unitsDonated || "Not set"],
              ["Address", selectedDonor.address || "Not provided"],
              ["Donor ID", selectedDonor.donorIdNumber || "Not provided"],
              [
                "Relative Support",
                selectedDonor.relativeSupportEligible ? "Eligible" : "Not eligible",
              ],
              ["Notes", selectedDonor.notes || "No notes"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#efe1d6] bg-[#fcf8f5] px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b5c]">
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4f3a31]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setEditingDonor((current) => !current)}
              className="rounded-full border border-[#ead8cb] bg-white px-4 py-2 text-sm font-semibold text-[#5d463c]"
            >
              {editingDonor ? "Close update" : "Update donor"}
            </button>
          </div>

          {editingDonor && (
            <form action={updateDonorAction} className="mt-6 space-y-5">
              <input type="hidden" name="donorId" value={selectedDonor.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Blood Donation Event
                  </span>
                  <select
                    name="eventId"
                    className={inputClassName}
                    defaultValue={selectedDonor.eventId?.toString() ?? ""}
                  >
                    <option value="">Select blood donation event</option>
                    {bloodDonationEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Donor Name
                  </span>
                  <input
                    name="donorName"
                    className={inputClassName}
                    defaultValue={selectedDonor.donorName}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Donor Phone
                  </span>
                  <input
                    name="donorPhone"
                    className={inputClassName}
                    defaultValue={selectedDonor.donorPhone}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Blood Group
                  </span>
                  <select
                    name="bloodGroup"
                    className={inputClassName}
                    defaultValue={selectedDonor.bloodGroup}
                    required
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Blood Bank Name
                  </span>
                  <input
                    name="bloodBankName"
                    className={inputClassName}
                    defaultValue={selectedDonor.bloodBankName}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Blood Bank Contact
                  </span>
                  <input
                    name="bloodBankContact"
                    className={inputClassName}
                    defaultValue={selectedDonor.bloodBankContact ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Age
                  </span>
                  <input
                    name="age"
                    className={inputClassName}
                    defaultValue={selectedDonor.age ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Gender
                  </span>
                  <input
                    name="gender"
                    className={inputClassName}
                    defaultValue={selectedDonor.gender ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Donation Date
                  </span>
                  <input
                    type="date"
                    name="donationDate"
                    className={inputClassName}
                    defaultValue={selectedDonor.donationDate ?? ""}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Units Donated
                  </span>
                  <input
                    name="unitsDonated"
                    className={inputClassName}
                    defaultValue={selectedDonor.unitsDonated ?? ""}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Address
                  </span>
                  <input
                    name="address"
                    className={inputClassName}
                    defaultValue={selectedDonor.address ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Donor ID / Card Number
                  </span>
                  <input
                    name="donorIdNumber"
                    className={inputClassName}
                    defaultValue={selectedDonor.donorIdNumber ?? ""}
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-[#eadbd0] bg-[#fbf6f2] px-4 py-4 text-sm text-[#5b463d]">
                  <input
                    type="checkbox"
                    name="relativeSupportEligible"
                    defaultChecked={selectedDonor.relativeSupportEligible}
                    className="h-4 w-4"
                  />
                  <span>Eligible for donor-relative blood support if needed</span>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Notes
                  </span>
                  <textarea
                    name="notes"
                    className={`${inputClassName} min-h-24`}
                    defaultValue={selectedDonor.notes ?? ""}
                  />
                </label>
              </div>

              <StateMessage state={updateDonorState} />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateDonorPending}
                  className="rounded-full bg-[#7a1418] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023] disabled:opacity-60"
                >
                  {updateDonorPending ? "Updating donor..." : "Update donor"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className={sectionClassName}>
        <SectionHeader
          title="Emergency Requests and Relative Verification"
          description="Track requests from donor relatives through verification and fulfillment."
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#efe1d6] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.18em] text-[#8f6b5c]">
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Donor Link</th>
                <th className="px-4 py-3 font-semibold">Verification</th>
                <th className="px-4 py-3 font-semibold">Fulfillment</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1e7de] text-[#4f3a31]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#7b6358]">
                    No emergency blood requests raised yet.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#241815]">{request.patientName}</p>
                      <p className="mt-1 text-xs text-[#7b6358]">
                        {request.requesterName} · {request.requesterPhone}
                      </p>
                      <p className="mt-1 text-xs text-[#7b6358]">
                        {request.bloodGroupNeeded} · {request.urgency || "Urgency not set"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{request.donorName || "No donor linked"}</p>
                      <p className="mt-1 text-xs text-[#7b6358]">
                        {request.relationToDonor}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          request.verificationStatus === "verified"
                            ? "bg-[#eef8f0] text-[#2f7444]"
                            : "bg-[#fff4e8] text-[#9b5c1c]"
                        }`}
                      >
                        {request.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          request.fulfillmentStatus === "fulfilled"
                            ? "bg-[#eef8f0] text-[#2f7444]"
                            : "bg-[#fff4e8] text-[#9b5c1c]"
                        }`}
                      >
                        {request.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRequestView(request.id)}
                          className="rounded-full border border-[#ead8cb] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d463c]"
                        >
                          {selectedRequestId === request.id ? "Hide" : "View"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequestId(request.id);
                            setEditingRequest((current) =>
                              selectedRequestId === request.id ? !current : true,
                            );
                          }}
                          className="rounded-full bg-[#fff4ef] px-3 py-1.5 text-xs font-semibold text-[#7a1418]"
                        >
                          Update
                        </button>
                        {request.verificationStatus !== "verified" && (
                          <form action={verifyBloodRequestAction}>
                            <input type="hidden" name="requestId" value={request.id} />
                            <button
                              type="submit"
                              className="rounded-full bg-[#eef8f0] px-3 py-1.5 text-xs font-semibold text-[#2f7444]"
                            >
                              Verify
                            </button>
                          </form>
                        )}
                        {request.fulfillmentStatus !== "fulfilled" && (
                          <form action={fulfillBloodRequestAction}>
                            <input type="hidden" name="requestId" value={request.id} />
                            <button
                              type="submit"
                              className="rounded-full bg-[#fff4ef] px-3 py-1.5 text-xs font-semibold text-[#7a1418]"
                            >
                              Fulfill
                            </button>
                          </form>
                        )}
                        <form
                          action={deleteBloodRequestAction}
                          onSubmit={(event) => {
                            if (
                              !window.confirm(
                                `Delete blood request for ${request.patientName}?`,
                              )
                            ) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="requestId" value={request.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-[#fff0f0] px-3 py-1.5 text-xs font-semibold text-[#a12628]"
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

      {selectedRequest && (
        <section className={sectionClassName}>
          <SectionHeader
            title="Emergency Request Entry"
            description="View the full request, update its details, or keep verification and fulfillment current."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Patient", selectedRequest.patientName],
              ["Requester", `${selectedRequest.requesterName} (${selectedRequest.requesterPhone})`],
              ["Donor Link", selectedRequest.donorName || "No donor linked"],
              ["Relation to Donor", selectedRequest.relationToDonor],
              ["Hospital", selectedRequest.hospitalName || "Not provided"],
              ["Blood Group Needed", selectedRequest.bloodGroupNeeded],
              ["Units Required", selectedRequest.unitsRequired || "Not set"],
              ["Urgency", selectedRequest.urgency || "Not set"],
              ["Verification", selectedRequest.verificationStatus],
              ["Fulfillment", selectedRequest.fulfillmentStatus],
              ["Notes", selectedRequest.notes || "No notes"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#efe1d6] bg-[#fcf8f5] px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b5c]">
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4f3a31]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setEditingRequest((current) => !current)}
              className="rounded-full border border-[#ead8cb] bg-white px-4 py-2 text-sm font-semibold text-[#5d463c]"
            >
              {editingRequest ? "Close update" : "Update request"}
            </button>
          </div>

          {editingRequest && (
            <form action={updateRequestAction} className="mt-6 space-y-5">
              <input type="hidden" name="requestId" value={selectedRequest.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Linked Donor
                  </span>
                  <select
                    name="donorId"
                    className={inputClassName}
                    defaultValue={selectedRequest.donorId?.toString() ?? ""}
                  >
                    <option value="">Select donor</option>
                    {donors.map((donor) => (
                      <option key={donor.id} value={donor.id}>
                        {donor.donorName} · {donor.bloodGroup}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Requester Name
                  </span>
                  <input
                    name="requesterName"
                    className={inputClassName}
                    defaultValue={selectedRequest.requesterName}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Requester Phone
                  </span>
                  <input
                    name="requesterPhone"
                    className={inputClassName}
                    defaultValue={selectedRequest.requesterPhone}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Patient Name
                  </span>
                  <input
                    name="patientName"
                    className={inputClassName}
                    defaultValue={selectedRequest.patientName}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Relation to Donor
                  </span>
                  <input
                    name="relationToDonor"
                    className={inputClassName}
                    defaultValue={selectedRequest.relationToDonor}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Hospital Name
                  </span>
                  <input
                    name="hospitalName"
                    className={inputClassName}
                    defaultValue={selectedRequest.hospitalName ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Blood Group Needed
                  </span>
                  <select
                    name="bloodGroupNeeded"
                    className={inputClassName}
                    defaultValue={selectedRequest.bloodGroupNeeded}
                    required
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Units Required
                  </span>
                  <input
                    name="unitsRequired"
                    className={inputClassName}
                    defaultValue={selectedRequest.unitsRequired ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Urgency
                  </span>
                  <select
                    name="urgency"
                    className={inputClassName}
                    defaultValue={selectedRequest.urgency ?? ""}
                  >
                    <option value="">Select urgency</option>
                    {["Immediate", "Same Day", "Planned"].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Verification Status
                  </span>
                  <select
                    name="verificationStatus"
                    className={inputClassName}
                    defaultValue={selectedRequest.verificationStatus}
                  >
                    <option value="pending">pending</option>
                    <option value="verified">verified</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Fulfillment Status
                  </span>
                  <select
                    name="fulfillmentStatus"
                    className={inputClassName}
                    defaultValue={selectedRequest.fulfillmentStatus}
                  >
                    <option value="pending">pending</option>
                    <option value="fulfilled">fulfilled</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                    Notes
                  </span>
                  <textarea
                    name="notes"
                    className={`${inputClassName} min-h-24`}
                    defaultValue={selectedRequest.notes ?? ""}
                  />
                </label>
              </div>

              <StateMessage state={updateRequestState} />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateRequestPending}
                  className="rounded-full bg-[#7a1418] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023] disabled:opacity-60"
                >
                  {updateRequestPending ? "Updating request..." : "Update request"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
