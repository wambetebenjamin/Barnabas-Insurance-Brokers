/**
 * Image slots.
 *
 * The brief specifies Pexels as the image source and this file is the manifest
 * that ties every slot in the UI to one of the ten required search queries.
 *
 *   - `npm run fetch-pexels` downloads the chosen photo for each slot into
 *     /public/images/<key>.jpg and writes src/data/images.generated.json plus
 *     image-credits.md.
 *   - Until that has been run (this sandbox cannot reach api.pexels.com, see
 *     INVENTORY.md section 12) each slot falls back to a photograph that shipped
 *     inside the design source, so the layout is never broken and nothing needs
 *     to change in the code when the real photos arrive.
 *
 * Subjects must be East African. No AI images. No watermarks.
 */
import generated from "@/data/images.generated.json";

export type ImageSlotKey =
  | "heroFamily"
  | "eastAfricanCoupleHealth"
  | "kenyanProfessionalAgent"
  | "africanBusinessmanBroker"
  | "eastAfricanCarOwner"
  | "africanHomeowner"
  | "kenyanFamilyMedical"
  | "eastAfricanOfficeMeeting"
  | "africanWomanSigning"
  | "nairobiBusinessOffice";

interface SlotDefinition {
  /** The exact Pexels search query required by the brief. */
  query: string;
  /** Template photograph used until the Pexels fetch has run. */
  fallback: string;
  alt: string;
  orientation: "landscape" | "portrait";
}

export const IMAGE_SLOTS: Record<ImageSlotKey, SlotDefinition> = {
  heroFamily: {
    query: "African family insurance protection Kenya",
    fallback: "/img/carousel-1.jpg",
    alt: "An East African family standing together outside their home in Kenya",
    orientation: "landscape",
  },
  eastAfricanCoupleHealth: {
    query: "East African couple health insurance",
    fallback: "/img/carousel-2.jpg",
    alt: "An East African couple reviewing their health insurance cover together",
    orientation: "landscape",
  },
  kenyanProfessionalAgent: {
    query: "Kenyan professional insurance agent",
    fallback: "/img/about.jpg",
    alt: "A Kenyan insurance professional advising a client in a Nairobi office",
    orientation: "landscape",
  },
  africanBusinessmanBroker: {
    query: "African businessman insurance broker",
    fallback: "/img/feature.jpg",
    alt: "An African insurance broker reviewing policy documents with a client",
    orientation: "landscape",
  },
  eastAfricanCarOwner: {
    query: "East African car owner vehicle Kenya",
    fallback: "/img/carousel-2.jpg",
    alt: "An East African car owner standing beside their insured vehicle in Kenya",
    orientation: "landscape",
  },
  africanHomeowner: {
    query: "African homeowner house property",
    fallback: "/img/about.jpg",
    alt: "An African homeowner in front of their insured family house",
    orientation: "landscape",
  },
  kenyanFamilyMedical: {
    query: "Kenyan family medical healthcare",
    fallback: "/img/carousel-1.jpg",
    alt: "A Kenyan family at a medical facility with health insurance cover",
    orientation: "landscape",
  },
  eastAfricanOfficeMeeting: {
    query: "East African office meeting insurance",
    fallback: "/img/feature.jpg",
    alt: "An East African business team in a meeting about staff insurance benefits",
    orientation: "landscape",
  },
  africanWomanSigning: {
    query: "African woman signing insurance document",
    fallback: "/img/testimonial-2.jpg",
    alt: "An African woman signing an insurance policy document at a desk",
    orientation: "landscape",
  },
  nairobiBusinessOffice: {
    query: "Nairobi business office professional",
    fallback: "/img/testimonial-3.jpg",
    alt: "Professionals at work in a Nairobi business office",
    orientation: "landscape",
  },
};

const fetched = generated as Record<string, string | null | undefined>;

/** True once `npm run fetch-pexels` has supplied a real photo for the slot. */
export const hasFetchedImage = (slot: ImageSlotKey): boolean =>
  Boolean(fetched[slot] && String(fetched[slot]).startsWith("/images/"));

/**
 * The source for a slot. Prefers the downloaded Pexels photograph and falls back
 * to the design source’s own image, so the UI never renders a broken picture.
 */
export const imageSrc = (slot: ImageSlotKey): string =>
  hasFetchedImage(slot) ? (fetched[slot] as string) : IMAGE_SLOTS[slot].fallback;

export const imageAlt = (slot: ImageSlotKey): string => IMAGE_SLOTS[slot].alt;

export const imageQuery = (slot: ImageSlotKey): string => IMAGE_SLOTS[slot].query;

/** Slots still awaiting a Pexels photo, for the credit file and the fetch script. */
export const pendingSlots = (): ImageSlotKey[] =>
  (Object.keys(IMAGE_SLOTS) as ImageSlotKey[]).filter((slot) => !hasFetchedImage(slot));
