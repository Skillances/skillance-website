# Website Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make skillance.co.za run the same customer and freelancer product as the Flutter app, on top of the existing Skillance API, without breaking the marketing site or the admin console.

**Architecture:** The Fastify API in `skillance-backend` is the source of behavior. The Flutter app in `skillance-app` is the source of screens and copy. This website only adds a logged-in marketplace shell that calls those endpoints. Marketing pages stay on `/`. Admin stays on `/admin/*`. Marketplace routes live beside them and use the existing `AuthProvider`, `get`/`post`/`put` client, React Query, and Ably.

**Tech Stack:** React 19, Vite, TypeScript, React Router 7, TanStack Query, Tailwind, existing shadcn-style components in `src/components/ui`, Zod, Ably (`ably` package already installed), ExcelJS and Recharts already installed.

## Global Constraints

- Work only in `skillance-website` unless a task says otherwise. Do not edit `skillance-backend` or `skillance-app`.
- Do not add database tables, Prisma migrations, or new API routes. If a screen in the app has no backend, do not invent one. Those screens are listed under "Do not build".
- Do not change `/admin/*` behavior, admin queries, or the admin login rejection of non-admins once admin login is moved. Admins must still reach `/admin/dashboard`.
- Do not add emojis to code, comments, or UI copy.
- Do not add a test runner. This repo verifies with `npm run build` (`tsc -b && vite build`) and `npm run lint`.
- Do not commit unless the human asked for commits in that session.
- Do not add dependencies except `firebase` in Task 7, and only if the web Firebase env vars exist.
- Keep API paths in `src/lib/apiEndpoints.ts`. Call them through `@/lib/api`. Responses use `{ success, data, message }` unless a task shows otherwise.
- Currency is ZAR. Dates and times are the strings the API already uses (`scheduledDate` as `YYYY-MM-DD`, `scheduledTime` as `HH:mm`).
- File uploads that the app sends as base64 stay base64 JSON. Do not switch them to multipart.
- `termsAccepted` on registration must be the JSON boolean `true`. A missing or false value is rejected by the API.
- After each task, run `npm run build` and `npm run lint` from `skillance-website` and fix every error before starting the next task.
- Read the Flutter screen named in the task before writing the page. Match fields and actions. Do not add features the app does not have.

---

## Do not build

These Flutter screens are local or mock. Shipping them on the web would pretend data is saved.

| App screen | Why |
| --- | --- |
| `lib/providers/payment_method_provider.dart` | Comment: "Mock payment methods storage (UI only - no backend)". Real payment in this product is the booking connection fee. |
| `lib/providers/payout_provider.dart` | Comment: "Mock payout details storage (UI only - no backend)". |
| `lib/providers/expense_provider.dart` and `expense_tracking_screen.dart` | In-memory list. No API. |
| `lib/providers/client_provider.dart` | Comment: "Mock clients storage (UI only - no backend)". |
| `lib/screens/profile/notification_center_screen.dart` | Static category descriptions. Comment says server integration is future. |
| Splash, onboarding stories, in-app tutorials | App chrome, not the marketplace. |
| Sign in with Apple | iOS only in the app (`PlatformUtils.showAppleAccountFeatures`). No web Firebase Apple setup. |
| Push-notification permission and `PUT /users/:userId/push-token` | Phone push. Email notification toggle stays; it is a real settings field. |
| Apple Calendar / EventKit | Device only. Web may offer `GET /calendar-sync/export` as a file download in Task 26. |

---

## What already exists (do not rebuild)

- Marketing: `/`, `/services`, `/category/:id` (category copy only, not freelancer results), `/contact`, `/faq`, `/help-center`, `/trust-safety`, `/privacy-policy`, `/terms`, `/refund-policy`, `/cookie-policy`.
- Admin console under `/admin/*`, including bookings, chat logs, verifications, finance, and role applications.
- `src/context/AuthContext.tsx` already calls `POST /auth/login` and `GET /users/me`.
- `src/pages/LoginPage.tsx` currently shows "Admin" and, after a successful login, sets the error `Admin access required` unless `isAdmin` or `primaryRole === 'admin'`. Task 2 removes that block for marketplace users and keeps sending staff to `/admin/dashboard`.
- `src/lib/api.ts` has `get`, `post`, `put`, `del`. It does not have `patch`. Task 1 adds it.
- Public bug report: `POST /public/bug-report` (`ApiPaths.public.bugReport`).

---

## Route map

Marketing and admin URLs stay. Add these.

| Path | Who | Purpose |
| --- | --- | --- |
| `/login` | Public | Email and password for customers, freelancers, and admins. Admins go to `/admin/dashboard`. Everyone else goes to `landingPath(user)`. |
| `/register` | Public | Customer or freelancer registration. Query `?role=customer` or `?role=freelancer`. |
| `/forgot-password` | Public | `POST /auth/forgot-password`. |
| `/home` | Customer, guest | Search, categories, recommended results. Guests can browse. Booking requires login. |
| `/search` | Public | `POST /freelancers/search`. |
| `/browse/category/:categoryId` | Public | Search filtered by that category id. |
| `/freelancers/:freelancerId` | Public | Profile, reviews, portfolio, products. |
| `/freelancers/:freelancerId/book` | Customer | Create booking. |
| `/bookings` | Signed in | `GET /bookings/my` for customers, `GET /freelancers/:freelancerId/bookings` for the freelancer view. |
| `/bookings/:bookingId` | Participant | Detail, cancel, PIN, connection fee, review, dispute, invoice. |
| `/chats` | Signed in | `GET /chats`. |
| `/chats/:chatId` | Participant | Messages. Realtime channel `private-chat:${chatId}`. |
| `/favorites` | Customer | `GET /favorites`. |
| `/documents` | Customer | `GET /products/purchased`. |
| `/documents/:productId` | Purchaser | `GET /products/:productId/view`. |
| `/recurring` | Signed in | Requests and series. |
| `/account` | Signed in | Profile menu. |
| `/account/edit` | Signed in | `PUT /users/:userId`. |
| `/account/settings` | Signed in | `GET/PUT /users/:userId/settings`, export, delete. |
| `/account/apply-freelancer` | Customer | `POST /freelancers/apply` or `POST /users/me/role-applications`. |
| `/work` | Freelancer | Dashboard stats. |
| `/work/jobs` | Freelancer | Accept, decline, PIN. |
| `/work/earnings` | Freelancer | Dashboard earnings trend plus own bookings. |
| `/work/invoices` | Freelancer | Create and send invoices. |
| `/work/profile` | Freelancer | Edit freelancer profile and categories. |
| `/work/locations` | Freelancer | Service locations. |
| `/work/availability` | Freelancer | Weekly availability. |
| `/work/portfolio` | Freelancer | Previous work. |
| `/work/certifications` | Freelancer | Certification files. |
| `/work/verification` | Freelancer | ID verification status and upload. |
| `/work/police-clearance` | Freelancer | Optional police clearance. |
| `/work/products` | Freelancer | Digital products the freelancer sells. |

`landingPath(user)`:

- `isAdmin` or `primaryRole === 'admin'` → `/admin/dashboard`
- `preferredView === 'freelancer'` or (`primaryRole === 'freelancer'` and `preferredView` is absent) → `/work`
- otherwise → `/home`

---

## File map

Create:

- `src/lib/marketplace/session.ts` — `MarketplaceUser`, `landingPath`, `isStaff`
- `src/components/marketplace/MarketplaceLayout.tsx` — app chrome, no marketing nav or footer
- `src/components/marketplace/RequireAuth.tsx` — redirect to `/login` with `state.from`
- `src/pages/marketplace/**` — one page file per route above
- `src/lib/marketplace/bookingStatus.ts` — status labels and which actions are legal

Modify:

- `src/lib/api.ts` — export `patch`
- `src/lib/apiEndpoints.ts` — add the paths in Task 1
- `src/context/AuthContext.tsx` — store `preferredView`, `customerId`, `freelancerId`
- `src/pages/LoginPage.tsx` — marketplace login, not admin-only
- `src/App.tsx` — register routes; hide marketing chrome on marketplace paths the same way `isAdminRoute` does
- `src/components/layout/Navigation.tsx` — Sign in, and Account when a non-admin session exists

---

## Shared types (every later task uses these names)

```ts
// src/lib/marketplace/session.ts
export type MarketplaceRole = 'customer' | 'freelancer' | 'admin';

export type MarketplaceUser = {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  primaryRole?: string;
  preferredView?: 'customer' | 'freelancer';
  customerId?: string | null;
  freelancerId?: string | null;
};

export function isStaff(user: MarketplaceUser | null): boolean {
  if (!user) return false;
  return user.isAdmin === true || String(user.primaryRole).toLowerCase() === 'admin';
}

export function landingPath(user: MarketplaceUser): string {
  if (isStaff(user)) return '/admin/dashboard';
  const view = user.preferredView ?? user.primaryRole;
  if (String(view).toLowerCase() === 'freelancer') return '/work';
  return '/home';
}
```

`GET /users/me` returns `response.data.user`. Read that object in the browser network panel once and map `customerId` and `freelancerId` from whatever keys the payload actually has (`customerId`, `freelancerId`, or nested `customer.id` / `freelancer.id`). Do not guess a second shape after you have seen one response. Persist the same object in `localStorage` key `user`.

---

### Task 1: API paths and `patch`

**Files:**
- Modify: `src/lib/api.ts`
- Modify: `src/lib/apiEndpoints.ts`

**Interfaces:**
- Consumes: existing `apiRequest`, `post`, `get`, `put`, `del`
- Produces: `patch(endpoint: string, data: unknown): Promise<any>` and `ApiPaths.marketplace` below

- [ ] **Step 1: Add `patch` next to `put` in `src/lib/api.ts`**

```ts
export async function patch(endpoint: string, data: unknown) {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}
```

Export `patch` from the default object as well.

- [ ] **Step 2: Add marketplace paths to `ApiPaths`**

Add a `marketplace` object. Do not remove or rename existing `auth`, `users`, `admin`, or `public` keys.

```ts
marketplace: {
  registerCustomer: '/auth/register/customer',
  registerFreelancer: '/auth/register/freelancer',
  forgotPassword: '/auth/forgot-password',
  google: '/auth/google',
  preferredView: '/users/me/preferred-view',
  roleApplications: '/users/me/role-applications',
  syncCustomerProfile: '/users/me/sync-customer-profile',
  deleteAccount: '/users/me/delete-account',
  exportAccount: '/users/me/export',
  user: (userId: string) => `/users/${userId}`,
  userSettings: (userId: string) => `/users/${userId}/settings`,
  acknowledgePolicyWarning: (warningId: string) =>
    `/users/me/policy-warnings/${warningId}/acknowledge`,

  freelancers: '/freelancers',
  searchFreelancers: '/freelancers/search',
  applyFreelancer: '/freelancers/apply',
  freelancerApplicationStatus: '/freelancers/application-status',
  myProfileCompletion: '/freelancers/profile-completion/me',
  freelancer: (id: string) => `/freelancers/${id}`,
  freelancerByUser: (userId: string) => `/freelancers/user/${userId}`,
  freelancerIdVerification: (userId: string) =>
    `/freelancers/user/${userId}/id-verification`,
  freelancerCertificationsHub: (userId: string) =>
    `/freelancers/user/${userId}/certifications-hub`,
  freelancerPoliceClearance: (userId: string) =>
    `/freelancers/user/${userId}/police-clearance`,
  freelancerAvailabilityContext: (userId: string) =>
    `/freelancers/user/${userId}/availability-context`,
  freelancerProfileCompletion: (id: string) => `/freelancers/${id}/profile-completion`,
  freelancerCategoryLimitRequests: (id: string) =>
    `/freelancers/${id}/category-limit-requests`,
  freelancerBookings: (id: string) => `/freelancers/${id}/bookings`,
  freelancerAvailability: (id: string) => `/freelancers/${id}/availability`,
  freelancerAvailabilityValidate: (id: string) =>
    `/freelancers/${id}/availability/validate`,
  freelancerPortfolio: (id: string) => `/freelancers/${id}/portfolio`,
  freelancerPortfolioProject: (id: string, projectId: string) =>
    `/freelancers/${id}/portfolio/${projectId}`,
  freelancerServiceLocations: (id: string) => `/freelancers/${id}/service-locations`,
  freelancerServiceLocation: (id: string, locationId: string) =>
    `/freelancers/${id}/service-locations/${locationId}`,
  freelancerPoliceClearanceUpload: (id: string) =>
    `/freelancers/${id}/police-clearance`,
  freelancerCertifications: (id: string) => `/freelancers/${id}/certifications`,
  freelancerCertification: (id: string, certificationId: string) =>
    `/freelancers/${id}/certifications/${certificationId}`,
  freelancerDashboardStats: (id: string) => `/freelancers/${id}/dashboard/stats`,
  freelancerEarningsTrend: (id: string) =>
    `/freelancers/${id}/dashboard/earnings-trend`,
  freelancerDashboardPerformance: (id: string) =>
    `/freelancers/${id}/dashboard/performance`,
  freelancerDashboardActivity: (id: string) =>
    `/freelancers/${id}/dashboard/activity`,
  freelancerReviews: (id: string) => `/freelancers/${id}/reviews`,
  customerRating: (userId: string) => `/users/${userId}/customer-rating`,

  bookings: '/bookings',
  myBookings: '/bookings/my',
  booking: (id: string) => `/bookings/${id}`,
  bookingAccept: (id: string) => `/bookings/${id}/accept`,
  bookingDecline: (id: string) => `/bookings/${id}/decline`,
  bookingDismiss: (id: string) => `/bookings/${id}/dismiss`,
  bookingCancel: (id: string) => `/bookings/${id}/cancel`,
  bookingSessionStatus: (id: string) => `/bookings/${id}/session-status`,
  bookingLocation: (id: string) => `/bookings/${id}/location`,
  bookingConnectionFee: (id: string) => `/bookings/${id}/connection-fee`,
  bookingConnectionFeeConfirm: (id: string) =>
    `/bookings/${id}/connection-fee/confirm`,
  bookingPin: (id: string) => `/bookings/${id}/pin`,
  bookingVerifyPin: (id: string) => `/bookings/${id}/verify-pin`,
  bookingRateFreelancer: (id: string) => `/bookings/${id}/rate-freelancer`,
  bookingReviewText: (id: string) => `/bookings/${id}/review-text`,
  bookingRateCustomer: (id: string) => `/bookings/${id}/rate-customer`,
  bookingFeedbackStatus: (id: string) => `/bookings/${id}/feedback-status`,

  invoices: '/invoices',
  invoiceSend: (invoiceId: string) => `/invoices/${invoiceId}/send`,
  invoiceAccept: (invoiceId: string) => `/invoices/${invoiceId}/accept`,
  invoiceDecline: (invoiceId: string) => `/invoices/${invoiceId}/decline`,
  invoiceByBooking: (bookingId: string) => `/invoices/booking/${bookingId}`,

  disputes: '/disputes',
  disputeByBooking: (bookingId: string) => `/disputes/booking/${bookingId}`,

  favorites: '/favorites',
  favoriteStatus: (freelancerId: string) => `/favorites/${freelancerId}/status`,
  favoriteStatusBatch: '/favorites/status',
  favoriteRemove: (freelancerId: string) => `/favorites/${freelancerId}`,

  chats: '/chats',
  chatByBooking: (bookingId: string) => `/chats/booking/${bookingId}`,
  chatMessages: (chatId: string) => `/chats/${chatId}/messages`,
  chatRead: (chatId: string) => `/chats/${chatId}/read`,

  recurringRequests: '/recurring-bookings/requests',
  recurringRequestAccept: (id: string) => `/recurring-bookings/requests/${id}/accept`,
  recurringRequestReject: (id: string) => `/recurring-bookings/requests/${id}/reject`,
  recurringPending: '/recurring-bookings/requests/pending',
  recurringSeries: '/recurring-bookings/series',
  recurringSeriesById: (id: string) => `/recurring-bookings/series/${id}`,
  recurringSeriesPause: (id: string) => `/recurring-bookings/series/${id}/pause`,
  recurringSeriesResume: (id: string) => `/recurring-bookings/series/${id}/resume`,
  recurringSeriesCancel: (id: string) => `/recurring-bookings/series/${id}/cancel`,

  products: '/products',
  myProducts: '/products/mine',
  purchasedProducts: '/products/purchased',
  freelancerProducts: (freelancerId: string) => `/products/freelancer/${freelancerId}`,
  product: (productId: string) => `/products/${productId}`,
  productPurchase: (productId: string) => `/products/${productId}/purchase`,
  productView: (productId: string) => `/products/${productId}/view`,

  calendarSyncExport: '/calendar-sync/export',
  geocode: '/geocoding/geocode',
  reverseGeocode: '/geocoding/reverse',
  placeAutocomplete: '/geocoding/places/autocomplete',
},
```

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`
Expected: both exit 0.

---

### Task 2: Session routing so customers are not rejected

**Files:**
- Create: `src/lib/marketplace/session.ts` (the types in Shared types)
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/pages/LoginPage.tsx`

**Interfaces:**
- Consumes: `landingPath`, `isStaff`, `MarketplaceUser`
- Produces: `useAuth().user` includes `preferredView`, `customerId`, `freelancerId`. `login()` still returns `{ success: true, user }`.

- [ ] **Step 1: Extend the user stored by `AuthContext`**

In both the `GET /users/me` loader and the `login()` success branch, build `MarketplaceUser` with `isStaff` logic that already exists (`isAdmin === true` or `primaryRole === 'admin'`). Copy `preferredView`, `customerId`, and `freelancerId` from `userData` using the keys you observe. Keep `setIsAdmin(isStaff(normalizedUser))`.

- [ ] **Step 2: Change `LoginPage` post-login navigation**

Replace the block that sets `Admin access required` with:

```ts
navigate(landingPath(result.user), { replace: true });
```

Change the visible copy:

- Eyebrow: `Sign in` (remove the word Admin)
- Supporting line: `Sign in with your Skillance account.`
- Remove "Use your administrator credentials."

Keep email, password, remember-me, and the same `POST /auth/login` body `{ email, password, rememberMe }`.

Add links under the form:

- `Create an account` → `/register`
- `Forgot password` → `/forgot-password`

Staff still land on `/admin/dashboard` because `landingPath` says so.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`
Expected: both exit 0.

Manual: open `/login`. A bad password still shows the API error and stays on `/login`. Do not use a real customer password in the repo or in logs.

---

### Task 3: Marketplace shell and route guards

**Files:**
- Create: `src/components/marketplace/MarketplaceLayout.tsx`
- Create: `src/components/marketplace/RequireAuth.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Navigation.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `landingPath`
- Produces: `RequireAuth` renders children only when `isAuthenticated`. Otherwise `<Navigate to="/login" state={{ from: location }} replace />`.

- [ ] **Step 1: `RequireAuth`**

While `isLoading`, show the same centered spinner `ProtectedRoute` uses. Do not require admin.

- [ ] **Step 2: `MarketplaceLayout`**

A left or top nav, not the marketing `Navigation`:

- Customer links: Home `/home`, Search `/search`, Bookings `/bookings`, Chat `/chats`, Favorites `/favorites`, Documents `/documents`, Account `/account`
- Freelancer links: Dashboard `/work`, Jobs `/work/jobs`, Earnings `/work/earnings`, Chat `/chats`, Bookings `/bookings`, Account `/account`
- Show the set that matches `preferredView`, defaulting like `landingPath`.
- A control that calls `PUT /users/me/preferred-view` with `{ preferredView: 'customer' | 'freelancer' }` when the account has both roles. Refresh `GET /users/me` after it succeeds, then `navigate(landingPath(user))`.
- Logout calls the existing `logout()`.

- [ ] **Step 3: Hide marketing chrome**

In `App.tsx`, treat paths `/home`, `/search`, `/browse`, `/freelancers`, `/bookings`, `/chats`, `/favorites`, `/documents`, `/recurring`, `/account`, `/work`, `/register`, `/forgot-password` like admin for chrome purposes: no marketing `Navigation`, no `Footer`, no `PublicFaqBot`, no launch countdown. `/login` already hides them (`isLoginPage`).

Register routes inside `MarketplaceLayout`. Public marketplace pages (`/home`, `/search`, `/browse/category/:categoryId`, `/freelancers/:freelancerId`) are outside `RequireAuth`. Everything else in the route map is inside it.

Guest who hits a protected route returns to that path after login: `LoginPage` reads `location.state.from` and, if it is a string path starting with `/`, navigates there instead of `landingPath` when the user is not staff. Staff always go to `/admin/dashboard`.

- [ ] **Step 4: Marketing nav entry**

In `Navigation.tsx`, if `isAuthenticated && isAdmin`, keep the Admin link. If `isAuthenticated && !isAdmin`, show `Account` linking to `landingPath(user)`. If signed out, show `Sign in` linking to `/login`.

- [ ] **Step 5: Verify**

Run: `npm run build` and `npm run lint`
Expected: both exit 0. `/`, `/services`, and `/admin/dashboard` still render. `/bookings` while signed out redirects to `/login`.

---

### Task 4: Customer registration

**Files:**
- Create: `src/pages/marketplace/RegisterPage.tsx`
- Modify: `src/App.tsx` route `/register`

**Interfaces:**
- Consumes: `ApiPaths.marketplace.registerCustomer`, `storeTokens` via the same path `AuthContext.login` uses
- Produces: a signed-in customer on `201`

Read `skillance-backend/src/routes/auth.routes.ts` `registerCustomerSchema` before writing the form. The body is strict.

- [ ] **Step 1: Form fields**

`firstName`, `lastName`, `email`, `password`, `phoneNumber`, optional profile photo, checkbox for terms.

Password rules match the customer schema in that file (read `passwordSchema`). Show the API `errors[0].message` or `message` on failure.

`termsAccepted` is only included as `true` when the box is checked. Link the label to `/terms` and `/privacy-policy`.

Optional photo: read the file in the browser, send `profilePhoto` as a data-URL or raw base64 string in the same shape `skillance-app/lib/screens/auth/widgets/customer_register_form.dart` submits. Open that file and copy the key name it posts. Do not invent a different key.

- [ ] **Step 2: Submit**

`POST /auth/register/customer`. On `success`, `storeTokens(accessToken, refreshToken)`, write the user into the same `AuthContext` state login uses, `navigate('/home')`.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`
Expected: both exit 0.

---

### Task 5: Freelancer registration

**Files:**
- Modify: `src/pages/marketplace/RegisterPage.tsx` (second tab or `?role=freelancer`)

**Interfaces:**
- Consumes: `GET /categories` (already `ApiPaths.categories.list`), `ApiPaths.marketplace.registerFreelancer`
- Produces: a signed-in freelancer landing on `/work`

Read `registerFreelancerSchema` in `skillance-backend/src/routes/auth.routes.ts` lines 80–199. Required body:

```ts
{
  email: string;
  password: string; // min 8, one uppercase, one number, one special
  firstName: string;
  lastName: string;
  phoneNumber: string; // min 10
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  age: number; // integer 18–100
  categories: string[]; // min 1 category id
  categoryRates: { categoryId: string; hourlyRate: number }[]; // one per category, hourlyRate >= 1
  serviceRadius: number; // 1–2000 km
  termsAccepted: true;
  profilePhoto?: string;
  serviceLocationAddress?: string;
  serviceLocationCity?: string;
  serviceLocationLabel?: string;
  serviceLocationRadius?: number;
  serviceLocationLatitude?: number;
  serviceLocationLongitude?: number;
  termsVersion?: string;
  privacyVersion?: string;
}
```

Every id in `categories` must appear in `categoryRates`.

- [ ] **Step 1: Category picker**

Load `GET /categories`. Let the user pick one or more and enter an hourly rate in ZAR for each. Block submit until the arrays match.

- [ ] **Step 2: Location**

Optional. Use `POST /geocoding/places/autocomplete` and `POST /geocoding/geocode` for the address. Send lat/lng only when geocoding returns them.

- [ ] **Step 3: Submit and land on `/work`**

Same token handling as Task 4.

- [ ] **Step 4: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 6: Forgot password

**Files:**
- Create: `src/pages/marketplace/ForgotPasswordPage.tsx`

- [ ] **Step 1: Form**

One email field. `POST /auth/forgot-password` with `{ email }`. On 200, show the API `message`. Do not reveal whether the email exists beyond what the API already returns. Link back to `/login`.

- [ ] **Step 2: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 7: Google sign-in

**Files:**
- Create: `src/lib/marketplace/googleSignIn.ts`
- Modify: `src/pages/LoginPage.tsx` and `RegisterPage.tsx`

The Flutter app has no web Firebase config (`skillance-app/lib/firebase_options.dart` throws on web). Do not copy the Android or iOS API keys into this repo.

- [ ] **Step 1: Gate on env**

Read `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`. If any is missing, do not render a Google button and do not add the `firebase` dependency. Stop this task and leave email login working.

- [ ] **Step 2: If env exists**

`npm install firebase`. Sign in with Google, get a Firebase ID token, `POST /auth/google` with `{ idToken }`. Store tokens the same way as email login. The API creates a customer if none exists. Then `navigate(landingPath(user))`.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 8: Customer home, search, and category results

**Files:**
- Create: `src/pages/marketplace/CustomerHomePage.tsx`
- Create: `src/pages/marketplace/SearchPage.tsx`
- Create: `src/pages/marketplace/CategoryResultsPage.tsx`
- Create: `src/components/marketplace/FreelancerResultCard.tsx`

**Interfaces:**
- Consumes: `POST /freelancers/search`
- Produces: cards that link to `/freelancers/:freelancerId`

Read `skillance-backend/src/routes/freelancer.routes.ts` around `POST /freelancers/search`. Body:

```ts
{
  query: string; // 1–200 chars
  location?: { latitude: number; longitude: number };
  filters?: {
    categoryIds?: string[];
    minRating?: number; // 0–5
    priceRange?: { min?: number; max?: number }; // ZAR hourly
    maxDistance?: number; // 1–100 km, requires location
  };
  pagination?: { limit?: number; offset?: number }; // limit max 50
}
```

- [ ] **Step 1: Home**

Search box. Category shortcuts from `GET /categories` that go to `/browse/category/:categoryId`. A "near you" search uses the browser geolocation API only after the user allows it. If they deny it, search without `location`.

- [ ] **Step 2: Search page**

Query from `?q=`. Filters: category, minimum rating, min and max hourly rate, max distance when a location exists. Paginate with `limit` 20.

- [ ] **Step 3: Card**

Show name, photo, rating, review count, primary category, hourly rate, and distance when the API returns it. Empty and error states with a retry that refetches the query.

- [ ] **Step 4: Verify**

Run: `npm run build` and `npm run lint`
Manual: `/search?q=plumber` renders a list or a clear empty state. It must not render the marketing category essay from `/category/:id`.

---

### Task 9: Public freelancer profile

**Files:**
- Create: `src/pages/marketplace/FreelancerProfilePage.tsx`

Read `skillance-app/lib/screens/profile/freelancer_profile_screen.dart` for section order.

- [ ] **Step 1: Load**

`GET /freelancers/:freelancerId`, `GET /freelancers/:freelancerId/reviews`, `GET /freelancers/:freelancerId/portfolio`, `GET /products/freelancer/:freelancerId`.

Show: photo, name, bio, verification badges the payload already includes, categories and rates, service areas, rating, written reviews, portfolio, digital products.

- [ ] **Step 2: Actions**

`Book` → `/freelancers/:freelancerId/book`. If signed out, `/login` with `state.from` set to that book URL.

Favorite heart: `POST /favorites` with the body shape in `skillance-app` favorite service (open `lib/core` favorite call site and copy the JSON keys). Unfavorite: `DELETE /favorites/:freelancerId`. Hide the heart when signed out, or send the user to login.

Share: copy `https://skillance.co.za/freelancers/${freelancerId}` to the clipboard. Do not generate the app QR deep link.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 10: Create a booking

**Files:**
- Create: `src/pages/marketplace/BookFreelancerPage.tsx`
- Create: `src/lib/marketplace/bookingStatus.ts`

Read `skillance-app/lib/screens/customer/booking/booking_flow/select_service/select_service_screen.dart` and `skillance-app/lib/core/services/booking_service.dart` `createBooking`.

`POST /bookings` requires a customer profile (`request.user.customerId`). If the API returns 403 with "Customer profile not found", show that message and link to account settings. Do not send the user through a fake payment-method screen.

Body:

```ts
{
  freelancerId: string;
  category: string;
  pricingMode?: 'hourly' | 'invoice'; // default hourly
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  durationMinutes: number; // minimum 30
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  bookingGroupId?: string;
}
```

- [ ] **Step 1: Slot picker**

`GET /freelancers/:freelancerId/availability`. Subscribe to Ably channel `public:availability:${freelancerId}` the same way `select_service_screen.dart` does, and refetch availability when a message arrives. Unsubscribe on unmount.

`GET /freelancers/:freelancerId/availability/validate` before submit if the app does that for the chosen slot. Read the Flutter call and pass the same query.

- [ ] **Step 2: Submit**

On success, navigate to `/bookings/${id}` using the id in `response.data`.

- [ ] **Step 3: `bookingStatus.ts`**

Export helpers, all comparing `status.toLowerCase()`:

- `canCustomerCancel(status: string): boolean` — true unless `cancelled` or `completed`
- `canFreelancerAccept(status: string): boolean` — `pending`
- `canFreelancerDecline(status: string): boolean` — `pending`
- `isActiveSession(status: string): boolean` — `confirmed`, `inprogress`, or `in_progress`

The exact cancel window is enforced by the API. The UI may offer cancel; the API returns the matrix message. Display `response.message` and any `cancellationMatrixCode` the app shows via `skillance-app/lib/l10n/cancellation_matrix_messages.dart`. Copy those user-facing strings into `src/lib/marketplace/cancellationCopy.ts` if the code is present. Do not recompute refund percentages in the client.

- [ ] **Step 4: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 11: Booking detail, connection fee, cancel, PIN, review, dispute

**Files:**
- Create: `src/pages/marketplace/BookingDetailPage.tsx`
- Create: `src/pages/marketplace/BookingsPage.tsx`

Read `booking_history_screen.dart`, `jobs_screen.dart` (customer-relevant parts), and `skillance-backend/src/routes/booking.routes.ts` from the connection-fee comment: "Pay R50 non-refundable connection fee to unlock chat".

- [ ] **Step 1: List**

Customers: `GET /bookings/my`. Group into pending, confirmed, in progress, completed, cancelled using the status strings the API returns. Each row links to `/bookings/:bookingId`.

- [ ] **Step 2: Detail actions**

| Action | Call | Who |
| --- | --- | --- |
| Pay connection fee | `POST /bookings/:id/connection-fee`, then `POST /bookings/:id/connection-fee/confirm` with `{ connectionFeeId }` | Customer, when the booking payload says the fee is unpaid |
| Cancel | `POST /bookings/:id/cancel` with `{ reason?: string }` | Participant. Read `booking_service.dart` `cancelBooking` for the exact body key (`reason`). |
| Show PIN | `GET /bookings/:id/pin` | Customer, when session status says the window is open |
| Enter PIN | `POST /bookings/:id/verify-pin` with the body key the Flutter PIN widget sends | Freelancer |
| Session state | `GET /bookings/:id/session-status` | Both |
| Update location | `PATCH /bookings/:id/location` with `{ latitude, longitude, address? }` | Whoever the Flutter booking detail allows. Read `booking_service.dart` before showing the control. |
| Star rating | `POST /bookings/:id/rate-freelancer` | Customer, after completed, if `GET /bookings/:id/feedback-status` says it is still open |
| Written review | `POST /bookings/:id/review-text` | Customer, same gate. Read `booking_feedback_panel.dart` for the JSON keys. |
| Rate customer | `POST /bookings/:id/rate-customer` | Freelancer, same feedback-status gate |
| Open dispute | `POST /disputes` | Only while `disputeWindowEndsAt` is in the future or `disputeRequired` is set on the booking. Read `booking_service.dart` `create dispute` for the body. |
| Read dispute | `GET /disputes/booking/:bookingId` | Participant |

PIN rules from the app: the session becomes active at the scheduled time without a Start button. The customer shows the PIN. The freelancer types it. Do not add a Start Job button.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 12: Chat

**Files:**
- Create: `src/pages/marketplace/ChatListPage.tsx`
- Create: `src/pages/marketplace/ChatThreadPage.tsx`
- Create: `src/lib/marketplace/chatRealtime.ts`

Read `skillance-app/lib/providers/chat_provider.dart` and `skillance-app/lib/core/services/chat_service.dart`.

- [ ] **Step 1: List and thread**

`GET /chats`. Open a row at `/chats/:chatId`.
`GET /chats/:chatId/messages`.
`POST /chats/:chatId/messages` with the text body the Flutter service sends. Include image messages only if that service already sends an image field; use the same field name.
`PATCH /chats/:chatId/read` when the thread opens.

From a booking, `GET /chats/booking/:bookingId` and redirect to `/chats/:chatId`. If the API says chat is locked until the connection fee is paid, link back to the booking detail to pay it.

- [ ] **Step 2: Realtime**

`POST /ably/auth` (existing `ApiPaths.realtime.ablyAuth`). Subscribe to `private-chat:${chatId}`. On a message event, append it or refetch messages. Unsubscribe on unmount. The website already depends on `ably`. Follow `src/hooks/useAdminAblyQueue.ts` for how this repo creates a client, but use the chat channel, not the admin queue channel.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 13: Freelancer dashboard and jobs

**Files:**
- Create: `src/pages/marketplace/FreelancerDashboardPage.tsx`
- Create: `src/pages/marketplace/FreelancerJobsPage.tsx`

Read `freelancer_dashboard_screen.dart` and `jobs_screen.dart`.

- [ ] **Step 1: Dashboard**

Needs `freelancerId` from the session. Load:

- `GET /freelancers/:id/dashboard/stats`
- `GET /freelancers/:id/dashboard/earnings-trend`
- `GET /freelancers/:id/dashboard/performance`
- `GET /freelancers/:id/dashboard/activity`
- `GET /freelancers/profile-completion/me`

Show the completion checklist with links to the matching `/work/*` pages (verification, categories, location, availability). Earnings chart uses Recharts. If `freelancerId` is null, show application status from `GET /freelancers/application-status` instead of empty charts.

- [ ] **Step 2: Jobs**

`GET /freelancers/:freelancerId/bookings`. Pending rows: Accept `POST /bookings/:id/accept`, Decline `POST /bookings/:id/decline` with `{ reason }` if the Flutter decline dialog sends a reason. Confirmed and in-progress rows link to booking detail for the PIN. Invoice-mode rows show the invoice total label the app uses (`booking_confirmation_total_invoice_value` in the Flutter l10n) and link to the invoice panel from Task 20.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 14: Freelancer profile, categories, locations, availability

**Files:**
- Create: `src/pages/marketplace/WorkProfilePage.tsx`
- Create: `src/pages/marketplace/WorkLocationsPage.tsx`
- Create: `src/pages/marketplace/WorkAvailabilityPage.tsx`

Read `edit_freelancer_profile_screen.dart`, `manage_service_categories_wizard_screen.dart`, `service_locations_screen.dart`, `add_service_location_screen.dart`, `availability_screen.dart`, `availability_defaults_screen.dart`, `time_slot_editor_screen.dart`.

- [ ] **Step 1: Profile**

`GET /freelancers/user/:userId` then `PUT /freelancers/:freelancerId` with the fields that screen saves (bio, photo as base64, categories, rates). If the API returns a category-limit error, offer `POST /freelancers/:freelancerId/category-limit-requests` with the body that wizard sends. Read the Flutter wizard before choosing fields.

- [ ] **Step 2: Locations**

List `GET`, create `POST`, update `PUT`, delete `DELETE` on `/freelancers/:id/service-locations`. Geocode with `POST /geocoding/geocode`.

- [ ] **Step 3: Availability**

`GET` and `PUT /freelancers/:id/availability`. Validate with `GET /freelancers/:id/availability/validate`. The editor is weekly slots, minimum duration 30 minutes, matching the booking API.

- [ ] **Step 4: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 15: Portfolio, certifications, ID verification, police clearance

**Files:**
- Create: `src/pages/marketplace/WorkPortfolioPage.tsx`
- Create: `src/pages/marketplace/WorkCertificationsPage.tsx`
- Create: `src/pages/marketplace/WorkVerificationPage.tsx`
- Create: `src/pages/marketplace/WorkPoliceClearancePage.tsx`

- [ ] **Step 1: Portfolio**

`GET/POST /freelancers/:id/portfolio`, `PUT/DELETE /freelancers/:id/portfolio/:projectId`. Copy the JSON keys from `skillance-app/lib/core/services/freelancer_service.dart` portfolio methods, including base64 images.

- [ ] **Step 2: Certifications**

`POST /freelancers/:id/certifications` with `{ file: 'data:...;base64,...' }` plus the title fields `freelancer_certifications_editor.dart` sends. `DELETE /freelancers/:id/certifications/:certificationId`. Status comes from `GET /freelancers/user/:userId/certifications-hub`. Tell the user review happens in admin. Do not add an approve button.

- [ ] **Step 3: ID verification**

`GET /freelancers/user/:userId/id-verification`. Upload uses the base64 fields `verification_screen.dart` posts. Show pending, verified, and rejected from that payload.

- [ ] **Step 4: Police clearance**

`POST /freelancers/:id/police-clearance` with `{ photo: base64 }` as `FreelancerService.uploadPoliceClearance` does. `DELETE` to remove. Copy says this badge is optional and not required to take bookings (same meaning as `public/trust-safety.md`).

- [ ] **Step 5: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 16: Digital products

**Files:**
- Create: `src/pages/marketplace/WorkProductsPage.tsx`
- Create: `src/pages/marketplace/DocumentsPage.tsx`
- Create: `src/pages/marketplace/DocumentViewerPage.tsx`

Read `manage_digital_products_screen.dart`, `my_documents_screen.dart`, `secure_document_viewer_screen.dart`, and `skillance-backend/src/routes/digitalProduct.routes.ts`.

- [ ] **Step 1: Seller**

`GET /products/mine`. Create `POST /products` with the body that screen sends. Update `PATCH /products/:id`. Products stay pending until an admin verifies them. Say that on the page.

- [ ] **Step 2: Buyer**

On the freelancer profile, `POST /products/:id/purchase` for a verified product. `GET /products/purchased` on `/documents`. Viewer calls `GET /products/:id/view` with the auth header and renders the returned URL or bytes. Do not put the file URL in a public `<a href>` if the view endpoint returns a short-lived or authenticated payload. Follow the Flutter viewer.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 17: Favorites

**Files:**
- Create: `src/pages/marketplace/FavoritesPage.tsx`

- [ ] **Step 1: List and remove**

`GET /favorites`. Reuse `FreelancerResultCard`. Remove calls `DELETE /favorites/:freelancerId` and refetches.

- [ ] **Step 2: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 18: Recurring bookings

**Files:**
- Create: `src/pages/marketplace/RecurringPage.tsx`

Read `request_recurring_booking_screen.dart`, `pending_recurring_requests_screen.dart`, `recurring_series_list_screen.dart`, `recurring_series_detail_screen.dart`, and `skillance-backend/src/routes/recurring-booking.routes.ts`.

- [ ] **Step 1: Customer request**

From a freelancer profile or booking, `POST /recurring-bookings/requests` with the body the Flutter screen sends (pattern, freelancer, category, start). Read that screen for the keys. Do not invent a pattern enum.

- [ ] **Step 2: Freelancer pending**

`GET /recurring-bookings/requests/pending`. Accept and reject:

`POST /recurring-bookings/requests/:id/accept`
`POST /recurring-bookings/requests/:id/reject`

- [ ] **Step 3: Series**

`GET /recurring-bookings/series` and `GET /recurring-bookings/series/:id`. Pause, resume, and cancel via the three POST endpoints. Show the resulting bookings as links to `/bookings/:bookingId`.

- [ ] **Step 4: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 19: Earnings

**Files:**
- Create: `src/pages/marketplace/WorkEarningsPage.tsx`

Read `earnings_screen.dart`. It builds the report from bookings plus dashboard earnings, not from a separate payouts API.

- [ ] **Step 1: Data**

`GET /freelancers/:id/dashboard/earnings-trend` and `GET /freelancers/:id/bookings`. Show available figures the trend payload returns, a Recharts trend, and a table of completed bookings in a date range the user picks.

- [ ] **Step 2: Export**

Use the installed `exceljs` package to download an `.xlsx` of that table in the browser. PDF: use the browser print dialog on a print stylesheet of the same table. Do not add a PDF library. Do not claim a payout was sent. The app's payout setup screen is mock and is not part of this task.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 20: Invoices

**Files:**
- Create: `src/pages/marketplace/WorkInvoicesPage.tsx`
- Modify: `src/pages/marketplace/BookingDetailPage.tsx`

Read `freelancer_invoice_tool_screen.dart` and `skillance-backend/src/routes/invoice.routes.ts`.

- [ ] **Step 1: Freelancer**

`POST /invoices` to draft. `POST /invoices/:invoiceId/send` to send. `GET /invoices/booking/:bookingId` on the booking.

- [ ] **Step 2: Customer**

On booking detail, if an invoice exists: Accept `POST /invoices/:id/accept`, Decline `POST /invoices/:id/decline`.

Copy the request bodies from the Flutter invoice service. If a body is empty in the app, send `{}`.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 21: Account, settings, role switch, export, delete

**Files:**
- Create: `src/pages/marketplace/AccountPage.tsx`
- Create: `src/pages/marketplace/EditAccountPage.tsx`
- Create: `src/pages/marketplace/SettingsPage.tsx`
- Create: `src/pages/marketplace/ApplyFreelancerPage.tsx`

- [ ] **Step 1: Edit profile**

`PUT /users/:userId` with `fullName`, `phoneNumber`, and `profilePhoto` base64 when changed. Read `skillance-app/lib/core/services/user_service.dart` for the keys.

- [ ] **Step 2: Settings**

`GET /users/:userId/settings` and `PUT` the same resource. Persist `emailNotificationsEnabled`. Do not show a push-permission prompt. You may show the stored `pushNotificationsEnabled` value as off and disabled, with the sentence "Push notifications are available in the mobile app."

Include links to `/privacy-policy`, `/terms`, `/refund-policy`, `/help-center`.

- [ ] **Step 3: Become a freelancer**

If the user is customer-only: `GET /users/me/role-applications` and `GET /freelancers/application-status`. Submit `POST /freelancers/apply` with the body `freelancer_application_screen.dart` sends. If that screen posts to role-applications instead, use `POST /users/me/role-applications` with `{ targetRole: 'freelancer' }` plus the extra fields that screen collects. Read the screen. Do not send both if the app sends one.

Switching back uses Task 3's `PUT /users/me/preferred-view`.

- [ ] **Step 4: Export and delete**

`GET /users/me/export` downloads the JSON response as a file named `skillance-account.json`.

Delete: a confirm step that requires the user to type their email. Then `POST /users/me/delete-account` with the body `user.routes.ts` expects. Read that handler before sending fields. On success, `logout()`.

- [ ] **Step 5: Policy warnings**

If `GET /users/me` includes policy warnings, show them and `POST /users/me/policy-warnings/:warningId/acknowledge` when the user confirms.

- [ ] **Step 6: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 22: Bug report and calendar export

**Files:**
- Create: `src/pages/marketplace/BugReportPage.tsx`
- Modify: `src/pages/marketplace/SettingsPage.tsx` or `AccountPage.tsx` to link to it and to calendar export

- [ ] **Step 1: Bug report**

Read `skillance-app/lib/screens/profile/bug_report_screen.dart` and the backend handler for `POST /public/bug-report`. Submit the same fields. This endpoint is public, but the page sits behind `RequireAuth` so the report is tied to a signed-in person when the API reads the token. If the handler ignores the token, still send it via the existing `api` client.

- [ ] **Step 2: Calendar file**

A button "Download bookings calendar" calls `GET /calendar-sync/export` and saves the response. Do not implement Google or Apple calendar OAuth in this task.

- [ ] **Step 3: Verify**

Run: `npm run build` and `npm run lint`

---

### Task 23: End-to-end check

**Files:**
- Modify only files that fail this check

- [ ] **Step 1: Build**

Run: `npm run build` and `npm run lint`
Expected: both exit 0.

- [ ] **Step 2: Route smoke, in this order**

Use the running site (`npm run dev`) or the preview. Confirm each row.

| Check | Expected |
| --- | --- |
| `/` | Marketing home, unchanged |
| `/login` | No "Admin" eyebrow. Links to register and forgot password. Bad password stays on the page with an error. |
| Admin account login | Lands on `/admin/dashboard` |
| `/register?role=customer` | Form posts `termsAccepted: true` only when checked |
| `/register?role=freelancer` | Age under 18 cannot submit. Category without a rate cannot submit. |
| `/home` and `/search?q=plumber` | Freelancer results or an empty state, not the marketing category page |
| `/freelancers/:id` | Profile loads without login |
| Book while signed out | Redirects to `/login`, then returns to the book URL |
| `/bookings` signed out | Redirects to `/login` |
| `/admin/users` as a customer | Access denied or redirect. A customer must not see admin data. |
| `/chats/:chatId` | Subscribes to `private-chat:${chatId}` and unsubscribes when leaving |
| Marketing footer and FAQ bot | Absent on `/home`, `/work`, `/bookings`. Present on `/`. |

- [ ] **Step 3: Stop**

Do not start payout storage, saved cards, expenses, client CRM, push notifications, Apple sign-in, or onboarding stories. Those are out of scope for this plan.

---

## Checkpoints

Progress lives in `docs/superpowers/plans/2026-10-01-website-marketplace-progress.md`. Create that file on the first completed task and overwrite it at every checkpoint. Do not commit it unless the human asked for commits.

A checkpoint is valid only when `npm run build` and `npm run lint` both exit 0 and the working tree is left in that state. Do not start the next checkpoint’s tasks in the same turn if the session is near its limit. Stop after writing the progress file.

Write the progress file in this shape:

```md
# Marketplace progress

- Status: in progress
- Last completed task: Task N
- Next task: Task N+1
- Checkpoint: <name below>
- Build: pass | fail
- Lint: pass | fail
- Theme module: src/lib/marketplace/theme.ts present | not yet

## Done
- Task 1: one line

## Not done
- Task N+1 onward

## Deviations
- None, or a short note

## Resume
Read this file, then the plan. Continue at Next task. Do not redo completed tasks. Marketplace colors come from src/lib/marketplace/theme.ts, sourced from skillance-app/lib/core/theme/theme_config.dart.
```

Stop and write that file after each of these boundaries:

| Checkpoint | Finish through | What works |
| --- | --- | --- |
| A | Task 3 | API client, login sends customers and freelancers into the app shell, admins still reach `/admin/dashboard`, marketing site unchanged |
| B | Task 6 | Customer registration, freelancer registration, forgot password |
| C | Task 8 and Task 9 | Search, category results, public freelancer profile. Task 7 (Google) may be skipped if Firebase web env is missing; say so under Deviations |
| D | Task 12 | Book, connection fee, booking detail, PIN, review, dispute, chat |
| E | Task 15 | Freelancer dashboard, jobs, profile, locations, availability, portfolio, verification |
| F | Task 22 | Products, favorites, recurring, earnings, invoices, account, bug report, calendar download |
| G | Task 23 | End-to-end check recorded. Status: complete |

## Implementation order

Tasks 1 → 3 unblock everything else. Then 4 → 6 (accounts), 8 → 12 (a customer can find someone, book, pay the connection fee, and message), 13 → 15 (a freelancer can be booked and run the job), then 16 → 22. Task 7 can land any time after Task 2 and must not block the rest. Task 23 is last.

## Source files to keep open

- Website auth: `src/pages/LoginPage.tsx`, `src/context/AuthContext.tsx`, `src/App.tsx`, `src/lib/api.ts`, `src/lib/apiEndpoints.ts`
- API contracts: `skillance-backend/src/routes/auth.routes.ts`, `booking.routes.ts`, `freelancer.routes.ts`, `chat.routes.ts`, `invoice.routes.ts`, `dispute.routes.ts`, `recurring-booking.routes.ts`, `digitalProduct.routes.ts`, `pin.routes.ts`, `user.routes.ts`
- App behavior: `skillance-app/lib/core/config/api_config.dart`, `lib/core/services/booking_service.dart`, `lib/core/services/chat_service.dart`, `lib/core/services/freelancer_service.dart`, `lib/providers/chat_provider.dart`, and the screen named in each task
