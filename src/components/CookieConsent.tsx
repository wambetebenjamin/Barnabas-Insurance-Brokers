"use client";

/**
 * Cookie consent banner (brief section 6).
 *
 * The design source contains no cookie banner at all (see INVENTORY.md section 7),
 * so this is built to the specification: bottom-fixed, full width, the exact copy
 * from the brief, Accept All and Manage Preferences, a modal with four categories
 * where Necessary is locked, persisted in localStorage so it never repeats, and a
 * link to /legal/cookie-policy.
 *
 * Kenya Data Protection Act 2019: consent must be informed, specific and
 * withdrawable. So the banner names the four purposes, the modal explains each
 * one, and a client can change their mind at any time through the footer’s
 * "Cookie preferences" control, which reopens this modal.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

export const CONSENT_KEY = "bib.cookie-consent";
const CONSENT_VERSION = 1;

export interface ConsentState {
  version: number;
  decidedAt: string;
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CATEGORIES = [
  {
    key: "necessary" as const,
    title: "Necessary",
    body: "Required for the site to work: security, form submission, session handling for the client portal, and remembering this consent choice. These cookies cannot be switched off.",
    locked: true,
  },
  {
    key: "functional" as const,
    title: "Functional",
    body: "Remember your preferences, such as the insurance type you were last comparing and your county, so you do not have to enter them again.",
    locked: false,
  },
  {
    key: "analytics" as const,
    title: "Analytics",
    body: "Anonymous statistics about which pages and which insurance products are used most, so we can improve the site. No financial or health information is ever included.",
    locked: false,
  },
  {
    key: "marketing" as const,
    title: "Marketing",
    body: "Measure the effectiveness of our campaigns so we do not waste money on advertising that does not reach Kenyan clients. We do not sell your data.",
    locked: false,
  },
];

const readConsent = (): ConsentState | null => {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
};

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState({ functional: true, analytics: true, marketing: false });
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = readConsent();
    if (stored) {
      setPrefs({
        functional: stored.functional,
        analytics: stored.analytics,
        marketing: stored.marketing,
      });
    } else {
      setVisible(true);
    }

    // The footer’s "Cookie preferences" link reopens the modal at any time.
    const reopen = () => {
      const current = readConsent();
      if (current) {
        setPrefs({
          functional: current.functional,
          analytics: current.analytics,
          marketing: current.marketing,
        });
      }
      setModalOpen(true);
    };
    window.addEventListener("bib:open-cookie-preferences", reopen);
    return () => window.removeEventListener("bib:open-cookie-preferences", reopen);
  }, []);

  const persist = useCallback((state: Omit<ConsentState, "version" | "decidedAt" | "necessary">) => {
    const record: ConsentState = {
      version: CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
      necessary: true,
      ...state,
    };
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch {
      /* private mode: the choice simply will not persist */
    }
    setVisible(false);
    setModalOpen(false);
    window.dispatchEvent(new CustomEvent("bib:cookie-consent-changed", { detail: record }));
  }, []);

  if (!mounted || (!visible && !modalOpen)) return null;

  return (
    <>
      {visible && !modalOpen && (
        <div
          ref={bannerRef}
          className="b-cookie"
          role="region"
          aria-label="Cookie consent"
        >
          <div className="container b-cookie__inner">
            <div className="b-cookie__copy">
              <p>
                Barnabas Insurance Brokers uses cookies to personalise your insurance browsing
                experience and improve our site. See our{" "}
                <Link href="/legal/cookie-policy">Cookie Policy</Link>.
              </p>
              <p className="b-cookie__foot mb-0">
                Under the Kenya Data Protection Act 2019 you may accept, refuse, or withdraw
                consent for each category at any time. We are licensed by IRA Kenya, Licence No:{" "}
                <strong style={{ color: "#fff" }}>{SITE.iraLicenseNumber}</strong>, and this notice
                forms part of our regulatory disclosures.
              </p>
            </div>
            <div className="b-cookie__actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => persist({ functional: true, analytics: true, marketing: true })}
              >
                Accept All
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => setModalOpen(true)}
              >
                Manage Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="b-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="b-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") setModalOpen(false);
            }}
          >
            <div className="b-modal__head">
              <div>
                <h2 id="cookie-modal-title">Cookie preferences</h2>
                <p className="mb-0">
                  Choose which categories we may use. Necessary cookies are always on because the
                  site cannot work without them.
                </p>
              </div>
              <button
                type="button"
                className="b-modal__close"
                onClick={() => setModalOpen(false)}
              >
                <span className="b-visually-hidden">Close cookie preferences</span>
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>

            <div style={{ marginTop: 22 }}>
              {CATEGORIES.map((category) => {
                const checked = category.locked
                  ? true
                  : prefs[category.key as "functional" | "analytics" | "marketing"];
                return (
                  <div className="b-pref" key={category.key} id={`cookie-${category.key}`}>
                    <div className="b-pref__top">
                      <div>
                        <h3>{category.title}</h3>
                        <p>{category.body}</p>
                      </div>
                      {category.locked ? (
                        <span className="b-pref__locked">
                          <i className="bi bi-lock-fill me-1" aria-hidden="true" />
                          Always on
                        </span>
                      ) : (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          aria-labelledby={`cookie-${category.key}-label`}
                          className="b-switch"
                          onClick={() =>
                            setPrefs((current) => ({
                              ...current,
                              [category.key]: !current[category.key as "functional" | "analytics" | "marketing"],
                            }))
                          }
                        >
                          <span className="b-visually-hidden">
                            {category.title} cookies, currently {checked ? "on" : "off"}
                          </span>
                        </button>
                      )}
                    </div>
                    <span id={`cookie-${category.key}-label`} className="b-visually-hidden">
                      {category.title} cookies
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="b-modal__foot">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => persist({ functional: false, analytics: false, marketing: false })}
              >
                Reject non-essential
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => persist(prefs)}
              >
                Save preferences
              </button>
            </div>
            <p className="b-meta text-muted mb-0" style={{ marginTop: 14 }}>
              Details of every cookie, its purpose and its retention period are in the{" "}
              <Link href="/legal/cookie-policy">Cookie Policy</Link>. You can reopen this panel at
              any time from the footer.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer control that reopens the preferences modal (brief: no repeat, but revisitable). */
export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="btn btn-link p-0 text-start b-legal-link"
      style={{ color: "#A7A8B4", fontSize: "max(11px, 0.6875rem)", textDecoration: "none" }}
      onClick={() => window.dispatchEvent(new CustomEvent("bib:open-cookie-preferences"))}
    >
      Cookie preferences
    </button>
  );
}
