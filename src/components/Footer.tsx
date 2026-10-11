/**
 * Footer (brief section 15), built on the design source’s own footer.
 *
 * Kept from the archive: `container-fluid bg-dark footer mt-5 pt-5`, the four
 * column layout, `.btn.btn-link` quick link styling with the chevron ::before,
 * the social `btn-square` row, the newsletter field with the absolutely
 * positioned submit button, and `.copyright` with its 25px padding, 15px type
 * and rgba(256,256,256,.1) top border.
 *
 * Added: the products, services and legal link groups the brief lists, the IRA
 * Kenya and AKI badges, the WhatsApp line, and the "Cookie preferences" control
 * that reopens the consent panel.
 *
 * The HTML Codex attribution below is a condition of the template licence
 * (see _source/LICENSE.txt) and is not a design choice, so it stays.
 */
import Link from "next/link";
import { SITE, FOOTER_PRODUCTS, FOOTER_SERVICES, FOOTER_LEGAL, FOOTER_COMPANY, whatsappLink } from "@/lib/site";
import { Wordmark, RegulatorBadge } from "@/components/Brand";
import { NewsletterForm } from "@/components/NewsletterForm";
import { CookiePreferencesButton } from "@/components/CookieConsent";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="container-fluid bg-dark footer mt-5 pt-5 wow fadeIn b-footer" id="site-footer">
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-3 col-md-6 b-footer__brand">
            <Link href="/" className="text-decoration-none d-inline-block mb-4">
              <Wordmark tone="dark" />
            </Link>
            <p>
              Independent insurance brokers in Nairobi. We compare all major insurers in Kenya so
              you get the right cover at the best price, and we stand with you when you claim.
            </p>

            <div className="d-flex flex-wrap gap-2 pt-2 b-footer__social">
              <a href={SITE.social.facebook} aria-label="Barnabas Insurance Brokers on Facebook" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-facebook-f" aria-hidden="true" />
              </a>
              <a href={SITE.social.x} aria-label="Barnabas Insurance Brokers on X" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-twitter" aria-hidden="true" />
              </a>
              <a href={SITE.social.linkedin} aria-label="Barnabas Insurance Brokers on LinkedIn" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-linkedin-in" aria-hidden="true" />
              </a>
              <a href={SITE.social.instagram} aria-label="Barnabas Insurance Brokers on Instagram" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-instagram" aria-hidden="true" />
              </a>
              <a href={SITE.social.youtube} aria-label="Barnabas Insurance Brokers on YouTube" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-youtube" aria-hidden="true" />
              </a>
            </div>

            <div className="b-footer__badges">
              <RegulatorBadge />
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="text-light mb-4">Products</h5>
            {FOOTER_PRODUCTS.map((item) => (
              <Link key={item.href} href={item.href} className="btn btn-link">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="text-light mb-4">Services</h5>
            {FOOTER_SERVICES.map((item) => (
              <Link key={item.href} href={item.href} className="btn btn-link">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="text-light mb-4">Company</h5>
            {FOOTER_COMPANY.map((item) => (
              <Link key={item.href} href={item.href} className="btn btn-link">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="col-lg-3 col-md-6">
            <h5 className="text-light mb-4">Talk to a broker</h5>
            <p className="mb-2">
              <i className="fa fa-map-marker-alt me-3" aria-hidden="true" />
              {SITE.address}
            </p>
            <p className="mb-2">
              <i className="fa fa-phone-alt me-3" aria-hidden="true" />
              <a href={SITE.phoneHref} style={{ color: "#A7A8B4" }}>
                {SITE.phone}
              </a>
            </p>
            <p className="mb-2">
              <i className="fab fa-whatsapp me-3" aria-hidden="true" />
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#A7A8B4" }}
              >
                WhatsApp a broker
              </a>
            </p>
            <p className="mb-4">
              <i className="fa fa-envelope me-3" aria-hidden="true" />
              <a href={SITE.emailHref} style={{ color: "#A7A8B4" }}>
                {SITE.email}
              </a>
            </p>

            <h5 className="text-light mb-3">Newsletter</h5>
            <p className="mb-3">Insurance tips and renewal reminders for Kenya.</p>
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </div>

      <div className="container-fluid copyright">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; {year} <Link href="/">{SITE.name}</Link>, All Right Reserved.
              <br />
              <span style={{ fontSize: "max(11px, 0.6875rem)", color: "#8C92A4" }}>
                Licensed by IRA Kenya, Licence No: {SITE.iraLicenseNumber}. Member of the
                Association of Kenya Insurers ({SITE.akiMemberNumber}). We advise and place cover,
                the insurer pays claims.
              </span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <ul className="b-legal-links justify-content-center justify-content-md-end mb-2">
                {FOOTER_LEGAL.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
                <li>
                  <CookiePreferencesButton />
                </li>
              </ul>
              {/* Required by the design source licence (see _source/LICENSE.txt). */}
              <span style={{ fontSize: "max(11px, 0.6875rem)" }}>
                Designed By <a href="https://htmlcodex.com">HTML Codex</a>
                <br />
                Distributed By:{" "}
                <a href="https://themewagon.com" target="_blank" rel="noopener noreferrer">
                  ThemeWagon
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
