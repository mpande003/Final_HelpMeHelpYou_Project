import supabase from "./db";

export type AppUser = {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuditLogEntry = {
  id: number;
  actorUsername: string;
  action: string;
  targetUsername: string;
  details: string | null;
  createdAt: string;
};

// ✅ Get user by username
export async function getUserByUsername(username: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  console.log("QUERY RESULT:", data);
  console.log("QUERY ERROR:", error);

  if (error || !data) return null;
  return {
    id: data.id,
    username: data.username,
    passwordHash: data.password_hash,
    role: data.role,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// export async function getUserByUsername(username: string): Promise<AppUser | null> {
//   const { data, error } = await supabase
//     .from("users")
//     .select("id, username, password_hash, role, status")
//     .eq("username", username)
//     .single();

//   if (error || !data) return null;

//   return {
//     id: data.id,
//     username: data.username,
//     passwordHash: data.password_hash,
//     role: data.role,
//     status: data.status,
//   };
// }

// ✅ List users
export async function listUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role, status, created_at, updated_at")
    .order("username", { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    username: row.username,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ✅ Create user
export async function createUser(input: {
  username: string;
  passwordHash: string;
  role: string;
}) {
  const { data, error } = await supabase.from("users").insert([
    {
      username: input.username,
      password_hash: input.passwordHash,
      role: input.role,
      status: "active",
    },
  ]);

  if (error) throw error;
  return data;
}

// ✅ Reset password
export async function resetUserPassword(input: {
  username: string;
  passwordHash: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .update({
      password_hash: input.passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq("username", input.username);

  if (error) throw error;
  return data;
}

// ✅ Update user status
export async function updateUserStatus(input: {
  username: string;
  status: "active" | "inactive";
}) {
  const { data, error } = await supabase
    .from("users")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("username", input.username);

  if (error) throw error;
  return data;
}

// ✅ Delete user
export async function deleteUser(username: string) {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("username", username);

  if (error) throw error;
  return data;
}

// ✅ Create audit log
export async function createAuditLog(input: {
  actorUsername: string;
  action: string;
  targetUsername: string;
  details?: string;
}) {
  const { data, error } = await supabase.from("audit_logs").insert([
    {
      actor_username: input.actorUsername,
      action: input.action,
      target_username: input.targetUsername,
      details: input.details ?? null,
    },
  ]);

  if (error) throw error;
  return data;
}

// ✅ List audit logs
export async function listAuditLogs(limit = 25): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    actorUsername: row.actor_username,
    action: row.action,
    targetUsername: row.target_username,
    details: row.details,
    createdAt: row.created_at,
  }));
}