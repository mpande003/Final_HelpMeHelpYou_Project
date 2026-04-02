import Link from "next/link";
import { PublicSiteShell } from "./components/marketing/PublicSiteShell";

export const metadata = {
  title: "Help Me Help You",
  description: "Donate blood, save lives, and support the Help Me Help You initiative.",
};

export default function HomePage() {
  return (
    <PublicSiteShell activePath="/">
      <section className="hero hero-home">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-orb hero-orb-three" />
        <div className="container hero-home-inner">
          <div className="hero-copy">
            <div className="hero-badge">Nagpur, Maharashtra</div>
            <h1>
              Make a Difference in
              <span> Someone&apos;s Life</span>
            </h1>
            <p>
              Join our NGO initiatives including blood donation camps, health camps, environment
              drives and social welfare programs.
            </p>
            <div className="hero-actions hero-actions-home">
              <Link href="/volunteer" className="btn btn-primary hero-volunteer-btn">
                Become a Volunteer
              </Link>
              <Link href="/about" className="btn btn-outline hero-learn-btn">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container features">
        <article className="feature">
          <div className="feature-emoji" aria-hidden="true">
            🩸
          </div>
          <h3>Community drives</h3>
          <p>
            We organise regular blood donation camps across Nagpur with trained staff and strict
            safety protocols.
          </p>
        </article>
        <article className="feature">
          <div className="feature-emoji" aria-hidden="true">
            📊
          </div>
          <h3>Transparent impact</h3>
          <p>
            We publish monthly reports on units collected, hospitals supported, and lives helped.
          </p>
        </article>
        <article className="feature">
          <div className="feature-emoji" aria-hidden="true">
            🤝
          </div>
          <h3>Volunteer network</h3>
          <p>
            Volunteers help with registrations, awareness, and donor care — join the team and
            amplify the impact.
          </p>
        </article>
      </section>

    </PublicSiteShell>
  );
}
