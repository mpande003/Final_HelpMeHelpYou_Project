import supabase from "./db";

export type CertificateField = {
  id: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  fontFace?: string;
  type?: "standard" | "custom";
  value?: string;
};

export type CertificateTemplate = {
  id: string;
  name: string;
  target_audience: "volunteer" | "beneficiary" | "blood_donor" | "all";
  image_url: string;
  fields?: CertificateField[];
  signature_url?: string;
  signature_x?: number;
  signature_y?: number;
  event_id?: number | null;
  created_at: string;
  updated_at: string;
};

export type CertificateIssuance = {
  id: string;
  template_id: string;
  recipient_id: string;
  recipient_name: string;
  event_name: string;
  token_id: string;
  issued_at: string;
};

export async function listTemplates() {
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === '42P01') {
      return []; // Table doesn't exist yet, return empty
    }
    throw error;
  }
  return data as CertificateTemplate[];
}

export async function createTemplate(input: Omit<CertificateTemplate, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("certificate_templates").insert([
    {
      name: input.name,
      target_audience: input.target_audience,
      image_url: input.image_url,
      fields: input.fields || [],
      signature_url: input.signature_url,
      signature_x: input.signature_x,
      signature_y: input.signature_y,
      event_id: input.event_id,
    },
  ]).select().single();

  if (error) throw error;
  return data as CertificateTemplate;
}

export async function updateTemplate(id: string, input: Partial<Omit<CertificateTemplate, "id" | "created_at">>) {
  const { data, error } = await supabase
    .from("certificate_templates")
    .update({
      ...input,
      fields: input.fields || [],
      event_id: input.event_id,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CertificateTemplate;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from("certificate_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function listIssuances() {
  const { data, error } = await supabase
    .from("certificate_issuances")
    .select("*")
    .order("issued_at", { ascending: false });

  if (error) throw error;
  return data as CertificateIssuance[];
}

export async function recordIssuance(input: Omit<CertificateIssuance, "id" | "issued_at">) {
  const { data, error } = await supabase
    .from("certificate_issuances")
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data as CertificateIssuance;
}

export function generateTokenId() {
  const prefix = "CEP";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous O, 0, I, 1
  let token = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) token += "-";
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${token}`;
}

export async function uploadTemplateImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('certificate_templates')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('certificate_templates')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
