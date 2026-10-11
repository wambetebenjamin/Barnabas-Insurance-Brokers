"use client";

/**
 * Floating WhatsApp button (brief, WHATSAPP INTEGRATION).
 *
 * Fixed bottom right, 56x56 (--b-fab-size), tooltip "Get a free insurance quote",
 * and the exact link the brief specifies:
 *   https://wa.me/254112272061?text=Hello!%20I%20would%20like%20a%20free%20insurance%20quote%20from%20Barnabas%20Insurance%20Brokers.
 *
 * Colours come from the design source: the archive ships no WhatsApp brand colour,
 * so the button uses --primary and the hover state flips to --secondary, which is
 * exactly what the source’s own .btn.btn-primary:hover rule does.
 */
import { whatsappLink } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      className="b-fab b-wa"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Barnabas Insurance Brokers on WhatsApp. Get a free insurance quote."
      data-testid="wa-float"
    >
      <i className="fab fa-whatsapp" style={{ fontSize: 26 }} aria-hidden="true" />
      <span className="b-wa__tip" role="tooltip">
        Get a free insurance quote
      </span>
    </a>
  );
}
