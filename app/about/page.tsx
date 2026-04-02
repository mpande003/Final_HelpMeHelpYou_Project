import Link from "next/link";
import { PublicSiteShell } from "../components/marketing/PublicSiteShell";

export const metadata = {
  title: "About — Help me Help you NGO",
  description:
    "Learn about our mission, our work, and the community we serve across Nagpur.",
};

export default function AboutPage() {
  return (
    <PublicSiteShell activePath="/about">
      <section className="page-header">
        <div className="container">
          <div className="page-header-eyebrow">Our story</div>
          <h1>About Us</h1>
          <p>Learn about our mission, our work, and the community we serve across Nagpur.</p>
        </div>
      </section>

      <section className="content-section container">
        <h2 className="section-title">What we do</h2>
        <p className="section-sub">
          Help Me Help You is a registered NGO dedicated to health, social welfare, and
          environmental causes.
        </p>
        <div className="info-grid">
          <div className="info-card" style={{ animationDelay: "0.05s" }}>
            <h3>🩸 Healthcare</h3>
            <p>
              Blood donation camps, health checkup camps, cataract operations, and government
              scheme campaigns. We also provide ambulance services.
            </p>
          </div>
          <div className="info-card" style={{ animationDelay: "0.10s" }}>
            <h3>🤝 Social Work</h3>
            <p>
              Clothes donation programmes and collaborations with old age homes to support the
              elderly and underprivileged across Nagpur.
            </p>
          </div>
          <div className="info-card" style={{ animationDelay: "0.15s" }}>
            <h3>🌱 Environment</h3>
            <p>
              Plantation drives and pollution prevention campaigns to build a greener, healthier
              Nagpur for future generations.
            </p>
          </div>
          <div className="info-card" style={{ animationDelay: "0.20s" }}>
            <h3>🆘 Disaster Relief</h3>
            <p>
              Food kit distribution and emergency relief during crises, including COVID-19 kit
              distribution during the pandemic.
            </p>
          </div>
          <div className="info-card" style={{ animationDelay: "0.25s" }}>
            <h3>📅 Community Events</h3>
            <p>
              Regular blood donation camps organised with trained medical staff, strict safety
              protocols, and post-donation care.
            </p>
          </div>
          <div className="info-card" style={{ animationDelay: "0.30s" }}>
            <h3>📈 Transparency</h3>
            <p>
              Monthly reports on units collected, hospitals supported, and lives helped — so you
              can track our real impact.
            </p>
          </div>
        </div>
      </section>

      <section className="content-section container">
        <h2 className="section-title">Registration details</h2>
        <p className="section-sub">
          We are a legally registered NGO operating under Maharashtra state regulations.
        </p>
        <div className="grid two">
          <div className="card">
            <p>
              <strong>Registered name:</strong> Help Me Help You, Nagpur
            </p>
            <p>
              <strong>Registration no:</strong> F-0036303(NGP)
            </p>
            <p>
              <strong>Address:</strong> Hudkeshwar Road, Nagpur, 440024
            </p>
            <p>
              <strong>Contact:</strong> Gaurav Kohale —{" "}
              <a
                href="tel:9657774662"
                style={{ color: "var(--red)", textDecoration: "none", fontWeight: 600 }}
              >
                9657774662
              </a>
            </p>
          </div>
          <div className="card about-verify-card">
            <p className="about-verify-copy">
              Verified by the Charity Commissioner, Maharashtra State.
            </p>
            <a
              href="https://charity.maharashtra.gov.in/know-your-trust-en-US"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              Verify on Charity Portal
            </a>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-num">500+</span>
            <div className="stat-label">Blood units collected</div>
          </div>
          <div className="stat-box">
            <span className="stat-num">30+</span>
            <div className="stat-label">Events organised</div>
          </div>
          <div className="stat-box">
            <span className="stat-num">1000+</span>
            <div className="stat-label">Lives impacted</div>
          </div>
        </div>
      </section>

      <section className="cta container">
        <div className="cta-inner">
          <h2>Want to be part of our story?</h2>
          <p>Volunteer with us, or spread the word — every action counts.</p>
          <div className="about-cta-actions">
            <Link href="/volunteer" className="btn btn-primary">
              Become a Volunteer
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
