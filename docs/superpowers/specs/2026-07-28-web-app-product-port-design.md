# Skillance Web Product (`/app`)

Launch surface for the full Skillance services product on the website, separate from marketing and admin.

## Routes

| Zone | Path | Chrome |
|------|------|--------|
| Marketing | `/`, `/services`, help/legal | Site nav + footer |
| Product | `/app/*` | App shell only (no marketing chrome) |
| Admin | `/admin/*` | Admin layout |

## Auth

- Product: `/app/login`, `/app/register`, `/app/forgot-password`
- Admin: `/login` (unchanged)
- Same backend accounts as the Flutter app (JWT + optional Google via Firebase web SDK)

## Guest access (matches Flutter)

Public without login: home, search, categories, freelancer profiles. Book, chat, favorites, and account areas require auth.

## Env vars (product)

```env
VITE_API_BASE_URL=https://api.skillance.co.za
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
```

Google sign-in is hidden until Firebase env vars are set.

## Implementation phases

1. Foundation — shell, auth, routing
2. Discovery — browse, search, profiles
3. Booking — create, manage, connection fee
4. Customer — profile, favorites, documents, settings
5. Chat — threads + Ably realtime
6. Freelancer — dashboard, jobs, earnings, apply
7. Launch — recurring, marketing CTAs, polish
