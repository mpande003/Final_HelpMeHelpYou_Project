"use client";

import { useState } from "react";

import VolunteerRegistrationForm from "./VolunteerRegistrationForm";
import {
  approveVolunteerAction,
  assignVolunteerRoleAction,
  deleteVolunteerAction,
} from "../dashboard/volunteer-actions";
import type { AppEvent } from "@/lib/events";
import type { Volunteer } from "@/lib/volunteers";

type VolunteerManagementPanelProps = {
  volunteers: Volunteer[];
  events: AppEvent[];
};

type VolunteerTab = "add" | "view";

const sectionClassName =
  "rounded-[1.65rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VolunteerDetail({
  volunteer,
}: {
  volunteer: Volunteer;
}) {
  const address = [
    volunteer.houseFlatNumber,
    volunteer.streetAreaLocality,
    volunteer.landmark,
    volunteer.villageTownCity,
    volunteer.district,
    volunteer.state,
    volunteer.pinCode,
    volunteer.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        ["Phone", volunteer.phoneNumber],
        ["Email", volunteer.emailAddress || "Not provided"],
        [
          "Emergency Contact",
          volunteer.emergencyContactName
            ? `${volunteer.emergencyContactName} (${volunteer.emergencyContactPhone || "No phone"})`
            : "Not provided",
        ],
        ["Address", address || "Not provided"],
        [
          "Identity",
          volunteer.idType
            ? `${volunteer.idType} - ${volunteer.idNumber || "No number"}`
            : "Not provided",
        ],
        [
          "Education",
          [
            volunteer.highestEducationLevel,
            volunteer.fieldOfStudy,
            volunteer.collegeSchoolName,
          ]
            .filter(Boolean)
            .join(" | ") || "Not provided",
        ],
        ["Occupation", volunteer.currentOccupation || "Not provided"],
        [
          "Interests",
          volunteer.areasOfInterest.join(", ") || "Not provided",
        ],
        ["Skills", volunteer.skills || "Not provided"],
        ["Languages", volunteer.languagesKnown || "Not provided"],
        [
          "Availability",
          `${volunteer.availableDays.join(", ") || "No days"} | ${volunteer.availableTime || "No time"} | ${volunteer.hoursPerWeek || "No hours"} hrs/week | ${volunteer.preferredMode || "No mode"}`,
        ],
        [
          "Previous Experience",
          volunteer.previousVolunteerExperience === "Yes"
            ? `${volunteer.previousOrganizationName || "Organization not set"} | ${volunteer.previousWorkDescription || "No description"}`
            : "No",
        ],
        ["Motivation", volunteer.motivation || "Not provided"],
        [
          "Special Skills / Certifications",
          volunteer.specialSkillsOrCertifications || "Not provided",
        ],
        ["Medical Conditions", volunteer.medicalConditions || "Not provided"],
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
  );
}

export default function VolunteerManagementPanel({
  volunteers,
  events,
}: VolunteerManagementPanelProps) {
  const [tab, setTab] = useState<VolunteerTab>("view");
  const [isEditingVolunteer, setIsEditingVolunteer] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<number | null>(
    volunteers[0]?.id ?? null,
  );

  const selectedVolunteer =
    volunteers.find((volunteer) => volunteer.id === selectedVolunteerId) ?? null;
  const approvedVolunteers = volunteers.filter(
    (volunteer) => volunteer.approvalStatus === "approved",
  );
  const pendingVolunteers = volunteers.length - approvedVolunteers.length;
  const experiencedVolunteers = volunteers.filter(
    (volunteer) => volunteer.previousVolunteerExperience === "Yes",
  ).length;
  const assignedVolunteers = volunteers.filter(
    (volunteer) => volunteer.assignedEventId !== null,
  ).length;

  const toggleVolunteerProfile = (volunteerId: number) => {
    setIsEditingVolunteer(false);
    setSelectedVolunteerId((current) =>
      current === volunteerId ? null : volunteerId,
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#ead7cb] bg-[linear-gradient(135deg,#fffaf7_0%,#fff4ef_58%,#f7e7de_100%)] p-7 shadow-[0_18px_50px_rgba(94,52,33,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa725e]">
              Volunteer operations
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#241815]">
              Volunteer Management
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6d554a]">
              Add volunteers, review full profiles, approve registrations,
              delete records, and assign event roles from one section.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setTab("view");
                setIsEditingVolunteer(false);
              }}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                tab === "view"
                  ? "bg-[#7a1418] text-white"
                  : "border border-[#ead8cb] bg-white text-[#5d463c]"
              }`}
            >
              View Volunteers
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("add");
                setIsEditingVolunteer(false);
              }}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                tab === "add"
                  ? "bg-[#7a1418] text-white"
                  : "border border-[#ead8cb] bg-white text-[#5d463c]"
              }`}
            >
              Add Volunteer
            </button>
          </div>
        </div>

        {tab === "view" && (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Registered",
                value: String(approvedVolunteers.length),
                note: "Approved volunteers only",
              },
              {
                label: "Pending Approval",
                value: String(pendingVolunteers),
                note: "Waiting for admin review",
              },
              {
                label: "Experienced",
                value: String(experiencedVolunteers),
                note: "Prior volunteer experience",
              },
              {
                label: "Assigned",
                value: String(assignedVolunteers),
                note: "Mapped to an event role",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#ead8cb] bg-white/82 px-4 py-4 text-sm"
              >
                <p className="text-[#88695d]">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-[#251916]">
                  {item.value}
                </p>
                <p className="mt-2 text-xs text-[#7b6358]">{item.note}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {tab === "add" ? (
        <VolunteerRegistrationForm volunteers={volunteers} showTable={false} />
      ) : (
        <>
          <section className={sectionClassName}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#efe1d6] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.18em] text-[#8f6b5c]">
                    <th className="px-4 py-3 font-semibold">Volunteer</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Assigned Event</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1e7de] text-[#4f3a31]">
                  {volunteers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-[#7b6358]"
                      >
                        No volunteers registered yet.
                      </td>
                    </tr>
                  ) : (
                    volunteers.map((volunteer) => (
                      <tr key={volunteer.id} className="align-top">
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => toggleVolunteerProfile(volunteer.id)}
                            className="text-left"
                          >
                            <p className="font-semibold text-[#241815]">
                              {volunteer.fullName}
                            </p>
                            <p className="mt-1 text-xs text-[#7b6358]">
                              {volunteer.gender || "Gender not set"}
                            </p>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              volunteer.approvalStatus === "approved"
                                ? "bg-[#eef8f0] text-[#2f7444]"
                                : "bg-[#fff4e8] text-[#9b5c1c]"
                            }`}
                          >
                            {volunteer.approvalStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p>{volunteer.phoneNumber}</p>
                          <p className="mt-1 text-xs text-[#7b6358]">
                            {volunteer.emailAddress || "No email"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {volunteer.assignedEventName || "Not assigned"}
                        </td>
                        <td className="px-4 py-4">
                          {volunteer.assignedRole || "No role"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => toggleVolunteerProfile(volunteer.id)}
                              className="rounded-full border border-[#ead8cb] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d463c]"
                            >
                              {selectedVolunteerId === volunteer.id ? "Hide" : "View"}
                            </button>

                            {volunteer.approvalStatus !== "approved" && (
                              <form action={approveVolunteerAction}>
                                <input
                                  type="hidden"
                                  name="volunteerId"
                                  value={volunteer.id}
                                />
                                <button
                                  type="submit"
                                  className="rounded-full bg-[#eef8f0] px-3 py-1.5 text-xs font-semibold text-[#2f7444]"
                                >
                                  Approve
                                </button>
                              </form>
                            )}

                            <form
                              action={deleteVolunteerAction}
                              onSubmit={(event) => {
                                if (
                                  !window.confirm(
                                    `Delete volunteer ${volunteer.fullName}?`,
                                  )
                                ) {
                                  event.preventDefault();
                                }
                              }}
                            >
                              <input
                                type="hidden"
                                name="volunteerId"
                                value={volunteer.id}
                              />
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

          {selectedVolunteer && (
            <section className={sectionClassName}>
              <div className="flex flex-col gap-4 border-b border-[#efe1d6] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b5c]">
                    Full profile
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
                    {selectedVolunteer.fullName}
                  </h3>
                  <p className="mt-2 text-sm text-[#6d554a]">
                    Registered {formatDateTime(selectedVolunteer.createdAt)} by{" "}
                    {selectedVolunteer.createdBy}
                  </p>
                  <p className="mt-1 text-sm text-[#6d554a]">
                    Approval: {selectedVolunteer.approvalStatus}
                    {selectedVolunteer.approvedBy
                      ? ` by ${selectedVolunteer.approvedBy} on ${formatDateTime(selectedVolunteer.approvedAt)}`
                      : ""}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#efe1d6] bg-[#fcf8f5] px-4 py-4 text-sm text-[#5d463c]">
                  <p className="font-semibold text-[#241815]">Assigned Event</p>
                  <p className="mt-1">
                    {selectedVolunteer.assignedEventName || "No event assigned"}
                  </p>
                  <p className="mt-1 text-xs text-[#7b6358]">
                    {selectedVolunteer.assignedRole || "No role assigned"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <VolunteerDetail volunteer={selectedVolunteer} />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingVolunteer((current) => !current)}
                    className="rounded-full border border-[#ead8cb] bg-white px-4 py-2 text-sm font-semibold text-[#5d463c]"
                  >
                    {isEditingVolunteer ? "Close edit" : "Update volunteer"}
                  </button>
                </div>

                {isEditingVolunteer && (
                  <VolunteerRegistrationForm
                    key={selectedVolunteer.id}
                    volunteers={volunteers}
                    showTable={false}
                    mode="update"
                    initialVolunteer={selectedVolunteer}
                  />
                )}

                <div className="rounded-[1.5rem] border border-[#eadbd0] bg-[#fbf6f2] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b5c]">
                    Assign Event Role
                  </p>
                  <form
                    action={assignVolunteerRoleAction}
                    className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      type="hidden"
                      name="volunteerId"
                      value={selectedVolunteer.id}
                    />
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b5c]">
                        Event
                      </span>
                      <select
                        name="eventId"
                        defaultValue={
                          selectedVolunteer.assignedEventId?.toString() ?? ""
                        }
                        className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
                      >
                        <option value="">Select event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.eventName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b5c]">
                        Assigned Role
                      </span>
                      <input
                        name="assignedRole"
                        defaultValue={selectedVolunteer.assignedRole ?? ""}
                        placeholder="Camp coordinator / Social media / Registration desk"
                        className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
                      />
                    </label>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full rounded-full bg-[#7a1418] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023]"
                      >
                        Assign role
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
