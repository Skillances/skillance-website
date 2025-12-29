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
import { COMPANY_INFO } from '@/utils/constants'

const ContactPage = () => {
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
            <Card>
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

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Contact Information */}
          <div className="space-y-8">
            <AnimatedSection animation="slideInRight">
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail size={20} style={{ color: 'var(--color-primary)' }} className="mt-1" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-text-secondary">{COMPANY_INFO.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone size={20} style={{ color: 'var(--color-primary)' }} className="mt-1" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-text-secondary">{COMPANY_INFO.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin size={20} style={{ color: 'var(--color-primary)' }} className="mt-1" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-text-secondary">{COMPANY_INFO.address}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight">
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                    Follow Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <a
                      href={COMPANY_INFO.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--color-surface-variant)' }}
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={24} />
                    </a>
                    <a
                      href={COMPANY_INFO.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--color-surface-variant)' }}
                      aria-label="X (Twitter)"
                    >
                      <XIcon size={24} />
                    </a>
                    <a
                      href={COMPANY_INFO.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--color-surface-variant)' }}
                      aria-label="Facebook"
                    >
                      <Facebook size={24} />
                    </a>
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

export default ContactPage
