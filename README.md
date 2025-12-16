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

### Installation

1. Navigate to the project directory:
```bash
cd C:\Users\Admin\Documents\Skillance-website
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

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

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

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
