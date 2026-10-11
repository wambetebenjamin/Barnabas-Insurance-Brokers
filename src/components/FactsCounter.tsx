"use client";

/**
 * Facts band, rebuilt on the design source’s own section.
 *
 * Kept from the archive: `.container.facts`, the full-bleed padding recipe
 * (calc(((100% - 1320px) / 2) + .75rem) at the 1400px breakpoint), the blue
 * overlay on the left half and the white overlay on the right, and
 * The `.display-5` figure markup from the source, as a div rather than an h1.
 *
 * The counting itself replaces jQuery Counter-Up:
 * counterUp({ delay: 10, time: 2000 }) becomes a 2000ms requestAnimationFrame
 * ramp that starts when the band scrolls into view, with the same final values.
 */
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { formatNumber } from "@/lib/format";

const TIME_MS = 2000; // matches counterUp({ time: 2000 })

const FIGURES = [
  { value: SITE.yearsExperience, suffix: "", label: "Years protecting Kenyan clients" },
  { value: SITE.clientsProtected, suffix: "+", label: "Clients protected" },
  { value: SITE.insurersCompared, suffix: "", label: "Insurers compared for you" },
  { value: 120, prefix: "KES ", suffix: "M+", label: "In claims we have helped settle" },
];

function useCountUp(target: number, active: boolean, duration = TIME_MS) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [active, duration, target]);

  return value;
}

function Figure({
  value,
  prefix = "",
  suffix = "",
  label,
  active,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  active: boolean;
}) {
  const current = useCountUp(value, active);
  return (
    <div className="col-6 col-lg-3 text-center text-lg-start">
      {/*
        The design source marks these figures up as <h1 class="display-5">. That
        would put four extra h1 elements on every page that shows the facts band,
        which breaks the document outline for screen readers and search engines.
        The element is a div instead, and .b-fact__value in globals.css restates
        the two properties those h1s were contributing (Poppins, and the 300 weight
        that .display-5 sets), so the rendering is unchanged.
      */}
      <div className="b-fact__value display-5 text-dark mb-1">
        {prefix}
        {formatNumber(current)}
        {suffix}
      </div>
      <p className="mb-0 b-fs-body-sm">{label}</p>
    </div>
  );
}

export function FactsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="container-fluid facts p-0" ref={ref}>
      <div className="container-fluid facts p-0">
        <div className="row g-0">
          <div className="col-lg-5 facts-text">
            <div className="h-100 p-5">
              <h2 className="text-white mb-4">For Individuals And Organisations</h2>
              <p className="text-white mb-0" style={{ opacity: 0.92 }}>
                We are an independent brokerage. We do not work for one insurer, so our advice is not
                shaped by which company pays us most. We compare terms across the market, place the
                cover that fits, and handle the claim when it comes.
              </p>
            </div>
          </div>
          <div className="col-lg-7 facts-counter">
            <div className="h-100 p-5">
              <div className="row g-4">
                {FIGURES.map((figure) => (
                  <Figure
                    key={figure.label}
                    value={figure.value}
                    prefix={figure.prefix}
                    suffix={figure.suffix}
                    label={figure.label}
                    active={active}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
