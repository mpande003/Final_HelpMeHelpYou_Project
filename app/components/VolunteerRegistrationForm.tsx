"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
} from "react";

import {
  createVolunteerAction,
  type VolunteerFormState,
  updateVolunteerAction,
} from "../dashboard/volunteer-actions";
import type { Volunteer } from "@/lib/volunteers";

type VolunteerRegistrationFormProps = {
  volunteers: Volunteer[];
  showTable?: boolean;
  mode?: "create" | "update";
  initialVolunteer?: Volunteer | null;
};

type VolunteerFormData = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  houseFlatNumber: string;
  streetAreaLocality: string;
  landmark: string;
  villageTownCity: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  idType: string;
  idNumber: string;
  highestEducationLevel: string;
  fieldOfStudy: string;
  collegeSchoolName: string;
  currentOccupation: string;
  skills: string;
  languagesKnown: string;
  availableTime: string;
  hoursPerWeek: string;
  preferredMode: string;
  previousVolunteerExperience: "Yes" | "No";
  previousOrganizationName: string;
  previousWorkDescription: string;
  motivation: string;
  specialSkillsOrCertifications: string;
  medicalConditions: string;
  consentTerms: boolean;
  consentPhotos: boolean;
  consentPolicies: boolean;
};

const initialFormData: VolunteerFormData = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  emailAddress: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  houseFlatNumber: "",
  streetAreaLocality: "",
  landmark: "",
  villageTownCity: "",
  district: "",
  state: "",
  pinCode: "",
  country: "India",
  idType: "",
  idNumber: "",
  highestEducationLevel: "",
  fieldOfStudy: "",
  collegeSchoolName: "",
  currentOccupation: "",
  skills: "",
  languagesKnown: "",
  availableTime: "",
  hoursPerWeek: "",
  preferredMode: "",
  previousVolunteerExperience: "No",
  previousOrganizationName: "",
  previousWorkDescription: "",
  motivation: "",
  specialSkillsOrCertifications: "",
  medicalConditions: "",
  consentTerms: false,
  consentPhotos: false,
  consentPolicies: false,
};

const inputClassName =
  "w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10";

const sectionClassName =
  "rounded-[1.65rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]";

const interestOptions = [
  "Teaching",
  "Environment",
  "Healthcare",
  "Event Management",
  "Fundraising",
  "Social Media",
  "Community Work",
];

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];
const idTypeOptions = [
  "Aadhaar",
  "Passport",
  "Driving License",
  "College ID",
];
const educationOptions = [
  "School",
  "12th Pass",
  "Diploma",
  "Graduate",
  "Postgraduate",
  "Doctorate",
  "Other",
];
const occupationOptions = ["Student", "Working", "Self-employed", "Other"];
const modeOptions = ["Online", "On-site", "Both"];

function getInitialFormData(volunteer: Volunteer | null): VolunteerFormData {
  if (!volunteer) {
    return initialFormData;
  }

  return {
    fullName: volunteer.fullName,
    dateOfBirth: volunteer.dateOfBirth ?? "",
    gender: volunteer.gender ?? "",
    phoneNumber: volunteer.phoneNumber,
    emailAddress: volunteer.emailAddress ?? "",
    emergencyContactName: volunteer.emergencyContactName ?? "",
    emergencyContactPhone: volunteer.emergencyContactPhone ?? "",
    houseFlatNumber: volunteer.houseFlatNumber ?? "",
    streetAreaLocality: volunteer.streetAreaLocality ?? "",
    landmark: volunteer.landmark ?? "",
    villageTownCity: volunteer.villageTownCity ?? "",
    district: volunteer.district ?? "",
    state: volunteer.state ?? "",
    pinCode: volunteer.pinCode ?? "",
    country: volunteer.country ?? "India",
    idType: volunteer.idType ?? "",
    idNumber: volunteer.idNumber ?? "",
    highestEducationLevel: volunteer.highestEducationLevel ?? "",
    fieldOfStudy: volunteer.fieldOfStudy ?? "",
    collegeSchoolName: volunteer.collegeSchoolName ?? "",
    currentOccupation: volunteer.currentOccupation ?? "",
    skills: volunteer.skills ?? "",
    languagesKnown: volunteer.languagesKnown ?? "",
    availableTime: volunteer.availableTime ?? "",
    hoursPerWeek: volunteer.hoursPerWeek ?? "",
    preferredMode: volunteer.preferredMode ?? "",
    previousVolunteerExperience: volunteer.previousVolunteerExperience ?? "No",
    previousOrganizationName: volunteer.previousOrganizationName ?? "",
    previousWorkDescription: volunteer.previousWorkDescription ?? "",
    motivation: volunteer.motivation ?? "",
    specialSkillsOrCertifications:
      volunteer.specialSkillsOrCertifications ?? "",
    medicalConditions: volunteer.medicalConditions ?? "",
    consentTerms: volunteer.consentTerms,
    consentPhotos: volunteer.consentPhotos,
    consentPolicies: volunteer.consentPolicies,
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
      <h3 className="text-xl font-semibold text-[#241815]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#71594e]">{description}</p>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: keyof VolunteerFormData;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  type?: string;
  as?: "input" | "textarea" | "select";
  options?: string[];
  className?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  as = "input",
  options = [],
  className = "",
  required = false,
}: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
        {label}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClassName} min-h-28 resize-y`}
          required={required}
        />
      ) : as === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={inputClassName}
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
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClassName}
          required={required}
        />
      )}
    </label>
  );
}

function CheckboxChip({
  name,
  label,
  checked,
  onToggle,
}: {
  name: "areasOfInterest" | "availableDays";
  label: string;
  checked: boolean;
  onToggle: (name: "areasOfInterest" | "availableDays", value: string) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
        checked
          ? "border-[#c95f4d] bg-[#fff1eb] text-[#7a1418]"
          : "border-[#eadbd0] bg-white text-[#5f493f] hover:bg-[#fbf6f2]"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        value={label}
        checked={checked}
        onChange={() => onToggle(name, label)}
        className="h-4 w-4 rounded border-[#d9b8ab] text-[#7a1418] focus:ring-[#7a1418]/20"
      />
      <span>{label}</span>
    </label>
  );
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function VolunteerRegistrationForm({
  volunteers,
  showTable = true,
  mode = "create",
  initialVolunteer = null,
}: VolunteerRegistrationFormProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(initialVolunteer));
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(
    () => initialVolunteer?.areasOfInterest ?? [],
  );
  const [availableDays, setAvailableDays] = useState<string[]>(
    () => initialVolunteer?.availableDays ?? [],
  );
  const action = mode === "update" ? updateVolunteerAction : createVolunteerAction;
  const [state, formAction, isPending] = useActionState<VolunteerFormState, FormData>(
    action,
    {
      error: "",
      success: "",
    },
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    const checked = "checked" in event.target ? event.target.checked : false;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayToggle = (
    name: "areasOfInterest" | "availableDays",
    value: string,
  ) => {
    const setState =
      name === "areasOfInterest" ? setAreasOfInterest : setAvailableDays;

    setState((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#ead7cb] bg-[linear-gradient(135deg,#fffaf7_0%,#fff4ef_58%,#f7e7de_100%)] p-7 shadow-[0_18px_50px_rgba(94,52,33,0.08)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa725e]">
            Volunteer operations
          </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#241815]">
            {mode === "update" ? "Update Volunteer" : "Add Volunteer"}
            </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6d554a]">
            Register volunteers in structured sections so onboarding,
            availability, and outreach coordination stay easy to manage from
            one admin panel.
          </p>
        </div>
      </section>

      <form action={formAction} className="space-y-6">
        {mode === "update" && initialVolunteer && (
          <input type="hidden" name="volunteerId" value={initialVolunteer.id} />
        )}
        <section className={sectionClassName}>
          <SectionHeader
            title="Basic Personal Information"
            description="Capture the volunteer identity, contact details, and emergency contact in one place."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Aman Patil"
              required
            />
            <Field
              label="Date of Birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              type="date"
            />
            <Field
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              as="select"
              options={genderOptions}
              placeholder="Select gender"
            />
            <Field
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
            />
            <Field
              label="Email Address"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              type="email"
              placeholder="volunteer@example.org"
            />
            <Field
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="Parent / spouse / guardian"
            />
            <Field
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              placeholder="+91 90000 00000"
            />
          </div>
        </section>

        <section className={sectionClassName}>
          <SectionHeader
            title="Address Information"
            description="Collect the volunteer's full address for field coordination and records."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="House / Flat Number"
              name="houseFlatNumber"
              value={formData.houseFlatNumber}
              onChange={handleChange}
              placeholder="Flat 7B / H.No 14"
            />
            <Field
              label="Street / Area / Locality"
              name="streetAreaLocality"
              value={formData.streetAreaLocality}
              onChange={handleChange}
              placeholder="Shivaji Nagar"
            />
            <Field
              label="Landmark (Optional)"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Near market yard"
            />
            <Field
              label="Village / Town / City"
              name="villageTownCity"
              value={formData.villageTownCity}
              onChange={handleChange}
              placeholder="Pune"
            />
            <Field
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Pune"
            />
            <Field
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Maharashtra"
            />
            <Field
              label="PIN Code"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="411001"
            />
            <Field
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="India"
            />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className={sectionClassName}>
            <SectionHeader
              title="Identity Details"
              description="Optional identity reference fields for verification and internal screening."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="ID Type"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                as="select"
                options={idTypeOptions}
                placeholder="Select ID type"
              />
              <Field
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="Enter document number"
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <SectionHeader
              title="Education / Background"
              description="Track education, study field, and occupation for better task allocation."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Highest Education Level"
                name="highestEducationLevel"
                value={formData.highestEducationLevel}
                onChange={handleChange}
                as="select"
                options={educationOptions}
                placeholder="Select education level"
              />
              <Field
                label="Field of Study"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="Commerce / Social Work / Nursing"
              />
              <Field
                label="College / School Name"
                name="collegeSchoolName"
                value={formData.collegeSchoolName}
                onChange={handleChange}
                placeholder="Institution name"
                className="md:col-span-2"
              />
              <Field
                label="Current Occupation"
                name="currentOccupation"
                value={formData.currentOccupation}
                onChange={handleChange}
                as="select"
                options={occupationOptions}
                placeholder="Select occupation"
                className="md:col-span-2"
              />
            </div>
          </section>
        </div>

        <section className={sectionClassName}>
          <SectionHeader
            title="Volunteer Preferences"
            description="Capture interest areas, skills, and languages to match volunteers with the right work."
          />
          <div className="space-y-5">
            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                Areas of Interest
              </span>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {interestOptions.map((item) => (
                  <CheckboxChip
                    key={item}
                    name="areasOfInterest"
                    label={item}
                    checked={areasOfInterest.includes(item)}
                    onToggle={handleArrayToggle}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                as="textarea"
                placeholder="First aid, public speaking, graphic design, logistics..."
              />
              <Field
                label="Languages Known"
                name="languagesKnown"
                value={formData.languagesKnown}
                onChange={handleChange}
                as="textarea"
                placeholder="Marathi, Hindi, English"
              />
            </div>
          </div>
        </section>

        <section className={sectionClassName}>
          <SectionHeader
            title="Availability"
            description="Track days, time, weekly capacity, and preferred engagement mode."
          />
          <div className="space-y-5">
            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                Available Days
              </span>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {dayOptions.map((item) => (
                  <CheckboxChip
                    key={item}
                    name="availableDays"
                    label={item}
                    checked={availableDays.includes(item)}
                    onToggle={handleArrayToggle}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Field
                label="Available Time"
                name="availableTime"
                value={formData.availableTime}
                onChange={handleChange}
                placeholder="10:00 AM to 4:00 PM"
              />
              <Field
                label="Hours per Week"
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleChange}
                placeholder="6"
              />
              <Field
                label="Preferred Mode"
                name="preferredMode"
                value={formData.preferredMode}
                onChange={handleChange}
                as="select"
                options={modeOptions}
                placeholder="Select mode"
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className={sectionClassName}>
            <SectionHeader
              title="Experience"
              description="Record prior volunteering and relevant organization experience."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Previous Volunteer Experience"
                name="previousVolunteerExperience"
                value={formData.previousVolunteerExperience}
                onChange={handleChange}
                as="select"
                options={["Yes", "No"]}
              />
              <Field
                label="Organization Name"
                name="previousOrganizationName"
                value={formData.previousOrganizationName}
                onChange={handleChange}
                placeholder="Organization name"
              />
              <Field
                label="Description of Work"
                name="previousWorkDescription"
                value={formData.previousWorkDescription}
                onChange={handleChange}
                as="textarea"
                placeholder="Briefly describe the previous volunteer work."
                className="md:col-span-2"
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <SectionHeader
              title="Additional Information"
              description="Capture motivation, certifications, and medical context when relevant."
            />
            <div className="grid gap-5">
              <Field
                label="Why do you want to volunteer?"
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                as="textarea"
                placeholder="Explain why this cause matters to you."
              />
              <Field
                label="Special Skills or Certifications"
                name="specialSkillsOrCertifications"
                value={formData.specialSkillsOrCertifications}
                onChange={handleChange}
                placeholder="CPR, nursing, teaching, social work certification..."
              />
              <Field
                label="Medical Conditions (Optional)"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                placeholder="Only if relevant to field work."
              />
            </div>
          </section>
        </div>

        <section className={sectionClassName}>
          <SectionHeader
            title="Consent and Agreement"
            description="Keep the volunteer's registration compliant with your NGO's operating policies."
          />
          <div className="grid gap-4">
            {[
              {
                name: "consentTerms",
                label: "I accept the volunteer registration terms and conditions.",
                checked: formData.consentTerms,
              },
              {
                name: "consentPhotos",
                label: "I permit the NGO to use event photos or videos featuring me.",
                checked: formData.consentPhotos,
              },
              {
                name: "consentPolicies",
                label: "I agree to follow NGO policies and code of conduct.",
                checked: formData.consentPolicies,
              },
            ].map((item) => (
              <label
                key={item.name}
                className="flex items-start gap-3 rounded-2xl border border-[#eadbd0] bg-[#fbf6f2] px-4 py-4 text-sm text-[#5b463d]"
              >
                <input
                  type="checkbox"
                  name={item.name}
                  checked={item.checked}
                  onChange={handleChange}
                  required={
                    item.name === "consentTerms" ||
                    item.name === "consentPolicies"
                  }
                  className="mt-0.5 h-4 w-4 rounded border-[#d9b8ab] text-[#7a1418] focus:ring-[#7a1418]/20"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </section>

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
            disabled={isPending}
            onClick={() => {
              setFormData(initialFormData);
              setAreasOfInterest([]);
              setAvailableDays([]);
            }}
            className="rounded-full border border-[#e4d5ca] bg-white px-5 py-3 text-sm font-semibold text-[#5e483f] transition hover:bg-[#faf5f1]"
          >
            Reset form
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-[#7a1418] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8e2023] disabled:opacity-60"
          >
            {isPending
              ? mode === "update"
                ? "Updating volunteer..."
                : "Saving volunteer..."
              : mode === "update"
                ? "Update volunteer"
                : "Register volunteer"}
          </button>
        </div>
      </form>

      {showTable && (
        <section className={sectionClassName}>
          <SectionHeader
            title="Registered Volunteers"
            description="A quick operations table for recent registrations, interests, and availability."
          />

          {volunteers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e5d5c9] bg-[#fbf6f2] p-6 text-sm text-[#725a4e]">
              No volunteers have been registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#efe1d6] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.18em] text-[#8f6b5c]">
                    <th className="px-4 py-3 font-semibold">Volunteer</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Interest Areas</th>
                    <th className="px-4 py-3 font-semibold">Availability</th>
                    <th className="px-4 py-3 font-semibold">Experience</th>
                    <th className="px-4 py-3 font-semibold">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1e7de] text-[#4f3a31]">
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#241815]">
                          {volunteer.fullName}
                        </p>
                        <p className="mt-1 text-xs text-[#7b6358]">
                          {volunteer.gender || "Gender not set"} ·{" "}
                          {formatDateLabel(volunteer.dateOfBirth)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p>{volunteer.phoneNumber}</p>
                        <p className="mt-1 text-xs text-[#7b6358]">
                          {volunteer.emailAddress || "No email"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {volunteer.areasOfInterest.length > 0
                          ? volunteer.areasOfInterest.join(", ")
                          : "Not specified"}
                      </td>
                      <td className="px-4 py-4">
                        <p>
                          {volunteer.availableDays.join(", ") || "Not specified"}
                        </p>
                        <p className="mt-1 text-xs text-[#7b6358]">
                          {volunteer.availableTime || "Time not set"} ·{" "}
                          {volunteer.preferredMode || "Mode not set"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p>{volunteer.previousVolunteerExperience}</p>
                        <p className="mt-1 text-xs text-[#7b6358]">
                          {volunteer.previousOrganizationName ||
                            "No prior organization"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#7b6358]">
                        {volunteer.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
