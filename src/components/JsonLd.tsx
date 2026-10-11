/**
 * Renders structured data. Server component only, so the payload is part of the
 * HTML the crawler receives and never part of a client bundle.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own typed data, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
