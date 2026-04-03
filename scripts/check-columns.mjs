import fs from 'fs';

let envStr = fs.readFileSync('.env.local', 'utf-8');
envStr.split('\n').forEach(line => {
  if (line.includes('=')) {
    let [k, ...v] = line.split('=');
    process.env[k.trim()] = v.join('=').trim();
  }
});

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const data = await res.json();
  fs.writeFileSync('schema.json', JSON.stringify(data, null, 2));
}
run();
