"use client";

/**
 * Back to top (design source: <a class="btn btn-lg btn-primary btn-lg-square back-to-top"><i class="bi bi-arrow-up"></i></a>).
 *
 * The source’s geometry and behaviour are preserved: 48x48, faded in past 300px
 * of scroll, and an animated 1500ms scroll with the easeInOutExpo curve. Its
 * position is lifted above the WhatsApp button so the two fixed controls never
 * overlap (see .back-to-top in globals.css).
 */
import { useEffect, useState } from "react";

/** Source: animate({scrollTop: 0}, 1500, 'easeInOutExpo') */
const easeInOutExpo = (t: number): number =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const start = window.scrollY;
    if (start === 0) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const duration = 1500;
    const started = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      window.scrollTo(0, start * (1 - easeInOutExpo(progress)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="btn btn-lg btn-primary btn-lg-square back-to-top"
      aria-label="Back to top"
      style={{ display: visible ? "flex" : "none" }}
    >
      <i className="bi bi-arrow-up" aria-hidden="true" />
    </button>
  );
}
