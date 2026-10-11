/**
 * reCAPTCHA in the browser.
 *
 * v3 runs invisibly: a token is minted per submission for a named action. When
 * the server answers that the score was below the threshold, the form asks for
 * the v2 checkbox instead (brief: "v2 fallback under 0.5"), and the v2 response
 * token is sent in the same payload with version "v2".
 *
 * Both keys are public by design. The secrets live only on the server.
 */
"use client";

export const RECAPTCHA_V3_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
export const RECAPTCHA_V2_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? "";

export const v3Enabled = (): boolean => RECAPTCHA_V3_SITE_KEY.length > 0;
export const v2Enabled = (): boolean => RECAPTCHA_V2_SITE_KEY.length > 0;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void },
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
  }
}

const V3_SCRIPT = "https://www.google.com/recaptcha/api.js?render=";

let scriptPromise: Promise<void> | null = null;

/** Loads the official script once, and resolves when grecaptcha is usable. */
export function loadRecaptcha(version: "v3" | "v2" = "v3"): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  const key = version === "v3" ? RECAPTCHA_V3_SITE_KEY : RECAPTCHA_V2_SITE_KEY;
  if (!key) return Promise.resolve();

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("recaptcha-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("recaptcha script failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = version === "v3" ? `${V3_SCRIPT}${key}` : "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("recaptcha script failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * A v3 token for the given action, or null when v3 is not configured (which
 * happens in local development until the keys are set). The server records
 * "not configured" on the lead rather than treating null as a pass.
 */
export async function getV3Token(action: string): Promise<string | null> {
  if (!v3Enabled()) return null;
  try {
    await loadRecaptcha("v3");
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return null;
    return await new Promise<string>((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(RECAPTCHA_V3_SITE_KEY, { action })
          .then(resolve)
          .catch(() => resolve(""));
      });
    });
  } catch {
    return null;
  }
}

/** Renders the v2 checkbox into a container and returns the widget id. */
export function renderV2Checkbox(
  container: HTMLElement,
  onToken: (token: string) => void,
  onExpired: () => void,
): Promise<number | null> {
  if (!v2Enabled()) return Promise.resolve(null);
  return loadRecaptcha("v2").then(
    () =>
      new Promise<number | null>((resolve) => {
        const grecaptcha = window.grecaptcha;
        if (!grecaptcha) return resolve(null);
        grecaptcha.ready(() => {
          const id = grecaptcha.render(container, {
            sitekey: RECAPTCHA_V2_SITE_KEY,
            callback: onToken,
            "expired-callback": onExpired,
          });
          resolve(id);
        });
      }),
  );
}

export function resetV2Checkbox(widgetId: number | null): void {
  if (widgetId === null || typeof window === "undefined" || !window.grecaptcha) return;
  try {
    window.grecaptcha.reset(widgetId);
  } catch {
    /* the widget was already removed from the page */
  }
}
