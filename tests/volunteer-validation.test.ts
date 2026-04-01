import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizePhoneNumber,
  parseVolunteerFormData,
} from "../lib/volunteer-validation.ts";

function buildBaseFormData() {
  const formData = new FormData();
  formData.set("fullName", "Aman Patil");
  formData.set("dateOfBirth", "2000-01-10");
  formData.set("phoneNumber", "+91 98765 43210");
  formData.set("emailAddress", "aman@example.org");
  formData.set("areasOfInterest", "Teaching");
  formData.append("availableDays", "Mon");
  formData.set("hoursPerWeek", "6");
  formData.set("consentTerms", "on");
  formData.set("consentPolicies", "on");
  return formData;
}

test("normalizePhoneNumber trims formatting and country code", () => {
  assert.equal(normalizePhoneNumber("+91 98765 43210"), "9876543210");
  assert.equal(normalizePhoneNumber("98765-43210"), "9876543210");
});

test("parseVolunteerFormData accepts a valid public submission", () => {
  const result = parseVolunteerFormData(buildBaseFormData(), {
    publicSubmission: true,
  });

  assert.equal(result.error, "");
  assert.ok(result.input);
  assert.equal(result.input.phoneNumber, "9876543210");
  assert.equal(result.input.areasOfInterest, "Teaching");
});

test("parseVolunteerFormData rejects invalid phone numbers", () => {
  const formData = buildBaseFormData();
  formData.set("phoneNumber", "12345");

  const result = parseVolunteerFormData(formData, { publicSubmission: true });

  assert.equal(result.error, "Enter a valid 10-digit phone number.");
});

test("parseVolunteerFormData rejects missing public preferences", () => {
  const formData = buildBaseFormData();
  formData.delete("areasOfInterest");

  const result = parseVolunteerFormData(formData, { publicSubmission: true });

  assert.equal(result.error, "Select at least one area of interest.");
});

test("parseVolunteerFormData rejects honeypot submissions", () => {
  const formData = buildBaseFormData();
  formData.set("website", "spam.example");

  const result = parseVolunteerFormData(formData, { publicSubmission: true });

  assert.equal(result.error, "Unable to submit registration.");
});
