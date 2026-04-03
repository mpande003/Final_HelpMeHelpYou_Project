import { redirect } from "next/navigation";

import DashboardClient from "./DashboardClient";
import { requireActiveAdminSession } from "@/lib/auth";
import { listBeneficiaries } from "@/lib/beneficiaries";
import { listBloodDonors, listBloodRequests } from "@/lib/blood";
import { listExpenses } from "@/lib/expenses";
import { listEvents } from "@/lib/events";
import { listAuditLogs, listUsers } from "@/lib/users";
import { listVolunteers } from "@/lib/volunteers";
import { listTemplates } from "@/lib/certificates";

export default async function DashboardPage() {
  const adminUser = await requireActiveAdminSession()
    .then(({ user }) => user)
    .catch(() => redirect("/login"));

  const [
    users,
    auditLogs,
    events,
    volunteers,
    bloodDonors,
    bloodRequests,
    expenses,
    beneficiaries,
    templates,
  ] = await Promise.all([
    Promise.resolve(listUsers()),
    Promise.resolve(listAuditLogs()),
    listEvents(),
    Promise.resolve(listVolunteers()),
    Promise.resolve(listBloodDonors()),
    Promise.resolve(listBloodRequests()),
    Promise.resolve(listExpenses()),
    Promise.resolve(listBeneficiaries()),
    Promise.resolve(listTemplates()),
  ]);

  return (
    <DashboardClient
      users={users}
      currentUsername={adminUser.username}
      auditLogs={auditLogs}
      events={events}
      volunteers={volunteers}
      bloodDonors={bloodDonors}
      bloodRequests={bloodRequests}
      expenses={expenses}
      beneficiaries={beneficiaries}
      templates={templates}
    />
  );
}
