"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";

import BeneficiariesPanel from "../components/BeneficiariesPanel";
import BloodDonationPanel from "../components/BloodDonationPanel";
import EventManagementHub from "../components/EventManagementHub";
import ExpensesPanel from "../components/ExpensesPanel";
import VolunteerManagementPanel from "../components/VolunteerManagementPanel";
import ImpactMapPanel from "./ImpactMapPanel";
import UserManagementPanel from "./UserManagementPanel";
import type { Beneficiary } from "@/lib/beneficiaries";
import type { BloodDonor, BloodRequest } from "@/lib/blood";
import type { Expense } from "@/lib/expenses";
import type { AppEvent } from "@/lib/events";
import type { Volunteer } from "@/lib/volunteers";
import {
  internalCardClassName,
  internalHeroSectionClassName,
  internalMetricCardClassName,
  internalMutedTextClassName,
  internalPanelEyebrowClassName,
  internalPrimaryButtonClassName,
  internalSecondaryButtonClassName,
  internalSoftMetricCardClassName,
} from "../components/internalTheme";

type UserSummary = {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuditLogEntry = {
  id: number;
  actorUsername: string;
  action: string;
  targetUsername: string;
  details: string | null;
  createdAt: string;
};

type DashboardClientProps = {
  users: UserSummary[];
  currentUsername: string;
  auditLogs: AuditLogEntry[];
  events: AppEvent[];
  volunteers: Volunteer[];
  beneficiaries: Beneficiary[];
  bloodDonors: BloodDonor[];
  bloodRequests: BloodRequest[];
  expenses: Expense[];
};

type MenuKey =
  | "dashboard"
  | "events"
  | "volunteers"
  | "beneficiaries"
  | "blood"
  | "impact"
  | "expenses"
  | "users";

type NavItem = {
  id: MenuKey;
  label: string;
  tone?: "default" | "accent";
};

const primaryNav: NavItem[] = [
  { id: "dashboard", label: "Overview" },
  { id: "events", label: "Events" },
  { id: "volunteers", label: "Volunteers" },
  { id: "beneficiaries", label: "Beneficiaries" },
  { id: "blood", label: "Blood Support" },
  { id: "impact", label: "Impact Map" },
  { id: "expenses", label: "Expenses" },
  { id: "users", label: "User Management", tone: "accent" },
];

const DashboardEventMap = dynamic(() => import("./EventMap"), { ssr: false });

function formatActionLabel(action: string) {
  return action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function DashboardHome({
  users,
  auditLogs,
  currentUsername,
  onNavigate,
  events,
  volunteers,
  beneficiaries,
  bloodDonors,
  bloodRequests,
  expenses,
}: {
  users: UserSummary[];
  auditLogs: AuditLogEntry[];
  currentUsername: string;
  onNavigate: (menu: MenuKey) => void;
  events: AppEvent[];
  volunteers: Volunteer[];
  beneficiaries: Beneficiary[];
  bloodDonors: BloodDonor[];
  bloodRequests: BloodRequest[];
  expenses: Expense[];
}) {
  const activeUsers = users.filter((user) => user.status === "active").length;
  const inactiveUsers = users.length - activeUsers;
  const recentAuditLogs = auditLogs.slice(0, 5);
  const completedEvents = events.filter(
    (event) => event.status?.toLowerCase() === "completed",
  ).length;
  const pendingVolunteerApprovals = volunteers.filter(
    (volunteer) => volunteer.approvalStatus !== "approved",
  ).length;
  const verifiedBloodRequests = bloodRequests.filter(
    (request) => request.verificationStatus === "verified",
  ).length;
  const openBloodRequests = bloodRequests.filter(
    (request) => request.fulfillmentStatus !== "fulfilled",
  ).length;
  const unlinkedBeneficiaries = beneficiaries.filter(
    (beneficiary) => beneficiary.eventId === null,
  ).length;
  const pendingExpenses = expenses.filter(
    (expense) => expense.status === "pending",
  ).length;
  const activeMapEvents = events.filter((event) => event.markerStatus === "active");
  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = Number(expense.amount);
    return Number.isNaN(amount) ? sum : sum + amount;
  }, 0);
  const eventExpenseTotals = Object.values(
    expenses.reduce<Record<string, { eventName: string; total: number }>>(
      (accumulator, expense) => {
        const eventName = expense.eventName || "General NGO";
        const amount = Number(expense.amount);

        if (Number.isNaN(amount)) {
          return accumulator;
        }

        if (!accumulator[eventName]) {
          accumulator[eventName] = { eventName, total: 0 };
        }

        accumulator[eventName].total += amount;
        return accumulator;
      },
      {},
    ),
  )
    .sort((left, right) => right.total - left.total)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <section className={internalHeroSectionClassName}>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className={internalPanelEyebrowClassName}>
              NGO operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#4b302a] sm:text-4xl">
              Welcome back, {currentUsername}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7a5a4d]">
              Monitor beneficiaries, events, volunteers, blood support,
              expenses, impact locations, and admin access from one compact
              workspace.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate("events")}
                className={internalPrimaryButtonClassName}
              >
                Manage events
              </button>
              <button
                type="button"
                onClick={() => onNavigate("beneficiaries")}
                className={internalSecondaryButtonClassName}
              >
                Add beneficiary
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                label: "Recent activity",
                value: String(auditLogs.length),
                note: "Logged admin actions across the system",
              },
              {
                label: "Pending approvals",
                value: String(pendingVolunteerApprovals),
                note: "Volunteer reviews waiting for approval",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={internalMetricCardClassName}
              >
                <p className={internalPanelEyebrowClassName}>
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#4b302a]">
                  {card.value}
                </p>
                <p className={`mt-1 ${internalMutedTextClassName}`}>{card.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Beneficiaries",
            value: beneficiaries.length,
            note: "People linked to NGO support records",
            tone: "bg-white",
          },
          {
            title: "Events conducted",
            value: completedEvents || events.length,
            note:
              completedEvents > 0
                ? "Marked completed in the event registry"
                : "Current saved event records",
            tone: "bg-[#fffdf7]",
          },
          {
            title: "Volunteers",
            value: volunteers.length,
            note: "Volunteer registrations in the system",
            tone: "bg-[#fff8e8]",
          },
          {
            title: "User IDs made",
            value: users.length,
            note: `${activeUsers} active, ${inactiveUsers} inactive`,
            tone: "bg-[#fff9ef]",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`${internalMetricCardClassName} shadow-sm ${card.tone}`}
          >
            <p className={internalMutedTextClassName}>{card.title}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#4b302a]">
              {card.value}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[#7a5a4d]">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Blood donations",
            value: bloodDonors.length,
            note: "Registered donor records",
          },
          {
            title: "Blood approvals",
            value: verifiedBloodRequests,
            note: "Verified blood support requests",
          },
          {
            title: "Active map markers",
            value: activeMapEvents.length,
            note: "Events currently visible on the map",
          },
          {
            title: "Total expenses",
            value: formatCurrency(totalExpenses),
            note: "Total across all expense entries",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`${internalMetricCardClassName} shadow-sm`}
          >
            <p className={internalMutedTextClassName}>{card.title}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#4b302a]">
              {card.value}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[#7a5a4d]">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={internalCardClassName}>
          <p className={internalPanelEyebrowClassName}>
            Expense ranking
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#4b302a]">
            Expenses per event
          </h2>

          <div className="mt-4 space-y-3">
            {eventExpenseTotals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#fec288] bg-[#fffdf3] p-5 text-sm text-[#7a5a4d]">
                No expense entries recorded yet.
              </div>
            ) : (
              eventExpenseTotals.map((item, index) => (
                <div
                  key={item.eventName}
                  className={`flex items-center justify-between gap-3 ${internalSoftMetricCardClassName}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#4b302a]">
                      {index + 1}. {item.eventName}
                    </p>
                    <p className="mt-1 text-xs text-[#7a5a4d]">
                      Sorted high to low
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#fa5c5c]">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={internalCardClassName}>
          <p className={internalPanelEyebrowClassName}>
            Impact snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#4b302a]">
            Small impact map
          </h2>

          <div className="mt-4 h-[260px] overflow-hidden rounded-xl border border-[#fec288] bg-[#fffdf3]">
            {activeMapEvents.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#7a5a4d]">
                No active mapped events available.
              </div>
            ) : (
              <DashboardEventMap
                events={activeMapEvents}
                selectedEventId={activeMapEvents[0]?.id ?? null}
                onSelectEvent={() => {}}
              />
            )}
          </div>
          <p className={`mt-3 ${internalMutedTextClassName}`}>
            {activeMapEvents.length} active event markers currently visible.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className={internalCardClassName}>
          <p className={internalPanelEyebrowClassName}>
            Recent activity
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#4b302a]">Audit snapshot</h2>

          <div className="mt-4 space-y-3">
            {recentAuditLogs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#fec288] bg-[#fffdf3] p-5 text-sm text-[#7a5a4d]">
                No audit events have been recorded yet.
              </div>
            ) : (
              recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className={internalSoftMetricCardClassName}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#4b302a]">
                      {formatActionLabel(log.action)}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#7a5a4d]">
                      {log.createdAt}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#7a5a4d]">
                    <span className="font-medium text-[#4b302a]">
                      {log.actorUsername}
                    </span>{" "}
                    acted on{" "}
                    <span className="font-medium text-[#4b302a]">
                      {log.targetUsername}
                    </span>
                    {log.details ? ` (${log.details})` : ""}.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={internalCardClassName}>
          <p className={internalPanelEyebrowClassName}>
            Operational notes
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#4b302a]">
            What needs attention
          </h2>

          <div className="mt-4 space-y-3">
            {[
              `${pendingVolunteerApprovals} volunteer approvals pending review`,
              `${openBloodRequests} blood requests still open`,
              `${unlinkedBeneficiaries} beneficiaries not yet linked to an event`,
              `${pendingExpenses} expense records marked pending`,
            ].map((item) => (
              <div
                key={item}
                className={`${internalSoftMetricCardClassName} text-sm text-[#7a5a4d]`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DashboardClient({
  users,
  currentUsername,
  auditLogs,
  events,
  volunteers,
  beneficiaries,
  bloodDonors,
  bloodRequests,
  expenses,
}: DashboardClientProps) {
  const [menu, setMenu] = useState<MenuKey>("dashboard");

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const renderContent = () => {
    switch (menu) {
      case "dashboard":
        return (
          <DashboardHome
            users={users}
            auditLogs={auditLogs}
            currentUsername={currentUsername}
            onNavigate={setMenu}
            events={events}
            volunteers={volunteers}
            beneficiaries={beneficiaries}
            bloodDonors={bloodDonors}
            bloodRequests={bloodRequests}
            expenses={expenses}
          />
        );
      case "events":
        return <EventManagementHub events={events} />;
      case "volunteers":
        return (
          <VolunteerManagementPanel volunteers={volunteers} events={events} />
        );
      case "beneficiaries":
        return <BeneficiariesPanel events={events} beneficiaries={beneficiaries} />;
      case "blood":
        return (
          <BloodDonationPanel
            events={events}
            donors={bloodDonors}
            requests={bloodRequests}
          />
        );
      case "impact":
        return <ImpactMapPanel events={events} />;
      case "expenses":
        return <ExpensesPanel events={events} expenses={expenses} />;
      case "users":
        return (
          <UserManagementPanel
            users={users}
            currentUsername={currentUsername}
            auditLogs={auditLogs}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] text-[#4b302a]">
      <div className="mx-auto grid min-h-screen max-w-[1480px] gap-4 px-3 py-3 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-4 lg:py-4">
        <aside className="rounded-2xl border border-[#fec288] bg-[#fffdf3] p-4 shadow-sm">
          <div className="rounded-xl border border-[#fec288] bg-white p-3.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#fa5c5c]">
              Signed in as
            </p>
            <p className="mt-1.5 text-base font-semibold text-[#4b302a]">
              {currentUsername}
            </p>
            <p className="mt-1 text-sm text-[#7a5a4d]">Protected admin session.</p>
          </div>

          <nav className="mt-4 space-y-1.5">
            {primaryNav.map((item) => {
              const isActive = menu === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMenu(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                    isActive
                      ? "border border-[#fa5c5c] bg-[#fa5c5c] text-white shadow-[0_10px_24px_rgba(250,92,92,0.24)]"
                      : item.tone === "accent"
                        ? "border border-[#fec288] bg-[#fff7cf] text-[#fa5c5c] hover:bg-[#fff0b8]"
                        : "text-[#7a5a4d] hover:bg-[#fff7cf]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="h-2.5 w-2.5 rounded-full bg-[#fbef76]" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-[#fec288] bg-white p-3.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#fa5c5c]">
              Current state
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#7a5a4d]">Protected routes</span>
              <span className="rounded-full bg-[#fff0b8] px-3 py-1 font-medium text-[#fa5c5c]">
                Active
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[#7a5a4d]">Audit logging</span>
              <span className="rounded-full bg-[#fff7cf] px-3 py-1 font-medium text-[#fd8a6b]">
                Enabled
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-xl border border-[#fec288] bg-white px-4 py-2.5 text-sm font-semibold text-[#fa5c5c] transition hover:bg-[#fff7cf]"
          >
            Logout
          </button>
        </aside>

        <main className="min-w-0 rounded-2xl border border-[#fec288] bg-[#fffdf3] p-3 shadow-sm sm:p-4 lg:p-5">
          <div className="min-w-0">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
