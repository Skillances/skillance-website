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
 * are on. The pause is entirely client-side: while this is false the page does
 * not call the police-clearance API.
 *
 * ID consent events (`CONSENT_API_ENABLED`): set to `true` only when
 * `POST /users/me/consents` is on the live API. While false, the ID page still
 * requires the unticked checkbox, but the tick stays in the browser and the
 * upload body is unchanged.
 *
 * Waitlist consent fields (`WAITLIST_CONSENT_API_ENABLED`): set to `true` only
 * when `POST /public/notify` stores the notice version and consent booleans.
 * While false, the form still collects them and the request sends only `email`
 * and `source`, which is what the live route validates.
 */
export const SHOW_PUBLIC_STATS = false;

export const SHOW_PUBLIC_WEBSITE_REVIEWS = false;

export const SHOW_PUBLIC_POLICE_CLEARANCE_BADGE = false;

export const POLICE_CLEARANCE_ENABLED = false;

export const CONSENT_API_ENABLED = false;

export const WAITLIST_CONSENT_API_ENABLED = false;
