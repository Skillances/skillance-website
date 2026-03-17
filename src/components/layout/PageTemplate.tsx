import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PageTemplateProps {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
  animateSections?: boolean;
}

const PageTemplate = ({ title, children, dark = false, animateSections = false }: PageTemplateProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!animateSections || !contentRef.current) return;

    const sections = contentRef.current.querySelectorAll('section');
    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, contentRef);

    return () => ctx.revert();
  }, [animateSections]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="pt-32 pb-24 lg:pt-48 lg:pb-40"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className={`font-serif text-5xl lg:text-7xl mb-12 lg:mb-16 ${dark ? 'text-white' : 'text-black'}`}>
          {title}
        </h1>
        <div
          ref={contentRef}
          className={`prose prose-lg max-w-none ${dark ? 'prose-invert' : 'prose-neutral'} ${animateSections ? 'legal-prose' : ''}`}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default PageTemplate;
