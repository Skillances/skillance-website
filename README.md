# Skillance South Africa - Main Website v1.0.0

Africa's premier freelancer marketplace platform connecting customers with verified skilled professionals and freelancers across South Africa.

## 🚀 Overview

This repository contains the source code for the Skillance South Africa website. The project has been recently migrated to a modern, high-performance architecture using React, TypeScript, and Vite, featuring a premium dark aesthetic.

### Key Features
- **Modern UI/UX**: Premium dark theme with smooth animations and responsive design.
- **Web product app**: Full Skillance services experience at `/app` (browse, book, chat, freelancer dashboard) — separate from marketing chrome.
- **Admin Dashboard**: Comprehensive management panel for users, freelancers, and platform analytics.
- **SEO Optimized**: Fully compliant with modern SEO standards, including structured data, meta tags, and optimized assets.
- **Secure Authentication**: Robust authentication flow with protected routes and role-based access control.
- **Performance**: Built with Vite and TypeScript for lightning-fast development and production builds.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations), GSAP
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Skillance-SA/skillance-website.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` — at minimum set `VITE_API_BASE_URL`. Firebase values match the Flutter app project (`skillance-4ec9d`); add a **Web app** in Firebase Console and set `VITE_FIREBASE_APP_ID` for Google sign-in on `/app`.
   ```env
   VITE_API_BASE_URL=your_api_url
   # Product app — Firebase web (Google sign-in)
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_EMAILJS_SERVICE_ID=your_id
   VITE_EMAILJS_TEMPLATE_ID=your_id
   VITE_EMAILJS_PUBLIC_KEY=your_key
   # Optional: always show Admin Bookings "Advance session" Dev column (still requires API ALLOW_BOOKING_DEV_TOOLS). Button only appears for confirmed bookings, not in-progress.
   # VITE_SHOW_BOOKING_DEV_TOOLS=true
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the product at `http://localhost:5173/app`

## Web product (`/app`)

Marketing stays on `/`. The product lives under `/app/*` with its own mobile-friendly shell. Admin remains at `/admin/*`; staff login stays at `/login`.

See [docs/superpowers/specs/2026-07-28-web-app-product-port-design.md](docs/superpowers/specs/2026-07-28-web-app-product-port-design.md).

## Security & Access Control

The website includes a protected admin section accessible via the "Admin Login" link in the footer.
- **Auth Flow**: Uses JWT with automatic token refresh.
- **Protected Routes**: Implemented using a custom `ProtectedRoute` component.
- **Environment Safety**: Sensitive configurations are managed via environment variables and never committed to version control.

## 🚀 Deployment

The project is configured for seamless deployment on **Vercel**.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Configuration**: See `vercel.json` for routing and header rules.

## 📄 License

© 2026 Skillance South Africa. All rights reserved.
