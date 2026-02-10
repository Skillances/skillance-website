# Skillance Company Website

A modern, professional company website for Skillance built with React, Vite, Tailwind CSS v4, and shadcn/ui components.

## Overview

Skillance is a software development company website showcasing services in Mobile Development, Web Development, and Custom Software Solutions. The website features a clean, minimal design with a black and white color scheme matching the Skillance mobile app aesthetic.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS v4** - Utility-first CSS framework (with Vite plugin)
- **shadcn/ui** - Accessible component library
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## Features

### Pages
- **Home** - Hero section, company overview, services preview, and CTA
- **About** - Company story, mission & vision, core values
- **Services** - Detailed service descriptions and development process
- **Portfolio** - Project showcase with categories
- **Contact** - Contact form with validation and company information
- **Login** - Secure admin authentication with Firebase Auth
- **Admin Dashboard** - Analytics, user management, and content management

### Design System
- **Colors:**
  - Primary: Black (#000000)
  - Secondary: Teal (#14B8A6), Emerald (#10B981)
  - Background: White (#FFFFFF)
  - Surface Variant: Light Grey (#F3F3F3)

- **Typography:**
  - Headers: Poppins (Bold/SemiBold)
  - Body: Inter (Regular)

- **Style:**
  - Modern/minimal, corporate/professional
  - Clean design with no gradients
  - Smooth scroll animations
  - Fully responsive

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see [Backend Setup](#backend-setup))

### Installation

1. Navigate to the project directory:
```bash
cd skillance-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file in the root directory
touch .env.local
```

Add the following to `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration.

### Backend Setup

The frontend connects to the Skillance backend API for authentication and data.

1. Make sure the backend is running:
```bash
cd ../skillance-backend
npm install
npm run dev
```

2. Backend should be running on `http://localhost:3000`

For detailed backend setup, see the [Backend README](../skillance-backend/README.md).

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

**Note:** The port changed from 3000 to 5173 (Vite's default port) to avoid conflicts with the backend.

### Build

Create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
Skillance-website/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, data files
│   │   └── data/       # JSON data files
│   ├── components/     # React components
│   │   ├── common/     # Shared components
│   │   ├── home/       # Home page components
│   │   ├── layout/     # Layout components (Header, Footer)
│   │   └── ui/         # shadcn/ui components
│   ├── pages/          # Page components
│   ├── styles/         # CSS files
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## Customization

### Company Information
Edit `src/utils/constants.js` to update:
- Company name, tagline, and description
- Contact information (email, phone, address)
- Social media links
- Services offered
- Company values

### Colors and Styling
Modify `src/styles/index.css` in the `@theme` block to change:
- Color palette
- Typography (fonts)
- Border radius
- Spacing

### Content
- **Services:** Update `SERVICES` array in `src/utils/constants.js`
- **Portfolio Projects:** Edit `projects` array in `src/pages/PortfolioPage.jsx`
- **Process Steps:** Modify `PROCESS_STEPS` in `src/utils/constants.js`

## Security

This application implements enterprise-grade security features:

- ✅ **Firebase Authentication** - Secure password hashing and JWT tokens
- ✅ **Admin-Only Access** - Multi-layer protection (frontend + backend)
- ✅ **httpOnly Cookies** - XSS protection for web sessions
- ✅ **CSRF Protection** - Custom headers to prevent cross-site attacks
- ✅ **CORS** - Whitelisted origins only
- ✅ **Rate Limiting** - Brute force protection (10 attempts per 10 minutes)
- ✅ **Automatic Token Refresh** - Seamless session management
- ✅ **Secure Environment Variables** - No secrets in code

**Admin Access:**
- Only users with `isAdmin: true` in the database can login and access admin pages
- Regular users are blocked with "Admin access required" error
- All admin API endpoints verify admin status in the database
- No API can grant admin access (must be set directly in database)

**Documentation:**
- Quick Overview: [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md) ⭐ **Start here!**
- Detailed Setup: [SECURITY_SETUP.md](./SECURITY_SETUP.md)
- Environment Config: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

## Deployment

### Environment Variables

Before deploying, set the following environment variables:

**Production:**
```env
VITE_API_BASE_URL=https://api.skillance.co.za
```

Make sure your backend is also deployed and configured with:
- `WEBSITE_URL=https://skillance.co.za` (or your actual domain)
- `NODE_ENV=production`
- Strong `COOKIE_SECRET`
- HTTPS enabled

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `VITE_API_BASE_URL` with your production API URL

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL`

### GitHub Pages
```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/Skillance-website",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

Then deploy:
```bash
npm run deploy
```

## Future Enhancements

- Add image assets for hero, services, and portfolio
- Integrate with a backend API for contact form submissions
- Add blog/news section
- Implement SEO optimization with react-helmet-async
- Add testimonials section
- Create team member profiles
- Add case study detail pages
- Implement project filtering on portfolio page

## License

This project is private and proprietary to Skillance.

## Contact

For questions or support, contact: info@skillance.com

---

**Built with ❤️ by Skillance**
