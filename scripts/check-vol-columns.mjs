import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

let envStr = fs.readFileSync('.env.local', 'utf-8');
envStr.split('\n').forEach(line => {
  if (line.includes('=')) {
    let [k, ...v] = line.split('=');
    process.env[k.trim()] = v.join('=').trim();
  }
});

const cb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const expectedColumns = [
  "full_name",
  "date_of_birth",
  "gender",
  "phone_number",
  "email_address",
  "emergency_contact_name",
  "emergency_contact_phone",
  "full_address",
  "id_type",
  "id_number",
  "highest_education_level",
  "field_of_study",
  "college_school_name",
  "current_occupation",
  "areas_of_interest",
  "skills",
  "languages_known",
  "available_days",
  "available_time",
  "hours_per_week",
  "preferred_mode",
  "previous_volunteer_experience",
  "previous_organization_name",
  "previous_work_description",
  "motivation",
  "special_skills_or_certifications",
  "medical_conditions",
  "consent_terms",
  "consent_photos",
  "consent_policies",
  "created_by"
];

async function run() {
  const missing = [];
  const valid = [];
  
  for (const col of expectedColumns) {
    const { error } = await cb.from('volunteers').select(col).limit(1);
    // If error contains 'Could not find the X column' or 'column X does not exist'
    if (error && String(error.message).includes('find the')) {
      missing.push(col);
    } else {
      valid.push(col);
    }
  }

  console.log("Missing Columns:", missing);
  console.log("Valid Columns:", valid);
}

run();
