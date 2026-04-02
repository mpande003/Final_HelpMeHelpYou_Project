import ContactPageClient from "../components/marketing/ContactPageClient";
import { PublicSiteShell } from "../components/marketing/PublicSiteShell";

export const metadata = {
  title: "Contact – Help Me Help you",
  description: "Contact information for Help Me Help you.",
};

export default function ContactPage() {
  return (
    <PublicSiteShell activePath="/contact">
      <section className="page-header">
        <div className="container">
          <div className="page-header-eyebrow">Say Hello</div>
          <h1>Contact Us</h1>
          <p>Have a question, want to partner with us, or need more information? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <section className="content-section container">
        <div className="contact-info-layout">
          <div className="contact-info-column">
            <article className="contact-detail-card">
              <h2>
                <i className="fas fa-map-marker-alt" aria-hidden="true" /> Address
              </h2>
              <div className="detail-row detail-row-box">
                <i className="fas fa-map-marker-alt" aria-hidden="true" />
                <p>
                  <a
                    href="https://maps.app.goo.gl/EH73vm3CLh8J7Nez9"
                    target="_blank"
                    rel="noreferrer"
                    className="contact-link"
                  >
                    https://maps.app.goo.gl/EH73vm3CLh8J7Nez9
                  </a>
                </p>
              </div>
            </article>

            <article className="contact-detail-card">
              <h2>
                <i className="fas fa-phone-alt" aria-hidden="true" /> Phone
              </h2>
              <div className="detail-row detail-row-box">
                <i className="fas fa-user" aria-hidden="true" />
                <p>
                  Gaurav Kohale:{" "}
                  <a href="tel:9657774662" className="contact-link">
                    9657774662
                  </a>
                </p>
              </div>
            </article>

            <article className="contact-detail-card">
              <h2>
                <i className="fas fa-envelope" aria-hidden="true" /> Email
              </h2>
              <div className="detail-row detail-row-box">
                <i className="fas fa-envelope" aria-hidden="true" />
                <p>
                  <a href="mailto:helpmehelpyou.ngo@gmail.com" className="contact-link">
                    helpmehelpyou.ngo@gmail.com
                  </a>
                </p>
              </div>
            </article>

            <article className="contact-detail-card">
              <h2>
                <i className="fas fa-share-alt" aria-hidden="true" /> Social media
              </h2>
              <div className="detail-stack">
                <div className="detail-row detail-row-box">
                  <i className="fab fa-facebook" aria-hidden="true" />
                  <p>
                    <a
                      href="https://www.facebook.com/GauravPrakashKohale"
                      target="_blank"
                      rel="noreferrer"
                      className="contact-link"
                    >
                      Facebook — GauravPrakashKohale
                    </a>
                  </p>
                </div>
                <div className="detail-row detail-row-box">
                  <i className="fab fa-youtube" aria-hidden="true" />
                  <p>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      className="contact-link"
                    >
                      YouTube
                    </a>
                  </p>
                </div>
                <div className="detail-row detail-row-box">
                  <i className="fab fa-instagram" aria-hidden="true" />
                  <p>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="contact-link"
                    >
                      Instagram
                    </a>
                  </p>
                </div>
              </div>
            </article>

            <article className="contact-map-card">
              <div className="map-embed">
                <iframe
                  title="Help Me Help you Nagpur"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d56603.38944842113!2d79.0622801!3d21.1178798!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4b917e693b6cf%3A0xb267d047fd5332b7!2sGK%20LIGHTS%20JHOOMERWALA!5e1!3m2!1sen!2sin!4v1775151125511!5m2!1sen!2sin"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </article>
          </div>

          <div className="contact-form-column">
            <ContactPageClient />
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
