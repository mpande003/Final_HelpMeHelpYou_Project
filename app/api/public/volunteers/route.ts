import { NextResponse } from "next/server";

import { persistVolunteerRegistration } from "@/lib/volunteer-form";
import {
  buildVolunteerSubmissionKey,
  countRecentVolunteerSubmissionAttempts,
  hasRecentVolunteerDuplicate,
  logVolunteerSubmissionAttempt,
} from "@/lib/volunteer-db";
import {
  normalizePhoneNumber,
  parseVolunteerFormData,
} from "@/lib/volunteer-validation";

function getRequestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const requestKey = buildVolunteerSubmissionKey(getRequestFingerprint(request));
  logVolunteerSubmissionAttempt(requestKey);

  if (countRecentVolunteerSubmissionAttempts(requestKey, 60) > 5) {
    return NextResponse.json(
      {
        error:
          "Too many registration attempts from this connection. Please try again in about an hour.",
        success: "",
      },
      { status: 429 },
    );
  }

  const parsed = parseVolunteerFormData(formData, { publicSubmission: true });
  if (parsed.error || !parsed.input) {
    return NextResponse.json(
      { error: parsed.error, success: "" },
      { status: 400 },
    );
  }

  if (
    hasRecentVolunteerDuplicate({
      phoneNumber: normalizePhoneNumber(parsed.input.phoneNumber),
      emailAddress: parsed.input.emailAddress,
      createdBy: "public_form",
      windowHours: 24,
    })
  ) {
    return NextResponse.json(
      {
        error:
          "A similar volunteer registration was already received recently. Please wait for the NGO team to respond.",
        success: "",
      },
      { status: 409 },
    );
  }

  const result = persistVolunteerRegistration({
    formData,
    createdBy: "public_form",
    publicSubmission: true,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error, success: "" },
      { status: 400 },
    );
  }

  return NextResponse.json(result);
}
