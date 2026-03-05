import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const footerLinks = {
    Index: [
      { name: 'Mission', href: '/#mission' },
      { name: 'Services', href: '/#services' },
      { name: 'How It Works', href: '/#how-it-works' },
      { name: 'Testimonials', href: '/#testimonials' },
      { name: 'Reviews', href: '/#reviews' },
    ],
    Resources: [
      { name: 'Help Center', href: '/help-center' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Trust & Safety', href: '/trust-safety' },
      { name: 'Get in touch', href: '/contact' },
      { name: 'Admin', href: '/admin' },
    ],
    Legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookie-policy' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61586337693441#' },
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/skillanceza/' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/skillanceza/?viewAsMember=true' },
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  return (
    <footer id="footer" className="bg-neutral-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 block">
              <img 
                src="/skillance-tiny-logo-white.png" 
                alt="Skillance" 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-neutral-400 max-w-md leading-relaxed">
              Connecting communities with trusted experts. Find verified professionals 
              for all your service needs.
            </p>
          </div>

          {/* Social Links */}
          <div className="lg:text-right">
            <p className="text-sm text-neutral-500 mb-4 font-medium uppercase tracking-widest">Follow us</p>
            <div className="flex gap-4 lg:justify-end">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-neutral-800 hover:bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 hover:text-black transition-all duration-500 group"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-neutral-800 mb-16" />

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm text-neutral-500 mb-6 font-medium uppercase tracking-widest">
                {category}
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('/#') ? (
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-white hover:text-neutral-400 transition-colors duration-300 text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-white hover:text-neutral-400 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-neutral-800 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Skillance. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-neutral-500">
              Made with care in South Africa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

