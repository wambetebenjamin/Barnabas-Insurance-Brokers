/**
 * Contact (brief section 14).
 *
 * Office address, Google Maps embed, phone, WhatsApp, the IRA Kenya licence number
 * displayed, and the enquiry form with reCAPTCHA v3.
 */
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { NewsletterForm } from "@/components/NewsletterForm";
import { RegulatorBadge } from "@/components/Brand";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact Barnabas Insurance Brokers | Nairobi, Kenya",
  description:
    "Talk to a licensed insurance broker in Nairobi. Office address, phone, WhatsApp, email, and an enquiry form. Licensed by IRA Kenya.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        intro="Call, WhatsApp, email, or send the form. A licensed broker replies during working hours, and always within one working day."
        crumbs={[{ name: "Contact", href: "/contact" }]}
      />

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <h2 className="h3 mb-3">Our office</h2>
              <dl className="b-kv">
                <dt>Address</dt>
                <dd>{SITE.address}</dd>
                <dt>Phone</dt>
                <dd>
                  <a href={SITE.phoneHref} style={{ color: "var(--b-primary)" }}>
                    {SITE.phone}
                  </a>
                </dd>
                <dt>WhatsApp</dt>
                <dd>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--b-primary)" }}
                  >
                    Message us on WhatsApp
                  </a>
                </dd>
                <dt>Email</dt>
                <dd>
                  <a href={SITE.emailHref} style={{ color: "var(--b-primary)" }}>
                    {SITE.email}
                  </a>
                </dd>
                <dt>Working hours</dt>
                <dd>{SITE.hours}</dd>
                <dt>Regulator</dt>
                <dd>
                  Licensed by the Insurance Regulatory Authority of Kenya, licence no{" "}
                  {SITE.iraLicenseNumber}.
                </dd>
                <dt>Industry body</dt>
                <dd>Member of the Association of Kenya Insurers, {SITE.akiMemberNumber}.</dd>
              </dl>

              <div className="b-footer__badges" style={{ marginBottom: 24 }}>
                <RegulatorBadge />
              </div>

              <div className="b-card" style={{ boxShadow: "none", marginBottom: 24 }}>
                <div className="b-card__media" style={{ aspectRatio: "4 / 3", position: "relative" }}>
                  <iframe
                    title="Map showing the Barnabas Insurance Brokers office in Nairobi"
                    src={SITE.mapsEmbed}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ border: 0, width: "100%", height: "100%", position: "absolute", inset: 0 }}
                  />
                </div>
              </div>

              <div className="b-policy">
                <h2 style={{ fontSize: 18 }}>Newsletter</h2>
                <p className="b-fs-body-sm">Insurance tips and renewal reminders for Kenya.</p>
                <NewsletterForm variant="page" />
              </div>
            </div>

            <div className="col-lg-7">
              <ContactForm />

              <div className="b-policy" style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 18 }}>Reporting a claim instead?</h2>
                <p className="b-fs-body-sm">
                  Claims are handled by a dedicated team so nothing waits behind a general enquiry.
                  Use the claim notification form and your claim is opened the same working day.
                </p>
                <a className="btn btn-primary" href="/claims#notify">
                  Go to the claim notification form
                </a>
              </div>

              <div className="b-policy" style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 18 }}>Careers and partnerships</h2>
                <p className="b-fs-body-sm mb-0">
                  Looking to join the brokerage, or to partner with us as an agency? See our{" "}
                  <a href="/careers" style={{ color: "var(--b-primary)" }}>
                    careers page
                  </a>{" "}
                  for current openings and how to apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}
