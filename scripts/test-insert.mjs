import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

if (fs.existsSync('.env.local')) {
  const envConfig = fs.readFileSync('.env.local', 'utf-8').split('\n');
  envConfig.forEach(line => {
    if (line.includes('=')) {
      const [key, ...val] = line.split('=');
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { data, error } = await supabase.from('volunteers').insert([{
    full_name: "Test Volunteer 1",
    phone_number: "8888888888",
    email_address: "test@example.com",
    created_by: "system",
    approval_status: "pending",

    full_address: "Pune",
    date_of_birth: "2000-01-01"
  }]);
  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Success:', data);
  }
}

testInsert();
