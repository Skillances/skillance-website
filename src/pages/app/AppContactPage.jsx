import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Briefcase, HelpCircle } from 'lucide-react'
import { sendEmail, formatContactFormData } from '@/utils/emailjs'
import { APP_COMPANY_INFO } from '@/utils/appConstants'

const AppContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
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
    setSubmitStatus(null)

    try {
      const templateParams = formatContactFormData({
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      })
      const result = await sendEmail(templateParams)

      if (result.success) {
        setSubmitStatus('success')
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: '',
        })
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus('error')
        setTimeout(() => setSubmitStatus(null), 5000)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactReasons = [
    {
      icon: HelpCircle,
      title: 'General Support',
      description: 'Questions about using the app or getting started',
    },
    {
      icon: Briefcase,
      title: 'Business Partnerships',
      description: 'Interested in partnering with Skillance',
    },
    {
      icon: MessageSquare,
      title: 'Feedback',
      description: 'Share your ideas and suggestions',
    },
    {
      icon: Mail,
      title: 'Media Inquiries',
      description: 'Press and media related questions',
    },
  ]

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Get in touch with the Skillance team"
        breadcrumb={['Home', 'Contact']}
      />

      {/* Contact Reasons */}
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How Can We Help?
            </h2>
            <p className="text-lg text-text-secondary">
              Choose a category that best describes your inquiry
            </p>
          </AnimatedSection>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactReasons.map((reason, index) => {
            const Icon = reason.icon
            
            return (
              <AnimatedSection key={reason.title} animation="fadeInUp">
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div 
                      className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'var(--color-surface-variant)' }}
                    >
                      <Icon size={28} style={{ color: 'var(--color-section-primary)' }} />
                    </div>
                    <CardTitle 
                      style={{ fontFamily: 'var(--font-family-poppins)' }} 
                      className="text-lg mb-2"
                    >
                      {reason.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {reason.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <AnimatedSection animation="fadeInUp">
            <Card>
              <CardHeader>
                <CardTitle 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-2xl"
                >
                  Send us a message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe" 
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com" 
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?" 
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..." 
                      rows={6}
                      required
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                      Thank you! We'll get back to you soon.
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--color-error)', color: 'white' }}>
                      <div className="font-medium mb-1">Error sending message</div>
                      <div className="text-sm opacity-90">
                        Please check the browser console for details or contact us directly at {APP_COMPANY_INFO.email}
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    style={{ backgroundColor: 'var(--color-section-primary)' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </Section>

      {/* Additional Contact Info */}
      <Section background="grey">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-8">
              <h2 
                style={{ fontFamily: 'var(--font-family-poppins)' }} 
                className="text-3xl font-bold mb-4"
              >
                Other Ways to Reach Us
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection animation="slideInLeft">
              <Card>
                <CardHeader>
                  <CardTitle 
                    style={{ fontFamily: 'var(--font-family-poppins)' }}
                  >
                    For App Users
                  </CardTitle>
                  <CardDescription>
                    If you're already using the Skillance app, you can contact support 
                    directly through the in-app help center for faster assistance.
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight">
              <Card>
                <CardHeader>
                  <CardTitle 
                    style={{ fontFamily: 'var(--font-family-poppins)' }}
                  >
                    Business Inquiries
                  </CardTitle>
                  <CardDescription>
                    For partnership opportunities, investment inquiries, or media requests, 
                    please include relevant details in your message above.
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </Section>
    </>
  )
}

export default AppContactPage









