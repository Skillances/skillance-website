import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const projects = [
  {
    id: 1,
    title: 'Eridgerda.org.uk',
    category: 'Charity Website & Admin System',
    description: 'A comprehensive charity website with full content management system, replacing spreadsheets and manual processes with a unified platform.',
    longDescription: 'RDA is a charity website plus admin system built to help a real organisation run day-to-day without tech headaches. It is not a static website—it is a working tool.',
    hasWebsitePreview: true,
    features: [
      'Public-facing website with programmes and events',
      'Gallery with image management',
      'Online donations system',
      'Contact form with message management',
      'Volunteer application system',
      'Full admin dashboard for content management',
      'No spreadsheets, emails, or WhatsApp chains needed'
    ],
    benefits: [
      'Saves time and reduces admin work',
      'Professional and trustworthy appearance',
      'Makes donations easier',
      'Keeps all data organized in one place'
    ],
    technologies: ['Web Application', 'Content Management', 'Payment Integration'],
    url: 'https://www.eridgerda.org.uk/',
    hasUrl: true,
  },
  {
    id: 2,
    title: 'Incident & Alarm Management System',
    category: 'B2B Security & Operations Technology',
    description: 'A smart incident and alarm management system that centralizes alarms from sensors, panic buttons, cameras, and monitoring systems into one unified dashboard.',
    longDescription: 'Built for a private corporate client in the B2B security and operations technology sector. This system handles places like farms, factories, estates, or businesses with sensors, panic buttons, cameras, or monitoring systems. When something goes wrong, this system handles the chaos.',
    hasImage: true,
    image: '/portfolio/incident-alarm-system.png', // Add your image to public/portfolio/incident-alarm-system.png
    features: [
      'Real-time alarm aggregation from multiple sources',
      'Live dashboard with instant updates',
      'Three-view system: New, Assigned, and Dropbox',
      'Alarm assignment to individuals or teams',
      'Status tracking and accountability',
      'Complete alarm history with filtering and search',
      'Pattern analysis and response time tracking'
    ],
    benefits: [
      'Faster response times',
      'Clear ownership and accountability',
      'Eliminates confusion and lost alarms',
      'Replaces WhatsApp, phone calls, and spreadsheets'
    ],
    technologies: ['Real-time System', 'Dashboard', 'Alarm Management'],
    url: null,
    hasUrl: false,
  },
  {
    id: 3,
    title: 'RMS (Resource Management System)',
    category: 'Mining & Industrial Operations',
    description: 'A comprehensive Resource Management System (RMS) for mining and industrial companies, replacing Excel, paper logs, and tribal knowledge.',
    longDescription: 'Built for a private corporate client in the mining sector/industry. RMS is a full asset and operations management system that replaces Excel, paper logs, and tribal knowledge with a unified digital platform.',
    features: [
      'Site and location management',
      'Complete asset tracking (machines, vehicles, equipment)',
      'Asset classes, groups, makes, and rules',
      'User and role management per site',
      'Daily operational transaction capture',
      'Fault logging and history tracking',
      'Permission-based access control',
      'Comprehensive reporting and analytics'
    ],
    benefits: [
      'Real visibility into asset status',
      'Track which assets are active or costing money',
      'Identify recurring breakdown patterns',
      'Complete audit trail of all activities',
      'Site-based access control'
    ],
    technologies: ['Enterprise System', 'Asset Management', 'Operations Tracking'],
    url: null,
    hasUrl: false,
  },
]

const ContractingPortfolioPage = () => {
  return (
    <>
      <PageHeader
        title="Our Portfolio"
        subtitle="Real solutions for real businesses"
        breadcrumb={['Home', 'Portfolio']}
      />

      <Section>
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <AnimatedSection animation="fadeInUp">
            <p className="text-lg text-text-secondary leading-relaxed">
              We build working systems that replace spreadsheets, emails, and manual processes. 
              Each project is designed to solve real problems and deliver measurable value.
            </p>
          </AnimatedSection>
        </div>

        <div className="space-y-12">
          {projects.map((project, index) => (
            <AnimatedSection 
              key={project.id} 
              animation={index % 2 === 0 ? "fadeInLeft" : "fadeInRight"}
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="overflow-hidden hover-lift border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left side - Image/Icon/Preview */}
                    <div className="aspect-video md:aspect-auto bg-gradient-primary flex items-center justify-center p-8 relative overflow-hidden">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-section-primary)] via-[var(--color-accent-teal)] to-[var(--color-accent-cyan)] opacity-90" />
                      
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                      
                      {project.hasWebsitePreview ? (
                        /* Website Preview */
                        <div className="w-full h-full relative z-10 flex items-center justify-center">
                          <iframe
                            src={project.url}
                            className="w-full h-full border-0 rounded-lg shadow-professional-xl"
                            style={{ minHeight: '500px' }}
                            title={`${project.title} Preview`}
                          />
                        </div>
                      ) : project.hasImage ? (
                        /* Image Display */
                        <div className="w-full h-full relative z-10 flex items-center justify-center">
                          {project.image ? (
                            <img 
                              src={project.image} 
                              alt={project.title}
                              className="w-full h-full object-cover rounded-lg shadow-professional-xl"
                            />
                          ) : (
                            /* Fallback Placeholder */
                            <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-lg border-2 border-white/20 flex items-center justify-center">
                              <div className="text-center text-white/80">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-white/20 flex items-center justify-center">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-sm">Project Preview</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Default Icon */
                        <div className="text-center relative z-10">
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-professional-lg border-2 border-white/30">
                            <span className="text-4xl font-bold text-white">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-sm bg-white/20 text-white border-white/30">
                            {project.category}
                          </Badge>
                        </div>
                      )}
                    </div>

                  {/* Right side - Content */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <CardTitle 
                          style={{ fontFamily: 'var(--font-family-poppins)' }}
                          className="text-2xl mb-2"
                        >
                          {project.title}
                        </CardTitle>
                        {project.hasUrl && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            View Live Site
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>

                    <CardDescription className="text-base mb-6">
                      {project.longDescription}
                    </CardDescription>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 
                        style={{ fontFamily: 'var(--font-family-poppins)' }}
                        className="font-semibold mb-3 text-sm uppercase tracking-wide"
                      >
                        Key Features
                      </h4>
                      <ul className="space-y-2">
                        {project.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 
                        style={{ fontFamily: 'var(--font-family-poppins)' }}
                        className="font-semibold mb-3 text-sm uppercase tracking-wide"
                      >
                        Why It Matters
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.benefits.map((benefit, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs border-[var(--color-accent-teal)] text-[var(--color-accent-teal)] hover:bg-[var(--color-accent-teal)] hover:text-white transition-colors"
                          >
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                      {project.technologies.map((tech) => (
                        <Badge 
                          key={tech} 
                          variant="secondary"
                          className="bg-gradient-subtle border-[var(--color-accent-teal)]/20 text-[var(--color-section-primary)]"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="grey">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
          <div className="relative z-10">
            <AnimatedSection animation="fadeInUp">
              <div className="text-center max-w-3xl mx-auto">
                <h2 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-3xl md:text-4xl font-bold mb-4"
                >
                  Ready to Build Your Solution?
                </h2>
                <p className="text-lg text-text-secondary mb-8">
                  Let's discuss how we can replace your spreadsheets and manual processes 
                  with a system that actually works.
                </p>
                <motion.a
                  href="/contact"
                  className="inline-block px-8 py-3 rounded-lg text-white font-medium bg-gradient-primary shadow-professional-lg hover:shadow-accent-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </Section>
    </>
  )
}

export default ContractingPortfolioPage
