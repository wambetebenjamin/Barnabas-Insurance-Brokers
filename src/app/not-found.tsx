/**
 * 404 (brief section 17).
 *
 * Copy exactly as specified: "This policy or page could not be found." with the CTA
 * "Return to Homepage." and the coverage categories below.
 *
 * The design source’s own 404.html follows the same shape (spinner, top bar,
 * navbar, .page-header breadcrumb, centred message, footer, back to top), and the
 * shared layout supplies all of that chrome here.
 */
import Link from "next/link";
import type { Metadata } from "next";

import { PRODUCTS } from "@/data/products";
import { SITE, whatsappLink, NAV_ITEMS } from "@/lib/site";
import { Shield } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Page not found | Barnabas Insurance Brokers",
  description: "This policy or page could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <header className="b-pageheader">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <ol className="b-crumbs">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <span aria-current="page">Page not found</span>
              </li>
            </ol>
          </nav>
          <h1>404</h1>
          <p>This policy or page could not be found.</p>
        </div>
      </header>

      <section className="b-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <h2 className="h3 mb-3">Return to Homepage</h2>
              <p className="b-lead">
                The link may be out of date, or the page may have moved. Nothing has happened to your
                policies: this is just a page we cannot find. Start again from the homepage, or use one
                of the shortcuts below.
              </p>

              <div className="d-flex flex-wrap gap-2 mb-5">
                <Link href="/" className="btn btn-primary">
                  <i className="bi bi-house-door me-2" aria-hidden="true" />
                  Return to Homepage
                </Link>
                <Link href="/quote" className="btn b-btn-ghost">
                  Get a Free Quote
                </Link>
                <Link href="/contact" className="btn b-btn-ghost">
                  Contact us
                </Link>
                <a
                  className="btn b-btn-ghost"
                  href={whatsappLink("Hello Barnabas Insurance Brokers. I could not find a page on your website.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp me-2" aria-hidden="true" />
                  WhatsApp us
                </a>
              </div>

              <h2 className="h4 mb-3">Coverage categories</h2>
              <div className="b-grid-3">
                {PRODUCTS.map((product) => (
                  <div className="b-policy" key={product.slug}>
                    <h3 style={{ fontSize: 17 }}>{product.name}</h3>
                    <p className="b-fs-body-sm">{product.benefit}</p>
                    <Link href={`/products/${product.slug}`} className="b-card__link">
                      Read about {product.name.split(" ")[0].toLowerCase()}
                      <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="b-policy" style={{ marginTop: 28 }}>
                <h2 style={{ fontSize: 18 }}>
                  <Shield size={20} className="b-shield me-2" />
                  Main sections of this site
                </h2>
                <ul className="b-legal-links" style={{ fontSize: "var(--b-fs-body-sm)" }}>
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} style={{ color: "var(--b-primary)" }}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/portal" style={{ color: "var(--b-primary)" }}>
                      Client Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" style={{ color: "var(--b-primary)" }}>
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/privacy-policy" style={{ color: "var(--b-primary)" }}>
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
                <p className="b-legal-note mb-0" style={{ marginTop: 16 }}>
                  If you were trying to reach the client portal and the link failed, sign in again at{" "}
                  <Link href="/portal/login">/portal/login</Link>, or call us on {SITE.phone} and we
                  will help you in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
