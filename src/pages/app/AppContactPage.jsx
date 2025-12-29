import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Briefcase, HelpCircle } from 'lucide-react'

const AppContactPage = () => {
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
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..." 
                      rows={6}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    style={{ backgroundColor: 'var(--color-section-primary)' }}
                  >
                    Send Message
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

