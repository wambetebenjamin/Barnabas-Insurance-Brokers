/**
 * Testimonials (brief section 12).
 *
 * Client first name, cover type, and a short review from East African clients, with
 * a staggered reveal on scroll.
 *
 * The design source ran these through Owl Carousel with 100px round images and a
 * 45x45 navigation pair in --primary. A grid with a staggered reveal replaces the
 * carousel: it shows every review at once, which is better for both reading and
 * search, and removes a JavaScript dependency.
 */
import Image from "next/image";
import { Reveal } from "@/components/Reveal";

interface Testimonial {
  name: string;
  location: string;
  cover: string;
  quote: string;
  image: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Wanjiru M.",
    location: "Kiambu",
    cover: "Motor and home insurance",
    quote:
      "I had a knock on the Thika road and did not know what to do. Barnabas told me exactly which documents to collect, dealt with the assessor, and my car was repaired in three weeks without me chasing anybody.",
    image: "/img/testimonial-1.jpg",
  },
  {
    name: "Otieno K.",
    location: "Nairobi",
    cover: "Group medical scheme, 48 staff",
    quote:
      "We moved our staff medical scheme to Barnabas after a bad year with authorisations. Their team now handles pre authorisation for us and our staff actually get treated without the back and forth.",
    image: "/img/testimonial-2.jpg",
  },
  {
    name: "Amina H.",
    location: "Mombasa",
    cover: "Life insurance",
    quote:
      "They explained the sum assured properly instead of selling me the most expensive plan. I understood what my family would receive and why, and the premium is manageable.",
    image: "/img/testimonial-3.jpg",
  },
  {
    name: "Peter N.",
    location: "Nakuru",
    cover: "Business insurance",
    quote:
      "A fire in our store room could have finished us. The claim was settled and the business interruption cover kept wages running for two months. I will never run a business without it.",
    image: "/img/team-1.jpg",
  },
  {
    name: "Grace W.",
    location: "Kisumu",
    cover: "Travel insurance",
    quote:
      "My mother needed treatment while we were in the UK. The emergency line arranged everything and we did not pay a shilling at the hospital. That policy cost less than our airport parking.",
    image: "/img/team-2.jpg",
  },
  {
    name: "Daniel R.",
    location: "Eldoret",
    cover: "Motor fleet, 14 vehicles",
    quote:
      "One renewal date, one contact person, and someone who picks up the phone when a driver has an accident at night. That is what we were paying for all along.",
    image: "/img/team-3.jpg",
  },
];

export function Testimonials() {
  return (
    <div className="b-grid-3">
      {TESTIMONIALS.map((testimonial, index) => (
        <Reveal key={testimonial.name} animation="fadeInUp" delay={index * 0.1}>
          <figure className="b-quote">
            <div className="b-quote__stars" aria-hidden="true">
              ★★★★★
            </div>
            <span className="b-visually-hidden">Rated five out of five</span>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>
              <Image
                src={testimonial.image}
                alt=""
                width={46}
                height={46}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <span>
                <strong>{testimonial.name}</strong>
                <span>
                  {testimonial.cover}, {testimonial.location}
                </span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
