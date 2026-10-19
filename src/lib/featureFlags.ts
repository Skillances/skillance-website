/**
 * Public marketing flags and paused freelancer tools. These default off.
 *
 * Homepage counters (`SHOW_PUBLIC_STATS`): set this to `true` when the live
 * `/public/stats` figures are sourced and approved to publish. There are no
 * hardcoded fallbacks. With the flag on, `Stats` reads `usersCount`,
 * `verifiedPercent`, `bookingsCount`, and `avgRating` from that response.
 *
 * Homepage website reviews (`SHOW_PUBLIC_WEBSITE_REVIEWS`): the anonymous
 * review form and the pre-launch testimonials. Leave off until reviews come
 * from completed bookings.
 *
 * Police-clearance badge (`SHOW_PUBLIC_POLICE_CLEARANCE_BADGE`): the badge on
 * public provider profiles and search cards. Leave off until that claim is
 * approved to publish.
 *
 * Police clearance upload (`POLICE_CLEARANCE_ENABLED`): the freelancer upload
 * page and its dashboard link. Set to `true` only when uploads are open again.
 * A backend 403 with code `FEATURE_PAUSED` is treated the same way. The public
 * badge stays hidden unless both this flag and `SHOW_PUBLIC_POLICE_CLEARANCE_BADGE`
 * are on.
 */
export const SHOW_PUBLIC_STATS = false;

export const SHOW_PUBLIC_WEBSITE_REVIEWS = false;

export const SHOW_PUBLIC_POLICE_CLEARANCE_BADGE = false;

export const POLICE_CLEARANCE_ENABLED = false;
