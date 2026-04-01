export type VolunteerMutableFields = {
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phoneNumber: string;
  emailAddress: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  houseFlatNumber: string | null;
  streetAreaLocality: string | null;
  landmark: string | null;
  villageTownCity: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  country: string;
  idType: string | null;
  idNumber: string | null;
  highestEducationLevel: string | null;
  fieldOfStudy: string | null;
  collegeSchoolName: string | null;
  currentOccupation: string | null;
  areasOfInterest: string;
  skills: string | null;
  languagesKnown: string | null;
  availableDays: string;
  availableTime: string | null;
  hoursPerWeek: string | null;
  preferredMode: string | null;
  previousVolunteerExperience: "Yes" | "No";
  previousOrganizationName: string | null;
  previousWorkDescription: string | null;
  motivation: string | null;
  specialSkillsOrCertifications: string | null;
  medicalConditions: string | null;
  consentTerms: boolean;
  consentPhotos: boolean;
  consentPolicies: boolean;
};

type ValidationResult =
  | { error: string; input: null }
  | { error: ""; input: VolunteerMutableFields };

const MAX_LENGTHS = {
  short: 120,
  medium: 240,
  long: 1200,
};

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCheckbox(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function normalizeMultiValue(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
}

function validateMaxLength(label: string, value: string, maxLength: number) {
  if (value.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }

  return "";
}

export function normalizePhoneNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2);
  }

  return digitsOnly;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPastDate(value: string) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed <= new Date();
}

function getAgeFromDateOfBirth(value: string) {
  const today = new Date();
  const birthDate = new Date(value);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function parseVolunteerFormData(
  formData: FormData,
  options?: { publicSubmission?: boolean },
): ValidationResult {
  const publicSubmission = options?.publicSubmission ?? false;
  const fullName = normalizeString(formData.get("fullName"));
  const phoneNumberRaw = normalizeString(formData.get("phoneNumber"));
  const phoneNumber = normalizePhoneNumber(phoneNumberRaw);
  const emailAddress = normalizeString(formData.get("emailAddress"));
  const consentTerms = normalizeCheckbox(formData, "consentTerms");
  const consentPolicies = normalizeCheckbox(formData, "consentPolicies");
  const areasOfInterest = normalizeMultiValue(formData, "areasOfInterest");
  const availableDays = normalizeMultiValue(formData, "availableDays");
  const dateOfBirth = normalizeString(formData.get("dateOfBirth"));
  const pinCode = normalizeString(formData.get("pinCode"));
  const hoursPerWeek = normalizeString(formData.get("hoursPerWeek"));
  const honeypot = normalizeString(formData.get("website"));

  if (honeypot) {
    return {
      error: "Unable to submit registration.",
      input: null,
    };
  }

  if (!fullName || !phoneNumber) {
    return {
      error: "Full name and phone number are required.",
      input: null,
    };
  }

  if (!consentTerms || !consentPolicies) {
    return {
      error: "Terms and NGO policy agreement must be accepted.",
      input: null,
    };
  }

  if (fullName.length < 3 || !/^[a-zA-Z\s.'-]+$/.test(fullName)) {
    return {
      error: "Enter a valid full name using letters and basic punctuation only.",
      input: null,
    };
  }

  if (phoneNumber.length !== 10) {
    return {
      error: "Enter a valid 10-digit phone number.",
      input: null,
    };
  }

  if (emailAddress && !isValidEmail(emailAddress)) {
    return {
      error: "Enter a valid email address.",
      input: null,
    };
  }

  if (dateOfBirth) {
    if (!isValidPastDate(dateOfBirth)) {
      return {
        error: "Date of birth must be a valid past date.",
        input: null,
      };
    }

    if (getAgeFromDateOfBirth(dateOfBirth) < 16) {
      return {
        error: "Volunteers must be at least 16 years old.",
        input: null,
      };
    }
  }

  if (pinCode && !/^\d{6}$/.test(pinCode)) {
    return {
      error: "PIN code must be a 6-digit number.",
      input: null,
    };
  }

  if (hoursPerWeek) {
    const parsedHours = Number(hoursPerWeek);
    if (
      Number.isNaN(parsedHours) ||
      !Number.isInteger(parsedHours) ||
      parsedHours < 1 ||
      parsedHours > 80
    ) {
      return {
        error: "Hours per week must be a whole number between 1 and 80.",
        input: null,
      };
    }
  }

  if (publicSubmission && !areasOfInterest) {
    return {
      error: "Select at least one area of interest.",
      input: null,
    };
  }

  if (publicSubmission && !availableDays) {
    return {
      error: "Select at least one available day.",
      input: null,
    };
  }

  const lengthChecks = [
    validateMaxLength("Full name", fullName, MAX_LENGTHS.short),
    validateMaxLength("Email address", emailAddress, MAX_LENGTHS.short),
    validateMaxLength(
      "Emergency contact name",
      normalizeString(formData.get("emergencyContactName")),
      MAX_LENGTHS.short,
    ),
    validateMaxLength(
      "Emergency contact phone",
      normalizeString(formData.get("emergencyContactPhone")),
      MAX_LENGTHS.short,
    ),
    validateMaxLength(
      "Skills",
      normalizeString(formData.get("skills")),
      MAX_LENGTHS.medium,
    ),
    validateMaxLength(
      "Motivation",
      normalizeString(formData.get("motivation")),
      MAX_LENGTHS.long,
    ),
    validateMaxLength(
      "Previous work description",
      normalizeString(formData.get("previousWorkDescription")),
      MAX_LENGTHS.long,
    ),
  ].find(Boolean);

  if (lengthChecks) {
    return {
      error: lengthChecks,
      input: null,
    };
  }

  return {
    error: "",
    input: {
      fullName,
      dateOfBirth: dateOfBirth || null,
      gender: normalizeString(formData.get("gender")) || null,
      phoneNumber,
      emailAddress: emailAddress || null,
      emergencyContactName:
        normalizeString(formData.get("emergencyContactName")) || null,
      emergencyContactPhone:
        normalizeString(formData.get("emergencyContactPhone")) || null,
      houseFlatNumber: normalizeString(formData.get("houseFlatNumber")) || null,
      streetAreaLocality:
        normalizeString(formData.get("streetAreaLocality")) || null,
      landmark: normalizeString(formData.get("landmark")) || null,
      villageTownCity: normalizeString(formData.get("villageTownCity")) || null,
      district: normalizeString(formData.get("district")) || null,
      state: normalizeString(formData.get("state")) || null,
      pinCode: pinCode || null,
      country: normalizeString(formData.get("country")) || "India",
      idType: normalizeString(formData.get("idType")) || null,
      idNumber: normalizeString(formData.get("idNumber")) || null,
      highestEducationLevel:
        normalizeString(formData.get("highestEducationLevel")) || null,
      fieldOfStudy: normalizeString(formData.get("fieldOfStudy")) || null,
      collegeSchoolName:
        normalizeString(formData.get("collegeSchoolName")) || null,
      currentOccupation:
        normalizeString(formData.get("currentOccupation")) || null,
      areasOfInterest,
      skills: normalizeString(formData.get("skills")) || null,
      languagesKnown: normalizeString(formData.get("languagesKnown")) || null,
      availableDays,
      availableTime: normalizeString(formData.get("availableTime")) || null,
      hoursPerWeek: hoursPerWeek || null,
      preferredMode: normalizeString(formData.get("preferredMode")) || null,
      previousVolunteerExperience:
        (normalizeString(formData.get("previousVolunteerExperience")) as
          | "Yes"
          | "No") || "No",
      previousOrganizationName:
        normalizeString(formData.get("previousOrganizationName")) || null,
      previousWorkDescription:
        normalizeString(formData.get("previousWorkDescription")) || null,
      motivation: normalizeString(formData.get("motivation")) || null,
      specialSkillsOrCertifications:
        normalizeString(formData.get("specialSkillsOrCertifications")) || null,
      medicalConditions:
        normalizeString(formData.get("medicalConditions")) || null,
      consentTerms,
      consentPhotos: normalizeCheckbox(formData, "consentPhotos"),
      consentPolicies,
    },
  };
}
