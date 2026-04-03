import supabase from "./db";

export type CertificateField = {
  id: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  type?: "standard" | "custom";
  value?: string;
};

export type CertificateTemplate = {
  id: string;
  name: string;
  target_audience: "volunteer" | "beneficiary" | "blood_donor" | "all";
  image_url: string;
  fields: CertificateField[];
  created_at: string;
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

export async function createTemplate(input: Omit<CertificateTemplate, "id" | "created_at">) {
  const { data, error } = await supabase.from("certificate_templates").insert([
    {
      name: input.name,
      target_audience: input.target_audience,
      image_url: input.image_url,
      fields: input.fields,
    },
  ]).select().single();

  if (error) throw error;
  return data as CertificateTemplate;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from("certificate_templates").delete().eq("id", id);
  if (error) throw error;
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
