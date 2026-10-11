/**
 * Regulatory bar (brief section 1).
 *
 * A thin full-width strip above the navbar carrying the licence information a
 * Kenyan client is entitled to see before they read anything else. Abbreviated
 * on mobile so it never wraps to three lines at 320px.
 */
import { SITE } from "@/lib/site";

export function RegulatoryBar() {
  return (
    <div className="b-regbar" role="region" aria-label="Regulatory information">
      <div className="container b-regbar__inner">
        <span className="b-regbar__full">
          <i className="bi bi-shield-check b-regbar__shield" aria-hidden="true" />
          {SITE.name}. Licensed by IRA Kenya. Licence No: {SITE.iraLicenseNumber}. Member of AKI.
        </span>
        <span className="b-regbar__short">
          <i className="bi bi-shield-check b-regbar__shield" aria-hidden="true" />
          IRA Kenya licensed. Licence No: {SITE.iraLicenseNumber}
        </span>
        <span className="b-regbar__sep b-regbar__full" aria-hidden="true" />
        <span className="b-regbar__full">
          <i className="fa fa-phone-alt me-2" aria-hidden="true" />
          <a href={SITE.phoneHref}>{SITE.phone}</a>
        </span>
        <a className="b-regbar__short" href={SITE.phoneHref}>
          Call us
        </a>
      </div>
    </div>
  );
}
