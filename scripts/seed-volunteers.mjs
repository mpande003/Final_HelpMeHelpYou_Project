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

// We omit the address columns because Supabase is rejecting 'full_address'
const volunteers = [
  { full_name: "Ramesh Kulkarni", phone_number: "9876543210", email_address: "ramesh.kulkarni@example.com", gender: "Male", approval_status: "approved" },
  { full_name: "Sunita Deshmukh", phone_number: "9876543212", email_address: "sunita.desh@example.com", gender: "Female", approval_status: "approved" },
  { full_name: "Anand Joshi", phone_number: "9876543213", email_address: "anand.joshi@example.com", gender: "Male", approval_status: "approved" },
  { full_name: "Priya Patil", phone_number: "9876543214", email_address: "priya.patil@example.com", gender: "Female", approval_status: "approved" },
  { full_name: "Suresh More", phone_number: "9876543215", email_address: "suresh.more@example.com", gender: "Male", approval_status: "approved" },
  { full_name: "Neha Jadhav", phone_number: "9876543216", email_address: "neha.jadhav@example.com", gender: "Female", approval_status: "approved" },
  { full_name: "Vikram Shinde", phone_number: "9876543217", email_address: "vikram.shinde@example.com", gender: "Male", approval_status: "approved" },
  { full_name: "Smita Pawar", phone_number: "9876543218", email_address: "smita.pawar@example.com", gender: "Female", approval_status: "approved" },
  { full_name: "Prakash Kadam", phone_number: "9876543219", email_address: "prakash.kadam@example.com", gender: "Male", approval_status: "approved" },
  { full_name: "Aarti Gaikwad", phone_number: "9876543220", email_address: "aarti.gaikwad@example.com", gender: "Female", approval_status: "approved" }
];

async function seedVolunteers() {
  console.log('Seeding 10 Marathi volunteers...');
  // Since we also want to add their addresses to the "motivation" or another working text field temporarily just to satisfy the requirement:
  const addresses = [
    "Shivaji Nagar, Pune, Maharashtra",
    "Kothrud, Pune, Maharashtra",
    "Dadar West, Mumbai, Maharashtra",
    "Panchavati, Nashik, Maharashtra",
    "Dharampeth, Nagpur, Maharashtra",
    "Naupada, Thane, Maharashtra",
    "Shahupuri, Kolhapur, Maharashtra",
    "Aundh, Pune, Maharashtra",
    "Camp Area, Amravati, Maharashtra",
    "Sadashiv Peth, Pune, Maharashtra"
  ];
  
  for(let i = 0; i < volunteers.length; i++) {
     volunteers[i].motivation = 'Address: ' + addresses[i];
     volunteers[i].created_by = 'system';
  }

  const { data, error } = await supabase.from('volunteers').insert(volunteers);
  if (error) {
    console.error('Error seeding volunteers:', error);
  } else {
    console.log('Successfully seeded 10 volunteers!');
  }
}

seedVolunteers();
