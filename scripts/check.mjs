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

async function run() {
  const { data, error } = await cb.rpc('get_columns'); // Supabase REST doesn't allow raw sql. 
  // Let's just fetch all rows, wait it was empty.
  // We can insert an empty object to see the error which might list some issues, or just read the TypeScript types if they exist?

}
run();
