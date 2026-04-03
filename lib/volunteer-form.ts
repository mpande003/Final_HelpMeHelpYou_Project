import { createVolunteer } from "./volunteers";
import { parseVolunteerFormData } from "./volunteer-validation";

export type VolunteerSubmissionResult = {
  error: string;
  success: string;
};

export async function persistVolunteerRegistration(input: {
  formData: FormData;
  createdBy: string;
  publicSubmission?: boolean;
}): Promise<VolunteerSubmissionResult> {
  const { formData, createdBy, publicSubmission = false } = input;
  const parsed = parseVolunteerFormData(formData, { publicSubmission });

  if (parsed.error || !parsed.input) {
    return {
      error: parsed.error,
      success: "",
    };
  }

  try {
    await createVolunteer({
      ...parsed.input,
      createdBy,
      approvalStatus: publicSubmission ? "pending" : "approved",
    });

    return {
      error: "",
      success: `Registered volunteer "${parsed.input.fullName}".`,
    };
  } catch (error: any) {
    console.error("Failed to insert volunteer:", error);
    return {
      error: "DB Error: " + (error.message || "Unknown error"),
      success: "",
    };
  }
}
