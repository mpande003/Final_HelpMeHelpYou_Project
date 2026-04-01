"use client";

import { useActionState, type ChangeEvent, useState } from "react";

import { createEventAction } from "../dashboard/event-actions";

type EventFormData = {
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
};

const initialFormData: EventFormData = {
  eventName: "",
  eventType: "",
  customEventType: "",
  description: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  fullName: "",
  houseNumber: "",
  buildingStreetArea: "",
  landmark: "",
  villageTownCity: "",
  postOffice: "",
  tehsilTaluka: "",
  district: "",
  state: "",
  pinCode: "",
  country: "India",
  mapLink: "",
  partnerOrganizations: "",
  sponsorContactName: "",
  sponsorPhone: "",
  sponsorEmail: "",
  expectedParticipants: "",
  actualParticipants: "",
  beneficiaries: "",
  estimatedBudget: "",
  actualExpenses: "",
  sponsor: "",
  status: "",
  latitude: "",
  longitude: "",
};

const inputClassName =
  "w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10";

const sectionClassName =
  "rounded-[1.65rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]";

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

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-xl font-semibold text-[#241815]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#71594e]">{description}</p>
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
}: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
        {label}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          className={`${inputClassName} min-h-32 resize-y`}
          value={value}
          onChange={onChange}
        />
      ) : as === "select" ? (
        <select
          name={name}
          className={inputClassName}
          value={value}
          onChange={onChange}
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
        />
      )}
    </label>
  );
}

export default function AddEventForm() {
  const [formData, setFormData] = useState(initialFormData);
  const isOtherEventType = formData.eventType === "Other";
  const [state, formAction, isPending] = useActionState(createEventAction, {
    error: "",
    success: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#ead7cb] bg-[linear-gradient(135deg,#fffaf7_0%,#fff4ef_58%,#f7e7de_100%)] p-7 shadow-[0_18px_50px_rgba(94,52,33,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa725e]">
          Event operations
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#241815]">
              Add New Event
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6d554a]">
              Capture the operational, financial, and impact details required
              to run a professional NGO event workflow from one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Structure", value: "6 sections" },
              { label: "Tracking", value: "Budget + impact" },
              { label: "Ready for", value: "Future persistence" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#ead8cb] bg-white/82 px-4 py-4 text-sm"
              >
                <p className="text-[#88695d]">{item.label}</p>
                <p className="mt-1 font-semibold text-[#251916]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <form action={formAction} onReset={handleReset} className="space-y-6">
        <section className={sectionClassName}>
          <SectionHeader
            title="Basic Event Details"
            description="Define what the event is, when it happens, and the message it should communicate."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Event Name"
              name="eventName"
              placeholder="Community Blood Drive"
              value={formData.eventName}
              onChange={handleChange}
            />
            <Field
              label="Event Type"
              name="eventType"
              as="select"
              placeholder="Select event type"
              options={eventTypeOptions}
              value={formData.eventType}
              onChange={handleChange}
            />
            {isOtherEventType && (
              <Field
                label="Other Event Type"
                name="customEventType"
                placeholder="Enter anything else"
                value={formData.customEventType}
                onChange={handleChange}
              />
            )}
            <Field
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />
            <Field
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
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
              placeholder="Explain the purpose, expected audience, and campaign goals."
              value={formData.description}
              onChange={handleChange}
              className="md:col-span-2"
            />
          </div>
        </section>

        <section className={sectionClassName}>
          <SectionHeader
            title="Location Details"
            description="Capture the full postal and physical address needed for field operations and navigation."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Full Name"
              name="fullName"
              placeholder="Venue or site full name"
              value={formData.fullName}
              onChange={handleChange}
            />
            <Field
              label="House / Flat / H.No"
              name="houseNumber"
              placeholder="12-A / Flat 4B"
              value={formData.houseNumber}
              onChange={handleChange}
            />
            <Field
              label="Building / Street / Area"
              name="buildingStreetArea"
              placeholder="Shivaji Nagar Main Road"
              value={formData.buildingStreetArea}
              onChange={handleChange}
            />
            <Field
              label="Landmark (Optional)"
              name="landmark"
              placeholder="Near bus stand"
              value={formData.landmark}
              onChange={handleChange}
            />
            <Field
              label="Village / Town / City"
              name="villageTownCity"
              placeholder="Nashik"
              value={formData.villageTownCity}
              onChange={handleChange}
            />
            <Field
              label="Post Office (Optional)"
              name="postOffice"
              placeholder="MG Road PO"
              value={formData.postOffice}
              onChange={handleChange}
            />
            <Field
              label="Tehsil / Taluka"
              name="tehsilTaluka"
              placeholder="Nashik"
              value={formData.tehsilTaluka}
              onChange={handleChange}
            />
            <Field
              label="District"
              name="district"
              placeholder="Nashik"
              value={formData.district}
              onChange={handleChange}
            />
            <Field
              label="State"
              name="state"
              placeholder="Maharashtra"
              value={formData.state}
              onChange={handleChange}
            />
            <Field
              label="PIN Code"
              name="pinCode"
              placeholder="422001"
              value={formData.pinCode}
              onChange={handleChange}
            />
            <Field
              label="Country"
              name="country"
              placeholder="India"
              value={formData.country}
              onChange={handleChange}
            />
            <Field
              label="Map Link"
              name="mapLink"
              placeholder="https://maps.google.com/..."
              value={formData.mapLink}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className={sectionClassName}>
          <SectionHeader
            title="Partner Organizations / Sponsors"
            description="Record collaborating organizations and sponsor contact details for coordination and approvals."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Partner Organizations / Sponsors"
              name="partnerOrganizations"
              placeholder="NGO partner, hospital, corporate sponsor"
              value={formData.partnerOrganizations}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <Field
              label="Contact Name"
              name="sponsorContactName"
              placeholder="Riya Sharma"
              value={formData.sponsorContactName}
              onChange={handleChange}
            />
            <Field
              label="Phone"
              name="sponsorPhone"
              placeholder="+91 98765 43210"
              value={formData.sponsorPhone}
              onChange={handleChange}
            />
            <Field
              label="Email"
              name="sponsorEmail"
              type="email"
              placeholder="partner@ngo.org"
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
              description="Estimate turnout and capture the people your event is meant to support."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Expected Participants"
                name="expectedParticipants"
                placeholder="250"
                value={formData.expectedParticipants}
                onChange={handleChange}
              />
              <Field
                label="Actual Participants"
                name="actualParticipants"
                placeholder="198"
                value={formData.actualParticipants}
                onChange={handleChange}
              />
              <Field
                label="Beneficiaries"
                name="beneficiaries"
                placeholder="140"
                value={formData.beneficiaries}
                onChange={handleChange}
              />
              <Field
                label="Status"
                name="status"
                as="select"
                placeholder="Select event status"
                options={["Planned", "Ongoing", "Completed"]}
                value={formData.status}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <SectionHeader
              title="Financial and Map Data"
              description="Keep sponsor, budget, and location coordinates in one operational record."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Estimated Budget"
                name="estimatedBudget"
                placeholder="₹50,000"
                value={formData.estimatedBudget}
                onChange={handleChange}
              />
              <Field
                label="Actual Expenses"
                name="actualExpenses"
                placeholder="₹41,200"
                value={formData.actualExpenses}
                onChange={handleChange}
              />
              <Field
                label="Sponsor"
                name="sponsor"
                placeholder="Corporate donor or partner"
                value={formData.sponsor}
                onChange={handleChange}
              />
              <Field
                label="Latitude"
                name="latitude"
                placeholder="13.0827"
                value={formData.latitude}
                onChange={handleChange}
              />
              <Field
                label="Longitude"
                name="longitude"
                placeholder="80.2707"
                value={formData.longitude}
                onChange={handleChange}
              />
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
            type="reset"
            disabled={isPending}
            className="rounded-full border border-[#e4d5ca] bg-white px-5 py-3 text-sm font-semibold text-[#5e483f] transition hover:bg-[#faf5f1]"
          >
            Reset form
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-[#7a1418] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023] disabled:opacity-60"
          >
            {isPending ? "Saving event..." : "Save event"}
          </button>
        </div>
      </form>
    </div>
  );
}
