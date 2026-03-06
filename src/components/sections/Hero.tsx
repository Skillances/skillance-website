import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';


gsap.registerPlugin(ScrollTrigger);

// Custom inline word rotate
const InlineWordRotate = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="italic"
        style={{ width: '100%', display: 'inline-block' }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect on hero image
      gsap.to(imageRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Text reveal animation
      gsap.fromTo(textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 2, // Wait for loader to finish
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div 
        ref={imageRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <picture className="w-full h-full block">
          <source 
            media="(max-width: 1023px)" 
            srcSet="/hero-image-portrait.jpg" 
          />
          <img
            src="/hero-image.jpg"
            alt="Skillance"
            className="w-full h-full object-cover"
          />
        </picture>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content - Minimal like Hinge */}
      <div 
        ref={textRef}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
      >
        <h1 className="font-serif text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.1] max-w-4xl flex flex-col items-center">
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline sm:gap-4">
            <span>The</span>
            <span style={{ width: '11ch' }}>
              <InlineWordRotate words={['marketplace', 'platform', 'community', 'network', 'ecosystem']} />
            </span>
          </div>
          <span className="italic mt-4">designed for trust.</span>
        </h1>
      </div>
    </section>
  );
};


export default Hero;
