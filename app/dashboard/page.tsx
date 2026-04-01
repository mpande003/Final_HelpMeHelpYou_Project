import { redirect } from "next/navigation";

import DashboardClient from "./DashboardClient";
import { requireActiveAdminSession } from "@/lib/auth";
import { listBeneficiaries } from "@/lib/beneficiaries";
import { listBloodDonors, listBloodRequests } from "@/lib/blood";
import { listExpenses } from "@/lib/expenses";
import { listEvents } from "@/lib/events";
import { listAuditLogs, listUsers } from "@/lib/users";
import { listVolunteers } from "@/lib/volunteers";

export default async function DashboardPage() {
  const adminUser = await requireActiveAdminSession()
    .then(({ user }) => user)
    .catch(() => redirect("/login"));

  const users = listUsers();
  const auditLogs = listAuditLogs();
  const events = listEvents();
  const volunteers = listVolunteers();
  const bloodDonors = listBloodDonors();
  const bloodRequests = listBloodRequests();
  const expenses = listExpenses();
  const beneficiaries = listBeneficiaries();

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
    />
  );
}
