/**
 * Formatting helpers. Kenyan conventions throughout: KES, shillings, +254.
 */

export const formatKes = (value: number, options: { compact?: boolean } = {}): string => {
  if (!Number.isFinite(value)) return "KES 0";
  if (options.compact && value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `KES ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (options.compact && value >= 1_000) {
    const thousands = value / 1_000;
    return `KES ${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  return `KES ${value.toLocaleString("en-KE")}`;
};

export const formatNumber = (value: number): string => value.toLocaleString("en-KE");

export const formatDate = (input: string | Date): string => {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatDateTime = (input: string | Date): string => {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDate(date)} at ${date.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

/** Whole days between now and a date, negative when the date has passed. */
export const daysUntil = (input: string | Date): number => {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return 0;
  const day = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / day);
};

/** Kenyan phone number normaliser: 0712345678 / +254712345678 -> 254712345678 */
export const normaliseKenyanPhone = (input: string): string => {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
};

export const isValidKenyanPhone = (input: string): boolean => {
  const normalised = normaliseKenyanPhone(input);
  return /^254(7|1)\d{8}$/.test(normalised);
};

/** Kenyan national ID: 7 or 8 digits, or a passport number. */
export const isValidKenyanId = (input: string): boolean =>
  /^\d{7,8}$/.test(input.trim()) || /^[A-Z]{1,2}\d{6,8}$/i.test(input.trim());

export const maskPhone = (input: string): string => {
  const normalised = normaliseKenyanPhone(input);
  if (normalised.length < 9) return input;
  return `+${normalised.slice(0, 6)} *** ${normalised.slice(-3)}`;
};

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const titleCase = (input: string): string =>
  input.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
