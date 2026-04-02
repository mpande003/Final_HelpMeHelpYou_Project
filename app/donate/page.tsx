import Link from "next/link";
import { PublicSiteShell } from "../components/marketing/PublicSiteShell";

export const metadata = {
  title: "Donate | Help Me Help You",
  description: "Learn how to schedule your blood donation and basic eligibility information.",
};

export default function DonatePage() {
  return (
    <PublicSiteShell activePath="/donate">
      <section className="container page-header">
        <h1>Schedule your donation</h1>
        <p>
          Fill in your details and preferred date. We&apos;ll confirm by email and share camp
          instructions.
        </p>
      </section>

      <section className="container content-section">
        <div className="grid two">
          <article className="card">
            <h2>Basic eligibility</h2>
            <ul className="list">
              <li>
                <strong>Age:</strong> 18-65 years.
              </li>
              <li>
                <strong>Weight:</strong> At least 50 kg.
              </li>
              <li>
                <strong>Interval:</strong> Minimum 3 months since last donation.
              </li>
              <li>
                <strong>Health:</strong> No active infections; normal hemoglobin levels.
              </li>
            </ul>
            <p>
              When in doubt, consult a medical professional. Camp staff will perform a quick
              screening before donation.
            </p>
          </article>

          <article className="card">
            <h2>Next step</h2>
            <p>
              Continue into the CEP platform for volunteer coordination and event participation.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn btn-primary">
                Continue to app
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contact us
              </Link>
            </div>
          </article>
        </div>
      </section>
    </PublicSiteShell>
  );
}
