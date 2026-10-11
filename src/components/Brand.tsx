/**
 * The Barnabas Insurance Brokers mark: a shield for protection, drawn in the
 * design source’s own brand blue (#015FC9, the `--primary` token) with the tick
 * in the source’s cyan (#0DD3F1, the `--secondary` token).
 *
 * The same path is reused by the navbar, the loading screen, the badges, and the
 * favicon, so the mark is identical everywhere. No photography, no raster logo.
 */
import { SITE } from "@/lib/site";

export function Shield({
  size = 32,
  className = "b-shield",
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d="M16 2.75 27.5 7.4v8.9c0 6.6-4.7 11.6-11.5 13.2C9.2 27.9 4.5 22.9 4.5 16.3V7.4L16 2.75Z" />
      <path className="b-shield__tick" d="M11.2 16.1l3.3 3.3 6.4-6.9" />
    </svg>
  );
}

/**
 * The full lockup: shield, wordmark, and the regulatory line beneath it.
 * `tone="dark"` is for the dark navbar/footer surfaces.
 */
export function Wordmark({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        color: tone === "dark" ? "#FFFFFF" : "var(--b-dark)",
      }}
    >
      <Shield size={40} />
      <span>
        <span
          style={{
            display: "block",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            fontSize: "1.05em",
            lineHeight: 1.15,
          }}
        >
          Barnabas <span style={{ color: tone === "dark" ? "#0DD3F1" : "var(--b-primary)" }}>Insurance</span>
        </span>
        <small
          style={{
            display: "block",
            fontFamily: "Roboto, sans-serif",
            fontWeight: 400,
            fontSize: "max(11px, 0.6875rem)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: tone === "dark" ? "#C9CEDD" : "#7C8290",
          }}
        >
          Licensed brokers, IRA Kenya
        </small>
      </span>
    </span>
  );
}

/** IRA Kenya + AKI badge, used in the footer, the about page and the 500 page. */
export function RegulatorBadge() {
  return (
    <>
      <span className="b-badge">
        <Shield size={20} />
        <span>
          <strong>Licensed by IRA Kenya</strong>
          Licence No: {SITE.iraLicenseNumber}
        </span>
      </span>
      <span className="b-badge">
        <i className="bi bi-patch-check" aria-hidden="true" />
        <span>
          <strong>Member of AKI</strong>
          {SITE.akiMemberNumber}
        </span>
      </span>
    </>
  );
}
