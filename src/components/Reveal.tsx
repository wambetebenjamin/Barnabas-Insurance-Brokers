"use client";

/**
 * Scroll reveal.
 *
 * The design source used WOW.js (`new WOW().init()` in js/main.js) with
 * lib/animate/animate.min.css doing the animating. jQuery and WOW are not in the
 * locked stack, so the same result is produced with an IntersectionObserver that
 * adds the archive’s own classes: `wow`, `animated`, and the animation name and
 * delay the source would have written into data-wow-* attributes.
 *
 * animate.css is still the file that animates, so the motion is identical.
 */
import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** animate.css animation name, e.g. "fadeInUp" (source used fadeIn, slideInDown). */
  animation?: string;
  /** Seconds, matching the source’s data-wow-delay values. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "aside";
  style?: React.CSSProperties;
}

export function Reveal({
  children,
  animation = "fadeInUp",
  delay = 0,
  className = "",
  as: Tag = "div",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      node.style.opacity = "1";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add("animated", animation);
            node.style.opacity = "1";
            observer.unobserve(node);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animation]);

  return (
    <Tag
      ref={ref as never}
      className={`b-reveal ${className}`}
      style={{ animationDelay: delay ? `${delay}s` : undefined, ...style }}
    >
      {children}
    </Tag>
  );
}

/** Staggered wrapper: reveals each child in turn (brief: "stagger reveal on scroll"). */
export function RevealStagger({
  children,
  className = "",
  step = 0.12,
}: {
  children: ReactNode[];
  className?: string;
  step?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <Reveal key={index} animation="fadeInUp" delay={index * step} style={{ height: "100%" }}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
