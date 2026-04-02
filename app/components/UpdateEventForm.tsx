"use client";

import { useActionState, useMemo, useState, type ChangeEvent } from "react";

import type { AppEvent } from "@/lib/events";
import { updateEventAction } from "../dashboard/event-actions";
import {
  internalBodyCopyClassName,
  internalEyebrowClassName,
  internalFormInputClassName,
  internalHeroSectionClassName,
  internalLabelClassName,
  internalPrimaryButtonClassName,
  internalSectionClassName,
  internalSectionDescriptionClassName,
  internalSectionTitleClassName,
} from "./internalTheme";

type EventFormData = {
  eventId: string;
  eventName: string;
  eventType: string;
  customEventType: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  fullName: string;
  houseNumber: string;
  buildingStreetArea: string;
  landmark: string;
  villageTownCity: string;
  postOffice: string;
  tehsilTaluka: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  mapLink: string;
  partnerOrganizations: string;
  sponsorContactName: string;
  sponsorPhone: string;
  sponsorEmail: string;
  expectedParticipants: string;
  actualParticipants: string;
  beneficiaries: string;
  estimatedBudget: string;
  actualExpenses: string;
  sponsor: string;
  status: string;
  latitude: string;
  longitude: string;
  markerStatus: "active" | "removed";
};

const inputClassName = internalFormInputClassName;

const sectionClassName = internalSectionClassName;

const eventTypeOptions = [
  "Blood Donation",
  "Health Checkup Camp",
  "Cataract Operations",
  "Social Campaign",
  "Operation Under Mahatma Jyotiba Fule Arogyadayi Yojana",
  "Ambulance Services Availability",
  "Vrudhashram Birthday Celebration",
  "Clothes Donation Camp",
  "Plantation Drive",
  "Coronavirus Kit Distribution",
  "Other",
];

function toFormData(event: AppEvent): EventFormData {
  const matchesKnownEventType = eventTypeOptions.includes(event.eventType);

  return {
    eventId: String(event.id),
    eventName: event.eventName,
    eventType: matchesKnownEventType ? event.eventType : "Other",
    customEventType: matchesKnownEventType ? "" : event.eventType,
    description: event.description ?? "",
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    fullName: event.fullName ?? "",
    houseNumber: event.houseNumber ?? "",
    buildingStreetArea: event.buildingStreetArea ?? "",
    landmark: event.landmark ?? "",
    villageTownCity: event.villageTownCity ?? "",
    postOffice: event.postOffice ?? "",
    tehsilTaluka: event.tehsilTaluka ?? "",
    district: event.district ?? "",
    state: event.state ?? "",
    pinCode: event.pinCode ?? "",
    country: event.country,
    mapLink: event.mapLink ?? "",
    partnerOrganizations: event.partnerOrganizations ?? "",
    sponsorContactName: event.sponsorContactName ?? "",
    sponsorPhone: event.sponsorPhone ?? "",
    sponsorEmail: event.sponsorEmail ?? "",
    expectedParticipants: event.expectedParticipants ?? "",
    actualParticipants: event.actualParticipants ?? "",
    beneficiaries: event.beneficiaries ?? "",
    estimatedBudget: event.estimatedBudget ?? "",
    actualExpenses: event.actualExpenses ?? "",
    sponsor: event.sponsor ?? "",
    status: event.status ?? "",
    latitude: String(event.latitude),
    longitude: String(event.longitude),
    markerStatus: event.markerStatus,
  };
}

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

type FieldProps = {
  label: string;
  name: keyof EventFormData;
  placeholder?: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  type?: string;
  as?: "input" | "textarea" | "select";
  options?: string[];
  className?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  placeholder,
  value,
  onChange,
  type = "text",
  as = "input",
  options = [],
  className = "",
  required = false,
}: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className={internalLabelClassName}>
        {label}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          className={`${inputClassName} min-h-32 resize-y`}
          value={value}
          onChange={onChange}
          required={required}
        />
      ) : as === "select" ? (
        <select
          name={name}
          className={inputClassName}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">{placeholder ?? `Select ${label}`}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          className={inputClassName}
          value={value}
          onChange={onChange}
          required={required}
        />
      )}
    </label>
  );
}

export default function UpdateEventForm({ events }: { events: AppEvent[] }) {
  const editableEvents = useMemo(() => events, [events]);
  const [selectedEventId, setSelectedEventId] = useState(
    editableEvents[0] ? String(editableEvents[0].id) : "",
  );
  const selectedEvent = editableEvents.find(
    (event) => String(event.id) === selectedEventId,
  );
  const [formData, setFormData] = useState<EventFormData | null>(
    selectedEvent ? toFormData(selectedEvent) : null,
  );
  const [state, formAction, isPending] = useActionState(updateEventAction, {
    error: "",
    success: "",
  });

  const handleEventSelection = (eventId: string) => {
    setSelectedEventId(eventId);
    const nextEvent = editableEvents.find((event) => String(event.id) === eventId);
    setFormData(nextEvent ? toFormData(nextEvent) : null);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (!formData) {
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!formData) {
    return (
      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-8 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <h2 className="text-2xl font-semibold text-[#241815]">Update Event</h2>
        <p className="mt-3 text-sm text-[#71594e]">
          No events are available to update yet. Create an event first.
        </p>
      </section>
    );
  }

  const isOtherEventType = formData.eventType === "Other";

  return (
    <div className="space-y-6">
      <section className={internalHeroSectionClassName}>
        <p className={internalEyebrowClassName}>
          Event operations
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className={internalSectionTitleClassName.replace("text-xl", "text-3xl tracking-tight")}>
              Update Event
            </h2>
            <p className={`max-w-2xl ${internalBodyCopyClassName}`}>
              Select any saved event and update every field currently supported
              in the add event workflow.
            </p>
          </div>

          <div className="min-w-[280px]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                Select Event
              </span>
              <select
                className={inputClassName}
                value={selectedEventId}
                onChange={(e) => handleEventSelection(e.target.value)}
              >
                {editableEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="eventId" value={formData.eventId} />
        <input type="hidden" name="markerStatus" value={formData.markerStatus} />

        <section className={sectionClassName}>
          <SectionHeader
            title="Basic Event Details"
            description="Update the event identity, timing, and summary details."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Event Name"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
            <Field
              label="Event Type"
              name="eventType"
              as="select"
              options={eventTypeOptions}
              value={formData.eventType}
              onChange={handleChange}
              required
            />
            {isOtherEventType && (
              <Field
                label="Other Event Type"
                name="customEventType"
                value={formData.customEventType}
                onChange={handleChange}
                required
              />
            )}
            <Field
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <Field
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
            <Field
              label="Start Time"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
            />
            <Field
              label="End Time"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
            />
            <Field
              label="Description"
              name="description"
              as="textarea"
              value={formData.description}
              onChange={handleChange}
              className="md:col-span-2"
            />
          </div>
        </section>

        <section className={sectionClassName}>
          <SectionHeader
            title="Location Details"
            description="Update the full address and map information for this event."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
            <Field label="House / Flat / H.No" name="houseNumber" value={formData.houseNumber} onChange={handleChange} />
            <Field label="Building / Street / Area" name="buildingStreetArea" value={formData.buildingStreetArea} onChange={handleChange} />
            <Field label="Landmark (Optional)" name="landmark" value={formData.landmark} onChange={handleChange} />
            <Field label="Village / Town / City" name="villageTownCity" value={formData.villageTownCity} onChange={handleChange} />
            <Field label="Post Office (Optional)" name="postOffice" value={formData.postOffice} onChange={handleChange} />
            <Field label="Tehsil / Taluka" name="tehsilTaluka" value={formData.tehsilTaluka} onChange={handleChange} />
            <Field label="District" name="district" value={formData.district} onChange={handleChange} />
            <Field label="State" name="state" value={formData.state} onChange={handleChange} />
            <Field label="PIN Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
            <Field label="Country" name="country" value={formData.country} onChange={handleChange} />
            <Field label="Map Link" name="mapLink" value={formData.mapLink} onChange={handleChange} />
          </div>
        </section>

        <section className={sectionClassName}>
          <SectionHeader
            title="Partner Organizations / Sponsors"
            description="Update partner and sponsor contact details."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Partner Organizations / Sponsors"
              name="partnerOrganizations"
              value={formData.partnerOrganizations}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <Field label="Contact Name" name="sponsorContactName" value={formData.sponsorContactName} onChange={handleChange} />
            <Field label="Phone" name="sponsorPhone" value={formData.sponsorPhone} onChange={handleChange} />
            <Field
              label="Email"
              name="sponsorEmail"
              type="email"
              value={formData.sponsorEmail}
              onChange={handleChange}
              className="md:col-span-2"
            />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className={sectionClassName}>
            <SectionHeader
              title="Participants and Impact"
              description="Update attendance, beneficiaries, and asset files."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Expected Participants" name="expectedParticipants" value={formData.expectedParticipants} onChange={handleChange} />
              <Field label="Actual Participants" name="actualParticipants" value={formData.actualParticipants} onChange={handleChange} />
              <Field label="Beneficiaries" name="beneficiaries" value={formData.beneficiaries} onChange={handleChange} />
              <Field
                label="Status"
                name="status"
                as="select"
                options={["Planned", "Ongoing", "Completed"]}
                value={formData.status}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <SectionHeader
              title="Financial and Map Data"
              description="Update budget, sponsor, and marker coordinates."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Estimated Budget" name="estimatedBudget" value={formData.estimatedBudget} onChange={handleChange} />
              <Field label="Actual Expenses" name="actualExpenses" value={formData.actualExpenses} onChange={handleChange} />
              <Field label="Sponsor" name="sponsor" value={formData.sponsor} onChange={handleChange} />
              <Field label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} required />
              <Field label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} required />
            </div>
          </section>
        </div>

        {(state.error || state.success) && (
          <div
            className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
              state.error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {state.error || state.success}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => selectedEvent && setFormData(toFormData(selectedEvent))}
            disabled={isPending}
            className="rounded-full border border-[#e4d5ca] bg-white px-5 py-3 text-sm font-semibold text-[#5e483f] transition hover:bg-[#faf5f1]"
          >
            Reset changes
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={internalPrimaryButtonClassName}
          >
            {isPending ? "Updating event..." : "Update event"}
          </button>
        </div>
      </form>
    </div>
  );
}
