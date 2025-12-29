import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Linkedin, Facebook } from 'lucide-react'
import XIcon from '@/components/icons/XIcon'
import { COMPANY_INFO } from '@/utils/contractingConstants'
import { motion } from 'framer-motion'

const ContractingContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success')
      setIsSubmitting(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: '',
      })

      setTimeout(() => setSubmitStatus(null), 5000)
    }, 1500)
  }

  return (
    <>
      <PageHeader
        title="Get in Touch"
        subtitle="Let's discuss how we can help bring your ideas to life"
        breadcrumb={['Home', 'Contact']}
      />

      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <AnimatedSection animation="slideInLeft">
            <Card className="border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="service">Service Interest</Label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="mt-2 flex h-12 w-full rounded-md border border-border bg-white px-4 py-3 text-sm"
                    >
                      <option value="">Select a service</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="web">Web Development</option>
                      <option value="custom">Custom Software</option>
                      <option value="consulting">Consulting</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                      Thank you! We'll get back to you soon.
                    </div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-gradient-primary text-white border-0 shadow-professional-lg hover:shadow-accent-lg transition-all" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Contact Information */}
          <div className="space-y-8">
            <AnimatedSection animation="slideInRight">
              <Card className="border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300 bg-gradient-card">
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div 
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-text-secondary">{COMPANY_INFO.email}</div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-text-secondary">{COMPANY_INFO.phone}</div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-text-secondary">{COMPANY_INFO.address}</div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight">
              <Card className="border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300 bg-gradient-card">
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                    Follow Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <motion.a
                      href={COMPANY_INFO.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-gradient-subtle border border-[var(--color-accent-teal)]/20 hover:bg-gradient-accent hover:border-[var(--color-accent-teal)] transition-all"
                      aria-label="LinkedIn"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin size={24} className="text-[var(--color-section-primary)] group-hover:text-white" />
                    </motion.a>
                    <motion.a
                      href={COMPANY_INFO.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-gradient-subtle border border-[var(--color-accent-teal)]/20 hover:bg-gradient-accent hover:border-[var(--color-accent-teal)] transition-all"
                      aria-label="X (Twitter)"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XIcon size={24} className="text-[var(--color-section-primary)]" />
                    </motion.a>
                    <motion.a
                      href={COMPANY_INFO.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-gradient-subtle border border-[var(--color-accent-teal)]/20 hover:bg-gradient-accent hover:border-[var(--color-accent-teal)] transition-all"
                      aria-label="Facebook"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Facebook size={24} className="text-[var(--color-section-primary)]" />
                    </motion.a>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </Section>
    </>
  )
}

export default ContractingContactPage

