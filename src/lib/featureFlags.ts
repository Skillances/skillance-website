/**
 * Public marketing flags. Both default off.
 *
 * Homepage counters (`SHOW_PUBLIC_STATS`): set this to `true` when the live
 * `/public/stats` figures are sourced and approved to publish. There are no
 * hardcoded fallbacks. With the flag on, `Stats` reads `usersCount`,
 * `verifiedPercent`, `bookingsCount`, and `avgRating` from that response.
 *
 * Homepage website reviews (`SHOW_PUBLIC_WEBSITE_REVIEWS`): the anonymous
 * review form and the pre-launch testimonials. Leave off until reviews come
 * from completed bookings.
 */
export const SHOW_PUBLIC_STATS = false;

export const SHOW_PUBLIC_WEBSITE_REVIEWS = false;
