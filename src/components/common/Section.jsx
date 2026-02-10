import { cn } from '@/utils/cn'

const Section = ({
  children,
  className = '',
  background = 'white',
  id = ''
}) => {
  const bgClasses = {
    white: 'bg-white',
    grey: 'bg-surface-variant',
    black: 'bg-primary text-white',
  }

  return (
    <section
      id={id}
      className={cn(
        'section-padding',
        bgClasses[background],
        className
      )}
      style={{ 
        paddingTop: 'clamp(3rem, 8vw, 6rem)',
        paddingBottom: 'clamp(3rem, 8vw, 6rem)',
      }}
    >
      <div className="container mx-auto container-padding max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] 3xl:max-w-[1800px]">
        {children}
      </div>
    </section>
  )
}

export default Section
