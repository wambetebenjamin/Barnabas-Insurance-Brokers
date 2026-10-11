/**
 * Product card (brief section 4).
 *
 * 3-column grid, 2-column at 1024px, 1-column at 390px and below. Each card
 * carries a photograph, the product name, the key benefit line, who it is for and
 * a Get a Quote call to action. Hover and focus raise the card, lift the shadow and
 * accent the border over 250ms with the same easing family as the design source’s
 * own .service-item / .team-item transitions.
 *
 * The circular icon is one of the archive’s own icons (img/icon/icon-0N-primary.png),
 * so the visual language of the template is kept alongside the new photography.
 */
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { imageAlt, imageSrc, type ImageSlotKey } from "@/data/images";
import { formatKes } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const slot = product.imageSlot as ImageSlotKey;

  return (
    <article className="b-card">
      <div className="b-card__media">
        <Image
          src={imageSrc(slot)}
          alt={imageAlt(slot)}
          fill
          sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <span className="b-card__tag">
          From {formatKes(product.fromKes, { compact: true })} {product.fromUnit}
        </span>
        <span className="b-card__icon" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.icon} alt="" width={28} height={28} loading="lazy" />
        </span>
      </div>

      <div className="b-card__body">
        <h3>{product.name}</h3>
        <p className="b-card__benefit">{product.benefit}</p>
        <p className="b-card__who">
          <strong>Who it is for:</strong> {product.whoFor}
        </p>
        <div className="b-card__foot">
          <Link href={`/quote?product=${product.slug}`} className="btn btn-primary">
            Get a Quote
          </Link>
          <Link href={`/products/${product.slug}`} className="b-card__link">
            Full details
            <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
