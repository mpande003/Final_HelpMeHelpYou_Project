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

async function clean() {
  const { error } = await supabase.from('volunteers').delete().eq('created_by', 'system');
  if (error) {
    console.log("Error cleaning up:", error);
  } else {
    console.log("Successfully deleted the 10 seeded volunteer records!");
  }
}

clean();
