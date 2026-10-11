/**
 * Reference numbers.
 *
 * Every submission gets a reference the client can quote on WhatsApp or the
 * phone, and the broker can search for in KV:
 *
 *   BIB-Q-251011-7K2F   quotation request
 *   BIB-G-251011-9QX4   group scheme enquiry
 *   BIB-C-251011-3M8P   claim notification
 *   BIB-N-251011-5T1R   newsletter signup
 *   BIB-M-251011-6H4V   portal message
 *
 * The prefix identifies the queue, the date block makes them sortable by eye,
 * and the four character suffix avoids collisions between two leads in the same
 * second. Crockford-style alphabet: no I, L, O or U, so a reference cannot be
 * misread as a different character over the phone.
 */

export type ReferenceKind = "quote" | "group" | "claim" | "newsletter" | "message" | "policy";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const PREFIX: Record<ReferenceKind, string> = {
  quote: "Q",
  group: "G",
  claim: "C",
  newsletter: "N",
  message: "M",
  policy: "P",
};

const randomBlock = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
};

export const makeReference = (kind: ReferenceKind): string => {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  return `BIB-${PREFIX[kind]}-${stamp}-${randomBlock(4)}`;
};

/** Policy reference used by the client portal, e.g. BIB-P-251011-8WQ2. */
export const makePolicyReference = (): string => makeReference("policy");
