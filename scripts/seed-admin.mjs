import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    process.env[key] = value;
  }
}

// Ensure .env and .env.local are loaded so Supabase variables are available
loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env or .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const username = process.env.SEED_ADMIN_USERNAME || "admin";
const password = process.env.SEED_ADMIN_PASSWORD || "admin123@";
const role = process.env.SEED_ADMIN_ROLE || "admin";

async function seedAdmin() {
  const passwordHash = bcrypt.hashSync(password, 10);
  
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq("username", username);
      
    if (updateError) {
      console.error(`Failed to update user "${username}":`, updateError);
    } else {
      console.log(`Updated user "${username}" in Supabase db.`);
    }
  } else {
    const { error: insertError } = await supabase
      .from("users")
      .insert([
        {
          username: username,
          password_hash: passwordHash,
          role: role,
          status: "active"
        }
      ]);
      
    if (insertError) {
      console.error(`Failed to create user "${username}":`, insertError);
    } else {
      console.log(`Created user "${username}" in Supabase db.`);
    }
  }
}

seedAdmin();
