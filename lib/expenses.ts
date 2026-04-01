import { getDb } from "./db";

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

type ExpenseRow = {
  id: number;
  event_id: number | null;
  event_name: string | null;
  expense_title: string;
  category: string;
  amount: string;
  expense_date: string;
  payment_mode: string | null;
  status: string;
  vendor_name: string | null;
  reference_number: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function ensureExpensesTable() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      event_name TEXT,
      expense_title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      expense_date TEXT NOT NULL,
      payment_mode TEXT,
      status TEXT NOT NULL DEFAULT 'recorded',
      vendor_name TEXT,
      reference_number TEXT,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

function mapExpense(row: ExpenseRow): Expense {
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

export function listExpenses(): Expense[] {
  const db = ensureExpensesTable();
  const rows = db
    .prepare(
      `
        SELECT
          id, event_id, event_name, expense_title, category, amount, expense_date,
          payment_mode, status, vendor_name, reference_number, description,
          created_by, created_at, updated_at
        FROM expenses
        ORDER BY expense_date DESC, id DESC
      `,
    )
    .all() as ExpenseRow[];

  return rows.map(mapExpense);
}

export function createExpense(
  input: Omit<Expense, "id" | "createdAt" | "updatedAt">,
) {
  const db = ensureExpensesTable();

  return db
    .prepare(
      `
        INSERT INTO expenses (
          event_id, event_name, expense_title, category, amount, expense_date,
          payment_mode, status, vendor_name, reference_number, description, created_by
        ) VALUES (
          @eventId, @eventName, @expenseTitle, @category, @amount, @expenseDate,
          @paymentMode, @status, @vendorName, @referenceNumber, @description, @createdBy
        )
      `,
    )
    .run(input);
}

export function updateExpense(
  input: Omit<Expense, "createdAt" | "updatedAt" | "createdBy">,
) {
  const db = ensureExpensesTable();

  return db
    .prepare(
      `
        UPDATE expenses
        SET event_id = @eventId,
            event_name = @eventName,
            expense_title = @expenseTitle,
            category = @category,
            amount = @amount,
            expense_date = @expenseDate,
            payment_mode = @paymentMode,
            status = @status,
            vendor_name = @vendorName,
            reference_number = @referenceNumber,
            description = @description,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `,
    )
    .run(input);
}

export function deleteExpense(expenseId: number) {
  const db = ensureExpensesTable();
  return db.prepare("DELETE FROM expenses WHERE id = ?").run(expenseId);
}
