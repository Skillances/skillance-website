/**
 * Homepage reviews are locked (M6 / P0-08, decision D6 and D7 on this draft).
 *
 * The old "Write a Review" form posted anonymous name, role, rating, comment,
 * and location to POST /public/reviews. That form is removed. There is no
 * private "Send us feedback" replacement until Markus confirms D7, because a
 * public POST would need a CAPTCHA vendor key and must fail closed without one.
 *
 * Verified booking reviews, once published, belong on the provider profile.
 * They are not filled in here from website testimonials. The three pre-launch
 * anonymous reviews are not rendered.
 */
export default function Reviews() {
  return null;
}
