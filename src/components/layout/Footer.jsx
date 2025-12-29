import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Linkedin, Facebook, Apple } from 'lucide-react'
import XIcon from '@/components/icons/XIcon'
import { useSectionContext } from '@/context/SectionContext'
import { APP_INFO, APP_NAVIGATION, APP_COMPANY_INFO } from '@/utils/appConstants'
import { COMPANY_INFO as CONTRACTING_COMPANY_INFO, CONTRACTING_NAVIGATION } from '@/utils/contractingConstants'

// Custom Android icon component
const AndroidIcon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5" />
  </svg>
)

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { activeSection } = useSectionContext()
  const isApp = activeSection === 'app'
  
  const info = isApp ? APP_COMPANY_INFO : CONTRACTING_COMPANY_INFO
  const navigation = isApp ? APP_NAVIGATION : CONTRACTING_NAVIGATION

  return (
    <footer 
      className="text-white relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, var(--color-section-primary, #1E3A8A) 0%, var(--color-accent-teal, #14B8A6) 50%, var(--color-accent-cyan, #0891B2) 100%)',
        backgroundColor: 'var(--color-section-primary, #1E3A8A)'
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl z-0" />
      <div className="container mx-auto container-padding max-w-7xl py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/app_icon.png" 
                alt="Skillance" 
                className="w-8 h-8 object-contain"
              />
              <span style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-xl font-bold block">
                Skillance
              </span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {info.description}
            </p>
            {!isApp && CONTRACTING_COMPANY_INFO.social && (
              <div className="flex space-x-4">
                <a
                  href={CONTRACTING_COMPANY_INFO.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={CONTRACTING_COMPANY_INFO.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="X (Twitter)"
                >
                  <XIcon size={20} />
                </a>
                <a
                  href={CONTRACTING_COMPANY_INFO.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-family-poppins)', color: '#FFFFFF' }} className="font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm hover:text-white transition-colors"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services or Categories */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-family-poppins)', color: '#FFFFFF' }} className="font-semibold mb-4">
              {isApp ? 'Popular Categories' : 'Services'}
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {isApp ? (
                <>
                  <li>Tutors</li>
                  <li>Mobile Mechanics</li>
                  <li>Fitness Trainers</li>
                  <li>House Sitters</li>
                </>
              ) : (
                <>
                  <li>Mobile Development</li>
                  <li>Web Development</li>
                  <li>Custom Software</li>
                  <li>UI/UX Design</li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info or Download */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-family-poppins)', color: '#FFFFFF' }} className="font-semibold mb-4">
              {isApp ? 'Download' : 'Contact'}
            </h3>
            {isApp ? (
              <div className="space-y-3">
                <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {APP_INFO.status === 'Coming Soon' ? 'Coming Soon' : 'Get Skillance'}
                </p>
                <div>
                  {APP_INFO.status === 'Coming Soon' ? (
                    <img 
                      src="/get_it_on.png" 
                      alt="Download on the App Store and Get it on Google Play"
                      className="w-[230px] h-[160px] opacity-70"
                    />
                  ) : (
                    <a 
                      href={APP_INFO.playStoreUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block transition-opacity hover:opacity-80"
                    >
                      <img 
                        src="/get_it_on.png" 
                        alt="Download on the App Store and Get it on Google Play"
                        className="w-[230px] h-[160px]"
                      />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <ul className="space-y-3 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <li className="flex items-start space-x-2">
                  <Mail size={16} className="mt-1 shrink-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  <span>{CONTRACTING_COMPANY_INFO.email}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Phone size={16} className="mt-1 shrink-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  <span>{CONTRACTING_COMPANY_INFO.phone}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin size={16} className="mt-1 shrink-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  <span>{CONTRACTING_COMPANY_INFO.address}</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              © {currentYear} {info.name}. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <Link to="/privacy" className="hover:text-white transition-colors" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
