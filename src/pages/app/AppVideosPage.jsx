import PageHeader from '@/components/common/PageHeader'
import VideoShowcase from '@/components/app/VideoShowcase'
import InteractiveDemo from '@/components/app/InteractiveDemo'
import Section from '@/components/common/Section'
import DownloadCTA from '@/components/app/DownloadCTA'
import FloatingCTA from '@/components/app/FloatingCTA'

const AppVideosPage = () => {
  return (
    <>
      {/* Floating Download Button */}
      <FloatingCTA />

      <PageHeader
        title="Videos & Demos"
        subtitle="See Skillance in action"
        breadcrumb={['Home', 'Videos']}
      />

      {/* Video Showcase */}
      <VideoShowcase />

      {/* Interactive Feature Demo */}
      <Section background="grey">
        <InteractiveDemo />
      </Section>

      {/* Download CTA */}
      <Section>
        <DownloadCTA />
      </Section>
    </>
  )
}

export default AppVideosPage

