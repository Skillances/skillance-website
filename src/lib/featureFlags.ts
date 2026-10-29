/**
 * Public marketing flags and live feature flags.
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
 * public provider profiles and search cards. On. It also needs
 * `POLICE_CLEARANCE_ENABLED`.
 *
 * Police clearance upload (`POLICE_CLEARANCE_ENABLED`): the freelancer upload
 * page and its dashboard link. On. A backend 403 with code `FEATURE_PAUSED` is
 * still treated as paused. Set to `false` to pause uploads in the client; the
 * page then does not call the police-clearance API.
 *
 * ID consent events (`CONSENT_API_ENABLED`): on. `POST /users/me/consents`
 * and `GET /users/me/consents` are live. The ID page records the tick and the
 * account page can withdraw it.
 *
 * Waitlist consent fields (`WAITLIST_CONSENT_API_ENABLED`): on. `POST
 * /public/notify` stores the notice version, area and consent fields.
 */
export const SHOW_PUBLIC_STATS = false;

export const SHOW_PUBLIC_WEBSITE_REVIEWS = false;

export const SHOW_PUBLIC_POLICE_CLEARANCE_BADGE = true;

export const POLICE_CLEARANCE_ENABLED = true;

export const CONSENT_API_ENABLED = true;

export const WAITLIST_CONSENT_API_ENABLED = true;
