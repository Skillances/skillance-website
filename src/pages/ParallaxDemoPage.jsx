import { Parallax } from '@/components/Parallax'
import { Reveal } from '@/components/Reveal'
import Section from '@/components/common/Section'

// Example images - replace with your actual images
const projects = [
  {
    id: 1,
    title: 'Project One',
    description: 'A beautiful showcase of modern design principles',
    image: '/portfolio/incident-alarm-system.png',
  },
  {
    id: 2,
    title: 'Project Two',
    description: 'Innovative solutions for complex problems',
    image: '/portfolio/incident-alarm-system.png',
  },
  {
    id: 3,
    title: 'Project Three',
    description: 'Seamless user experiences that delight',
    image: '/portfolio/incident-alarm-system.png',
  },
]

const ParallaxDemoPage = () => {
  return (
    <>
      {/* Hero Section with Parallax Text */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <Reveal type="text" stagger={0.1}>
            <h1 
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              Smooth Parallax
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8">
              Experience buttery smooth scrolling
            </p>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Built with Lenis and GSAP ScrollTrigger for premium performance
            </p>
          </Reveal>
        </div>

        {/* Background elements with parallax */}
        <Parallax speed={0.3} className="absolute top-20 left-10 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl -z-10" />
        <Parallax speed={0.5} className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl -z-10" />
      </section>

      {/* Projects Section with Image Parallax */}
      <Section>
        <div className="container mx-auto px-4">
          <Reveal type="fade" className="text-center mb-16">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Featured Projects
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Each image drifts subtly at different speeds as you scroll
            </p>
          </Reveal>

          <div className="space-y-32 md:space-y-48">
            {projects.map((project, index) => (
              <div key={project.id} className="grid md:grid-cols-2 gap-8 items-center">
                {/* Image with parallax and reveal */}
                <Reveal 
                  type="image" 
                  className={`${index % 2 === 0 ? 'md:order-1' : 'md:order-2'} rounded-2xl overflow-hidden`}
                >
                  <Parallax speed={index % 2 === 0 ? 0.15 : -0.15}>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-[400px] md:h-[500px] object-cover"
                      loading="lazy"
                    />
                  </Parallax>
                </Reveal>

                {/* Text content with reveal */}
                <Reveal 
                  type="text" 
                  stagger={0.1}
                  className={`${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}
                >
                  <h3 
                    style={{ fontFamily: 'var(--font-family-poppins)' }}
                    className="text-3xl md:text-4xl font-bold mb-4"
                  >
                    {project.title}
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    {project.description}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stats Section with Parallax Numbers */}
      <Section background="grey">
        <div className="container mx-auto px-4">
          <Reveal type="fade" className="text-center mb-16">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              By The Numbers
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '100+', label: 'Projects Completed' },
              { number: '50+', label: 'Happy Clients' },
              { number: '10+', label: 'Years Experience' },
            ].map((stat, index) => (
              <Reveal key={index} type="fade" delay={index * 0.1}>
                <div className="text-center">
                  <Parallax speed={0.1 * (index + 1)}>
                    <div 
                      style={{ 
                        fontFamily: 'var(--font-family-poppins)',
                        color: 'var(--color-section-primary)'
                      }}
                      className="text-5xl md:text-6xl font-bold mb-2"
                    >
                      {stat.number}
                    </div>
                  </Parallax>
                  <p className="text-lg text-text-secondary">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section>
        <Reveal type="text" stagger={0.1} className="text-center max-w-3xl mx-auto">
          <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Get Started?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Experience the smooth scrolling and parallax effects throughout the site
          </p>
        </Reveal>
      </Section>
    </>
  )
}

export default ParallaxDemoPage

