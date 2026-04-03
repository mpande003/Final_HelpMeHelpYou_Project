import { createVolunteer } from "./lib/volunteers.js";

async function run() {
  try {
    await createVolunteer({
      fullName: "Test Volunteer",
      phoneNumber: "9999999999",
      consentTerms: true,
      consentPolicies: true,
      createdBy: "test_script"
    });
    console.log("Success");
  } catch (err) {
    console.error("Full error:", err);
  }
}

run();
