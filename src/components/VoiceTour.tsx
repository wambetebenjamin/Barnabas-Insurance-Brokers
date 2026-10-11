"use client";

/**
 * Voice tour (brief, VOICE TOUR).
 *
 * Bottom-left floating circle, 56x56 pixels (.b-voice / --b-fab-size). It triggers
 * on the first user scroll or on click, and the script is word for word the one
 * in the brief.
 *
 * Playback order:
 *   1. /audio/voice-tour.mp3 if it is present (a recorded broker voice, so the
 *      tour sounds the same on every device and browser).
 *   2. The Web Speech API with the design source’s Poppins-adjacent Latin voice
 *      list, if no recording is available or playback fails.
 *   3. If neither works, the button opens WhatsApp with the same message rather
 *      than doing nothing.
 *
 * Autoplay rules are respected: the tour only starts by itself after the visitor
 * has interacted with the page (the first scroll or tap counts as that gesture),
 * and never more than once per session.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/site";

/** Verbatim from the brief. Do not edit without updating the brief. */
export const VOICE_TOUR_SCRIPT = `Welcome to Barnabas Insurance Brokers.
We help individuals, families, and businesses in Kenya
find the right insurance cover at the best price.
Motor, health, life, property, and business insurance.
Get a free quote today, compare plans,
or speak to one of our licensed brokers directly.
Your protection is our responsibility.`;

const AUDIO_SRC = "/audio/voice-tour.mp3";
const SESSION_KEY = "bib.voice.played";

type Status = "idle" | "speaking" | "unavailable";

export function VoiceTour() {
  const [status, setStatus] = useState<Status>("idle");
  const [hint, setHint] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => setMounted(true), []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
  }, []);

  const speak = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1. Recorded audio first.
    const audio = audioRef.current ?? new Audio(AUDIO_SRC);
    audioRef.current = audio;
    audio.preload = "auto";

    const fallbackToSpeech = () => {
      const speechAvailable =
        typeof window !== "undefined" &&
        typeof window.speechSynthesis !== "undefined" &&
        typeof SpeechSynthesisUtterance !== "undefined";

      if (!speechAvailable) {
        setStatus("unavailable");
        setHint(true);
        window.setTimeout(() => setHint(false), 4000);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(VOICE_TOUR_SCRIPT);
      utterance.lang = "en-KE";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => setStatus("idle");
      utterance.onerror = () => setStatus("idle");
      utteranceRef.current = utterance;
      setStatus("speaking");
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    audio.onended = () => setStatus("idle");
    audio.onerror = fallbackToSpeech;

    setStatus("speaking");
    audio
      .play()
      .then(() => {
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }
      })
      .catch(fallbackToSpeech);
  }, []);

  const toggle = useCallback(() => {
    if (status === "speaking") {
      stop();
      return;
    }
    // A user asked for it, so play; also open WhatsApp if nothing is playable.
    speak();
    window.setTimeout(() => {
      if (status === "unavailable") window.open(whatsappLink(), "_blank", "noopener");
    }, 50);
  }, [speak, status, stop]);

  /* Trigger on the first user scroll, once per session. */
  useEffect(() => {
    if (!mounted) return;

    let played = false;
    try {
      played = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      played = false;
    }
    if (played) return;

    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      window.setTimeout(() => {
        speak();
      }, 700);
    };

    const onScroll = () => {
      if (window.scrollY > 120) {
        arm();
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted, speak]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      className={`b-fab b-voice ${status === "speaking" ? "is-speaking" : ""}`}
      onClick={toggle}
      aria-pressed={status === "speaking"}
      aria-label={
        status === "speaking"
          ? "Stop the Barnabas Insurance Brokers audio tour"
          : "Listen to the Barnabas Insurance Brokers audio tour"
      }
      title="Audio tour"
    >
      <i
        className={status === "speaking" ? "bi bi-pause-fill" : "bi bi-volume-up-fill"}
        style={{ fontSize: 22 }}
        aria-hidden="true"
      />
      <span className="b-voice__label">
        {status === "speaking"
          ? "Stop the audio tour"
          : hint
            ? "Audio unavailable, tap to chat on WhatsApp"
            : "Listen to our audio tour"}
      </span>
    </button>
  );
}
