import { createVolunteer } from "./volunteers";
import { parseVolunteerFormData } from "./volunteer-validation";

export type VolunteerSubmissionResult = {
  error: string;
  success: string;
};

export function persistVolunteerRegistration(input: {
  formData: FormData;
  createdBy: string;
  publicSubmission?: boolean;
}): VolunteerSubmissionResult {
  const { formData, createdBy, publicSubmission = false } = input;
  const parsed = parseVolunteerFormData(formData, { publicSubmission });

  if (parsed.error || !parsed.input) {
    return {
      error: parsed.error,
      success: "",
    };
  }

  createVolunteer({
    ...parsed.input,
    createdBy,
  });

  return {
    error: "",
    success: `Registered volunteer "${parsed.input.fullName}".`,
  };
}
