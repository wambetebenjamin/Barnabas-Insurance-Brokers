"use client";

/**
 * Loading screen (brief section 4).
 *
 * The design source already ships a loading screen, so it is extended rather
 * than replaced. The archive’s contract is preserved exactly:
 *   <div id="spinner" class="show …"><div class="spinner-grow text-primary" role="status"></div></div>
 *   #spinner { opacity: 0; visibility: hidden; transition: opacity .5s ease-out, visibility 0s linear .5s; z-index: 99999 }
 *   #spinner.show { transition: opacity .5s ease-out, visibility 0s linear 0s; visibility: visible; opacity: 1 }
 *   dismissed on the next tick by js/main.js
 *
 * Added, per the brief:
 *   - a shield that draws itself stroke by stroke, then the wordmark, then a progress bar
 *   - completion announced through role="status"
 *   - finished in under 2 seconds (progress runs 1.7s), with a skip control always
 *     available and a hard stop at 3 seconds whatever happens
 *   - under prefers-reduced-motion, no drawing and no bar: a plain text percentage
 *
 * Shown once per browser session: the archive’s spinner fired on every page load,
 * which on a multi page React app would be a flash on every navigation.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Shield } from "@/components/Brand";

const STORAGE_KEY = "bib.loader.seen";
const DURATION_MS = 1700; // completes well inside the "under 2 seconds" requirement
const HARD_STOP_MS = 3000; // brief: skip at 3 seconds
const FADE_MS = 500; // matches the source transition

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [reduced, setReduced] = useState(false);
  const startedAt = useRef<number>(0);
  const frame = useRef<number | null>(null);

  const finish = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setProgress(100);
    setAnnouncement("Loading complete.");
    window.setTimeout(() => setVisible(false), 160);
  }, []);

  useEffect(() => {
    setMounted(true);

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) return;

    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode: show it anyway, it just repeats */
    }

    setVisible(true);

    // Reduced motion: no stroke animation and no bar, a plain text percentage
    // that steps to 100 immediately.
    if (prefersReduced) {
      setProgress(100);
      setAnnouncement("Loading complete.");
      const timer = window.setTimeout(() => setVisible(false), 600);
      return () => window.clearTimeout(timer);
    }

    startedAt.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt.current;
      const ratio = Math.min(1, elapsed / DURATION_MS);
      // easeOutCubic, so the bar decelerates into completion
      const eased = 1 - Math.pow(1 - ratio, 3);
      setProgress(Math.round(eased * 100));
      if (ratio >= 1) {
        finish();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);

    // Hard stop: whatever state the animation is in, it is gone at 3 seconds.
    const hardStop = window.setTimeout(() => {
      finish();
    }, HARD_STOP_MS);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.clearTimeout(hardStop);
    };
  }, [finish]);

  const skip = () => finish();

  // Nothing is rendered until the client has decided, so no markup is ever
  // produced on the server for a component that is purely a first-paint effect.
  if (!mounted) return null;

  return (
    <div
      id="spinner"
      className={visible ? "show" : ""}
      aria-busy={visible}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100vh" }}
    >
      <div className="b-loader">
        <Shield size={96} className="b-loader__shield" />

        <div className="b-loader__wordmark">
          Barnabas <span>Insurance</span>
        </div>
        <span className="b-loader__tag">Brokers, IRA Kenya</span>

        {reduced ? (
          <span className="b-loader__pct b-loader__pct--plain">{progress} percent loaded</span>
        ) : (
          <>
            <div className="b-loader__bar" aria-hidden="true">
              <i style={{ width: `${progress}%` }} />
            </div>
            <span className="b-loader__pct" aria-hidden="true">
              {progress}%
            </span>
          </>
        )}
      </div>

      <button type="button" className="b-loader__skip is-visible" onClick={skip}>
        Skip
      </button>

      <div className="b-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
