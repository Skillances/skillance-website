# Skillance South Africa - Main Website v1.0.0

Professional software development services and freelancer marketplace platform platform connecting customers with verified freelancers across South Africa.

## 🚀 Overview

This repository contains the source code for the Skillance South Africa website. The project has been recently migrated to a modern, high-performance architecture using React, TypeScript, and Vite, featuring a premium dark aesthetic.

### Key Features
- **Modern UI/UX**: Premium dark theme with smooth animations and responsive design.
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
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_API_BASE_URL=your_api_url
   VITE_EMAILJS_SERVICE_ID=your_id
   VITE_EMAILJS_TEMPLATE_ID=your_id
   VITE_EMAILJS_PUBLIC_KEY=your_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔐 Security & Access Control

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
