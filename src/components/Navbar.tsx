"use client";

/**
 * Sticky navbar (brief section 2).
 *
 * Source behaviour preserved exactly from js/main.js: past 300px of scroll the
 * bar gets the shadow and slides to the top, before that it sits at -100px.
 * The archive expresses that with `top: -100px` on a sticky element; because a
 * regulatory bar now sits above the navbar, the same 100px/300px contract is
 * expressed as a transform (see .b-nav-wrap in globals.css) and the class list
 * the source used (`shadow-sm`, `sticky-top`) is still applied so any third
 * party style that targets it keeps working.
 *
 * Mobile: a full-screen overlay, focus trapped, Escape closes it, body scroll
 * locked, and the trigger is a 48x48 target.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS, SITE } from "@/lib/site";
import { Shield, Wordmark } from "@/components/Brand";
import { whatsappLink } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Source threshold: 300px. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close the overlay on navigation and lock the page behind it while open. */
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("b-nav-locked");
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab") {
        const focusables = document.querySelectorAll<HTMLElement>(
          ".b-nav-overlay a, .b-nav-overlay button",
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("b-nav-locked");
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  return (
    <>
      <div className={`b-nav-wrap ${scrolled ? "" : "is-hidden"}`}>
        <nav
          className={`navbar navbar-expand-lg bg-white navbar-light sticky-top px-4 px-lg-5 b-nav ${
            scrolled ? "is-stuck shadow-sm" : ""
          }`}
          aria-label="Main navigation"
        >
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <Wordmark />
          </Link>

          <button
            ref={triggerRef}
            type="button"
            className="b-nav-toggle"
            aria-expanded={open}
            aria-controls="b-nav-overlay"
            onClick={() => setOpen(true)}
          >
            <span className="b-visually-hidden">Open the menu</span>
            <i className="bi bi-list" style={{ fontSize: 22 }} aria-hidden="true" />
          </button>

          <div className="collapse navbar-collapse d-none d-lg-flex">
            <div className="navbar-nav mx-auto bg-light rounded pe-4 py-3 py-lg-0">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item nav-link ${isActive(item.href) ? "active" : ""}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/quote" className="btn btn-primary px-3 d-none d-lg-inline-flex">
            <i className="bi bi-file-earmark-text" aria-hidden="true" />
            Get a Free Quote
          </Link>
        </nav>
      </div>

      {open && (
        <div className="b-nav-overlay" id="b-nav-overlay" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="b-nav-overlay__head">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Shield size={34} className="b-shield" title="Barnabas Insurance Brokers" />
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#fff" }}>
                Barnabas Insurance
              </span>
            </span>
            <button
              ref={closeRef}
              type="button"
              className="b-nav-overlay__close"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              <span className="b-visually-hidden">Close the menu</span>
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? "is-active" : ""}>
                {item.label}
                <i className="bi bi-chevron-right" aria-hidden="true" style={{ opacity: 0.6 }} />
              </Link>
            ))}
            <Link href="/portal">
              Client Portal
              <i className="bi bi-chevron-right" aria-hidden="true" style={{ opacity: 0.6 }} />
            </Link>
          </nav>

          <div className="b-nav-overlay__foot">
            <Link href="/quote" className="btn btn-primary w-100 py-3">
              Get a Free Quote
            </Link>
            <a
              className="btn btn-outline-light w-100 py-3"
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp me-2" aria-hidden="true" />
              WhatsApp us
            </a>
            <p className="b-nav-overlay__contact mb-0">
              <a href={SITE.phoneHref}>{SITE.phone}</a>
              <br />
              {SITE.email}
              <br />
              <span style={{ fontSize: "max(11px, 0.6875rem)" }}>
                Licensed by IRA Kenya. Licence No: {SITE.iraLicenseNumber}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
