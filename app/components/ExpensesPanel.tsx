"use client";

import { useActionState, useMemo, useState } from "react";

import {
  createExpenseAction,
  deleteExpenseAction,
  type ExpenseActionState,
  updateExpenseAction,
} from "../dashboard/expense-actions";
import type { Expense } from "@/lib/expenses";
import type { AppEvent } from "@/lib/events";
import {
  internalCardTitleClassName,
  internalCardClassName,
  internalFormInputSoftClassName,
  internalHeroSectionClassName,
  internalMetricCardClassName,
  internalMutedTextClassName,
  internalPanelEyebrowClassName,
  internalPrimaryButtonClassName,
  internalSecondaryButtonClassName,
  internalTableHeaderClassName,
  internalTableRowClassName,
} from "./internalTheme";

const inputClassName = internalFormInputSoftClassName;

const cardClassName = internalCardClassName;

function StateMessage({ state }: { state: ExpenseActionState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        state.error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {state.error || state.success}
    </div>
  );
}

function formatCurrency(value: string) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export default function ExpensesPanel({
  events,
  expenses,
}: {
  events: AppEvent[];
  expenses: Expense[];
}) {
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [editingExpense, setEditingExpense] = useState(false);
  const [createState, createAction, createPending] = useActionState<
    ExpenseActionState,
    FormData
  >(createExpenseAction, { error: "", success: "" });
  const [updateState, updateAction, updatePending] = useActionState<
    ExpenseActionState,
    FormData
  >(updateExpenseAction, { error: "", success: "" });

  const selectedExpense =
    expenses.find((expense) => expense.id === selectedExpenseId) ?? null;
  const totals = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        const amount = Number(expense.amount);
        if (!Number.isNaN(amount)) {
          acc.total += amount;
          if (expense.status === "paid") {
            acc.paid += amount;
          }
          if (expense.status === "pending") {
            acc.pending += amount;
          }
        }

        return acc;
      },
      { total: 0, paid: 0, pending: 0 },
    );
  }, [expenses]);

  const toggleView = (expenseId: number) => {
    setEditingExpense(false);
    setSelectedExpenseId((current) => (current === expenseId ? null : expenseId));
  };

  return (
    <div className="space-y-4">
      <section className={internalHeroSectionClassName}>
        <p className={internalPanelEyebrowClassName}>
          Finance operations
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#4b302a]">
          Expenses
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7a5a4d]">
          Record spending against NGO programs and events, keep payment status
          current, and maintain a compact finance register inside the admin
          dashboard.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { label: "Entries", value: String(expenses.length) },
            { label: "Total spent", value: formatCurrency(String(totals.total)) },
            { label: "Pending", value: formatCurrency(String(totals.pending)) },
          ].map((item) => (
            <div
              key={item.label}
              className={internalMetricCardClassName}
            >
              <p className={internalMutedTextClassName}>{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[#4b302a]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClassName}>
        <div className="mb-4">
          <p className={internalPanelEyebrowClassName}>
            Add expense
          </p>
          <h3 className={internalCardTitleClassName}>
            Record a new expense
          </h3>
        </div>

        <form action={createAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Expense Title
              </span>
              <input name="expenseTitle" className={inputClassName} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Category
              </span>
              <select name="category" className={inputClassName} defaultValue="" required>
                <option value="">Select category</option>
                {[
                  "Travel",
                  "Food",
                  "Medical Supplies",
                  "Venue",
                  "Volunteer Support",
                  "Printing",
                  "Equipment",
                  "Utilities",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Amount
              </span>
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                className={inputClassName}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Expense Date
              </span>
              <input name="expenseDate" type="date" className={inputClassName} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Linked Event
              </span>
              <select name="eventId" className={inputClassName} defaultValue="">
                <option value="">No linked event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Payment Mode
              </span>
              <select name="paymentMode" className={inputClassName} defaultValue="">
                <option value="">Select payment mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Status
              </span>
              <select name="status" className={inputClassName} defaultValue="recorded">
                <option value="recorded">Recorded</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="reimbursed">Reimbursed</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Vendor / Payee
              </span>
              <input name="vendorName" className={inputClassName} />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Reference No.
              </span>
              <input name="referenceNumber" className={inputClassName} />
            </label>
            <label className="block md:col-span-2 xl:col-span-3">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                Description
              </span>
              <textarea
                name="description"
                className={`${inputClassName} min-h-24`}
              />
            </label>
          </div>

          <StateMessage state={createState} />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createPending}
              className={internalPrimaryButtonClassName}
            >
              {createPending ? "Saving..." : "Save expense"}
            </button>
          </div>
        </form>
      </section>

      <section className={cardClassName}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={internalPanelEyebrowClassName}>
              Expense register
            </p>
            <h3 className={internalCardTitleClassName}>
              All expense entries
            </h3>
          </div>
          <p className={internalMutedTextClassName}>Total records: {expenses.length}</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className={internalTableHeaderClassName}>
                <th className="px-3 py-3 font-semibold">Expense</th>
                <th className="px-3 py-3 font-semibold">Event</th>
                <th className="px-3 py-3 font-semibold">Category</th>
                <th className="px-3 py-3 font-semibold">Amount</th>
                <th className="px-3 py-3 font-semibold">Date</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td className={`px-3 py-4 ${internalMutedTextClassName}`} colSpan={7}>
                    No expense entries recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className={internalTableRowClassName}>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-[#4b302a]">
                        {expense.expenseTitle}
                      </p>
                      <p className="mt-1 text-xs text-[#7a5a4d]">
                        {expense.vendorName || "No vendor"}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">
                      {expense.eventName || "General NGO expense"}
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">{expense.category}</td>
                    <td className="px-3 py-4 text-[#4b302a]">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-3 py-4 text-[#7a5a4d]">{expense.expenseDate}</td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-[#fff7cf] px-3 py-1 text-xs font-semibold text-[#fa5c5c]">
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleView(expense.id)}
                          className={`${internalSecondaryButtonClassName} px-3 py-1.5 text-xs`}
                        >
                          {selectedExpenseId === expense.id ? "Hide" : "View"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedExpenseId(expense.id);
                            setEditingExpense((current) =>
                              selectedExpenseId === expense.id ? !current : true,
                            );
                          }}
                          className={`${internalPrimaryButtonClassName} px-3 py-1.5 text-xs`}
                        >
                          Update
                        </button>
                        <form
                          action={deleteExpenseAction}
                          onSubmit={(event) => {
                            if (
                              !window.confirm(
                                `Delete expense "${expense.expenseTitle}"?`,
                              )
                            ) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="expenseId" value={expense.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-[#fff0f0] px-3 py-1.5 text-xs font-semibold text-[#a12628]"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedExpense && (
        <section className={cardClassName}>
          <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
              <p className={internalPanelEyebrowClassName}>
                Expense details
              </p>
              <h3 className={internalCardTitleClassName}>
                {selectedExpense.expenseTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setEditingExpense((current) => !current)}
              className={internalSecondaryButtonClassName}
            >
              {editingExpense ? "Close update" : "Update expense"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Event", selectedExpense.eventName || "General NGO expense"],
              ["Category", selectedExpense.category],
              ["Amount", formatCurrency(selectedExpense.amount)],
              ["Date", selectedExpense.expenseDate],
              ["Payment Mode", selectedExpense.paymentMode || "Not set"],
              ["Status", selectedExpense.status],
              ["Vendor / Payee", selectedExpense.vendorName || "Not set"],
              ["Reference", selectedExpense.referenceNumber || "Not set"],
              ["Description", selectedExpense.description || "No description"],
            ].map(([label, value]) => (
              <div
                key={label}
                className={internalMetricCardClassName}
              >
                <p className={internalPanelEyebrowClassName}>
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#7a5a4d]">{value}</p>
              </div>
            ))}
          </div>

          {editingExpense && (
            <form action={updateAction} className="mt-6 space-y-4">
              <input type="hidden" name="expenseId" value={selectedExpense.id} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Expense Title
                  </span>
                  <input
                    name="expenseTitle"
                    className={inputClassName}
                    defaultValue={selectedExpense.expenseTitle}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Category
                  </span>
                  <select
                    name="category"
                    className={inputClassName}
                    defaultValue={selectedExpense.category}
                    required
                  >
                    {[
                      "Travel",
                      "Food",
                      "Medical Supplies",
                      "Venue",
                      "Volunteer Support",
                      "Printing",
                      "Equipment",
                      "Utilities",
                      "Other",
                    ].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Amount
                  </span>
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    defaultValue={selectedExpense.amount}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Expense Date
                  </span>
                  <input
                    name="expenseDate"
                    type="date"
                    className={inputClassName}
                    defaultValue={selectedExpense.expenseDate}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Linked Event
                  </span>
                  <select
                    name="eventId"
                    className={inputClassName}
                    defaultValue={selectedExpense.eventId?.toString() ?? ""}
                  >
                    <option value="">No linked event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Payment Mode
                  </span>
                  <select
                    name="paymentMode"
                    className={inputClassName}
                    defaultValue={selectedExpense.paymentMode ?? ""}
                  >
                    <option value="">Select payment mode</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Status
                  </span>
                  <select
                    name="status"
                    className={inputClassName}
                    defaultValue={selectedExpense.status}
                  >
                    <option value="recorded">Recorded</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="reimbursed">Reimbursed</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Vendor / Payee
                  </span>
                  <input
                    name="vendorName"
                    className={inputClassName}
                    defaultValue={selectedExpense.vendorName ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Reference No.
                  </span>
                  <input
                    name="referenceNumber"
                    className={inputClassName}
                    defaultValue={selectedExpense.referenceNumber ?? ""}
                  />
                </label>
                <label className="block md:col-span-2 xl:col-span-3">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7441]">
                    Description
                  </span>
                  <textarea
                    name="description"
                    className={`${inputClassName} min-h-24`}
                    defaultValue={selectedExpense.description ?? ""}
                  />
                </label>
              </div>

              <StateMessage state={updateState} />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatePending}
                  className={internalPrimaryButtonClassName}
                >
                  {updatePending ? "Updating..." : "Update expense"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
