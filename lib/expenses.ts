import supabase from "./db";

export type Expense = {
  id: number;
  eventId: number | null;
  eventName: string | null;
  expenseTitle: string;
  category: string;
  amount: string;
  expenseDate: string;
  paymentMode: string | null;
  status: string;
  vendorName: string | null;
  referenceNumber: string | null;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// ✅ Map DB → App
function mapExpense(row: any): Expense {
  return {
    id: row.id,
    eventId: row.event_id,
    eventName: row.event_name,
    expenseTitle: row.expense_title,
    category: row.category,
    amount: row.amount,
    expenseDate: row.expense_date,
    paymentMode: row.payment_mode,
    status: row.status,
    vendorName: row.vendor_name,
    referenceNumber: row.reference_number,
    description: row.description,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ✅ LIST
export async function listExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (error) throw error;

  return data.map(mapExpense);
}

// ✅ CREATE
export async function createExpense(
  input: Omit<Expense, "id" | "createdAt" | "updatedAt">,
) {
  const { data, error } = await supabase.from("expenses").insert([
    {
      event_id: input.eventId,
      event_name: input.eventName,
      expense_title: input.expenseTitle,
      category: input.category,
      amount: input.amount,
      expense_date: input.expenseDate,
      payment_mode: input.paymentMode,
      status: input.status,
      vendor_name: input.vendorName,
      reference_number: input.referenceNumber,
      description: input.description,
      created_by: input.createdBy,
    },
  ]);

  if (error) throw error;
  return data;
}

// ✅ UPDATE
export async function updateExpense(
  input: Omit<Expense, "createdAt" | "updatedAt" | "createdBy">,
) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      event_id: input.eventId,
      event_name: input.eventName,
      expense_title: input.expenseTitle,
      category: input.category,
      amount: input.amount,
      expense_date: input.expenseDate,
      payment_mode: input.paymentMode,
      status: input.status,
      vendor_name: input.vendorName,
      reference_number: input.referenceNumber,
      description: input.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) throw error;
  return data;
}

// ✅ DELETE
export async function deleteExpense(expenseId: number) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) throw error;
}